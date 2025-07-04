use mascot_nanai_ui::open_shift_jis_file;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::path::PathBuf;
use tauri::Emitter;
use tauri::Manager;

// Desktop専用の機能
#[cfg(desktop)]
use tauri::image::Image;
#[cfg(desktop)]
use tauri::menu::MenuBuilder;
#[cfg(desktop)]
use tauri::tray::{TrayIconBuilder, TrayIconEvent};

// SHIORI関連モジュール（一時的にコメントアウト）
// mod shiori_cpp_integration;
// mod shiori_manager;

// use shiori_manager::{GhostInfo, ShioriManager};

// 簡易ゴースト情報
#[derive(Debug, Clone, serde::Serialize)]
struct GhostInfo {
    name: String,
    path: String,
}

// アプリケーション状態を定義
struct AppState {
    recent_files: std::sync::Mutex<Vec<String>>,
    // shiori_manager: Arc<ShioriManager>,
}

impl AppState {
    fn new() -> Self {
        AppState {
            recent_files: std::sync::Mutex::new(Vec::new()),
            // shiori_manager: ShioriManager::new(),
        }
    }
}

// エラーメッセージを全ウィンドウにemitするヘルパー関数
fn emit_error_to_all(app_handle: &tauri::AppHandle<tauri::Wry>, msg: String) {
    if let Some(window) = app_handle.get_webview_window("main") {
        if let Err(err) = window.emit("error", msg.clone()) {
            eprintln!("emit failed: {err}");
        }
    }
}
// ファイルを開くコマンド
#[tauri::command]
fn open_file(path: String, app_handle: tauri::AppHandle<tauri::Wry>) -> Result<String, String> {
    match open_shift_jis_file(&path) {
        Ok(content) => Ok(content),
        Err(e) => {
            let msg = e.to_string();
            eprintln!("open_file error: {msg}");
            emit_error_to_all(&app_handle, msg.clone());
            Err(msg)
        }
    }
}

// 最近開いたファイル履歴を管理するための関数
#[tauri::command]
fn add_to_recent_files(
    path: String,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<(), String> {
    let app_state = app_handle.state::<tauri::State<AppState>>();
    let mut recent_files = match app_state.recent_files.lock() {
        Ok(lock) => lock,
        Err(e) => {
            let msg = e.to_string();
            eprintln!("add_to_recent_files lock error: {msg}");
            emit_error_to_all(&app_handle, msg.clone());
            return Err(msg);
        }
    };

    // 既に存在する場合は削除して先頭に追加（LRU方式）
    if let Some(index) = recent_files.iter().position(|x| *x == path) {
        recent_files.remove(index);
    }

    // 先頭に追加
    recent_files.insert(0, path);

    // 最大10件まで保持
    if recent_files.len() > 10 {
        recent_files.truncate(10);
    }

    Ok(())
}

#[tauri::command]
fn get_recent_files(app_handle: tauri::AppHandle<tauri::Wry>) -> Result<Vec<String>, String> {
    let app_state = app_handle.state::<tauri::State<AppState>>();
    let recent_files = match app_state.recent_files.lock() {
        Ok(lock) => lock,
        Err(e) => {
            let msg = e.to_string();
            eprintln!("get_recent_files lock error: {msg}");
            emit_error_to_all(&app_handle, msg.clone());
            return Err(msg);
        }
    };
    Ok(recent_files.clone())
}

// ========================================
// SHIORI関連のTauriコマンド
// ========================================

/// ゴーストスキャン結果
#[derive(Debug, Clone, serde::Serialize)]
struct ScanResult {
    ghosts: Vec<GhostInfo>,
    resolved_path: String,
    input_path: String,
}

/// ゴーストディレクトリをスキャンしてSHIORIを検出
#[tauri::command]
async fn scan_ghost_directory(
    _state: tauri::State<'_, AppState>,
    ghost_dir: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    // アプリのパスコンテキストを取得
    let ghost_path = resolve_asset_path(&ghost_dir, &app_handle)?;

    println!("🔍 Input path: {}", ghost_dir);
    println!("🔍 Resolved absolute path: {:?}", ghost_path);

    // 簡易ゴーストスキャン（mock_nanaiのみ検出）
    let mut ghosts = Vec::new();

    // mock_nanaiが存在するかチェック
    let mock_nanai_path = ghost_path.join("mock_nanai");
    if mock_nanai_path.exists() {
        ghosts.push(GhostInfo {
            name: "mock_nanai".to_string(),
            path: mock_nanai_path.to_string_lossy().to_string(),
        });
    }

    let result = ScanResult {
        ghosts,
        resolved_path: ghost_path.to_string_lossy().to_string(),
        input_path: ghost_dir,
    };

    println!("📊 Scan completed: {} ghosts found", result.ghosts.len());

    Ok(result)
}

/// アセットパスを解決（開発/本番環境対応）
fn resolve_asset_path(
    relative_path: &str,
    app_handle: &tauri::AppHandle,
) -> Result<PathBuf, String> {
    let path = PathBuf::from(relative_path);

    if path.is_absolute() {
        return Ok(path);
    }

    // 複数のパス候補を試す
    let path_candidates = vec![
        // 1. 開発モード: プロジェクトルート/assets/...
        {
            let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
            let project_root = current_dir
                .ancestors()
                .find(|p| p.join("Cargo.toml").exists() || p.join("src").exists())
                .unwrap_or(&current_dir);
            project_root.join(&path)
        },
        // 2. 本番モード: リソースディレクトリ
        app_handle
            .path()
            .resource_dir()
            .map(|resource_dir| resource_dir.join(&path))
            .unwrap_or_else(|_| PathBuf::from(&path)),
        // 3. 実行ファイル隣接
        app_handle
            .path()
            .app_data_dir()
            .map(|app_dir| app_dir.join(&path))
            .unwrap_or_else(|_| PathBuf::from(&path)),
        // 4. カレントディレクトリからの相対パス
        std::env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(&path),
    ];

    // 存在するパスを見つける
    for candidate in path_candidates {
        println!("🔍 Checking path candidate: {:?}", candidate);
        if candidate.exists() {
            // パスを正規化（../などを解決）
            let normalized = normalize_path(&candidate);
            println!("✅ Found valid path: {:?}", candidate);
            println!("🔧 Normalized path: {:?}", normalized);
            return Ok(normalized);
        }
    }

    // 見つからない場合は最初の候補を返す（デバッグ用）
    let fallback = std::env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join(&path);

    println!("⚠️ No valid path found, using fallback: {:?}", fallback);
    Ok(normalize_path(&fallback))
}

/// パスを正規化（../などを解決）
fn normalize_path(path: &PathBuf) -> PathBuf {
    // canonicalize()でパスを正規化を試みる
    if let Ok(canonical) = path.canonicalize() {
        canonical
    } else {
        // canonicalize()が失敗した場合は手動でパスを正規化
        let mut components = Vec::new();
        for component in path.components() {
            match component {
                std::path::Component::ParentDir => {
                    components.pop();
                }
                std::path::Component::CurDir => {
                    // "."は無視
                }
                _ => {
                    components.push(component);
                }
            }
        }
        components.iter().collect()
    }
}

/// ゴーストを読み込み（簡易版）
#[tauri::command]
async fn load_ghost(
    _state: tauri::State<'_, AppState>,
    ghost_name: String,
) -> Result<String, String> {
    println!("📥 Loading ghost: {}", ghost_name);
    Ok(format!(
        "Ghost '{}' loaded successfully (simplified)",
        ghost_name
    ))
}

/// SHIORIにリクエストを送信（簡易版）
#[tauri::command]
async fn send_shiori_request(
    _state: tauri::State<'_, AppState>,
    request: String,
) -> Result<String, String> {
    println!("📤 SHIORI Request: {}", request);
    Ok("Hello from simplified SHIORI!".to_string())
}

/// SHIORIにイベントを送信（簡易版）
#[tauri::command]
async fn send_shiori_event(
    _state: tauri::State<'_, AppState>,
    event: String,
) -> Result<String, String> {
    println!("📤 SHIORI Event: {}", event);
    match event.as_str() {
        "OnMouseClick" => Ok("クリックされました！".to_string()),
        "OnBoot" => Ok("こんにちは！マスコットナナイです。".to_string()),
        _ => Ok("こんにちは！".to_string()),
    }
}

/// マウスクリックイベントを送信（簡易版）
#[tauri::command]
async fn on_mouse_click() -> Result<String, String> {
    println!("🖱️ Mouse click event");
    Ok("Mouse clicked".to_string())
}

/// 秒数変化イベントを送信（簡易版）
#[tauri::command]
async fn on_second_change() -> Result<String, String> {
    // 無音で実行
    Ok("Second changed".to_string())
}

/// 現在のゴースト情報を取得（簡易版）
#[tauri::command]
async fn get_current_ghost(
    _state: tauri::State<'_, AppState>,
) -> Result<Option<GhostInfo>, String> {
    // 実際にはゴーストが選択されていない場合はNoneを返す
    Ok(None)
}

/// すべてのゴースト情報を取得（簡易版）
#[tauri::command]
async fn get_all_ghosts(_state: tauri::State<'_, AppState>) -> Result<Vec<GhostInfo>, String> {
    // 実際のスキャン結果のみを返す（空の場合は空配列）
    Ok(vec![])
}

/// SHIORIの状態を取得（簡易版）
#[tauri::command]
async fn get_shiori_status(_state: tauri::State<'_, AppState>) -> Result<bool, String> {
    Ok(true) // 常にロード済みとする
}

/// 現在のゴーストを終了（簡易版）
#[tauri::command]
async fn unload_current_ghost(_state: tauri::State<'_, AppState>) -> Result<String, String> {
    Ok("Ghost unloaded successfully (simplified)".to_string())
}

/// 簡易ゴーストスキャン（JavaScriptから呼び出し用）
#[tauri::command]
async fn scan_ghosts(
    state: tauri::State<'_, AppState>,
    ghost_path: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    // ghost_pathをghost_dirとしてscan_ghost_directoryに渡す
    scan_ghost_directory(state, ghost_path, app_handle).await
}

/// デバッグ用のテストコマンド
#[tauri::command]
async fn test_command() -> Result<String, String> {
    Ok("SHIORI統合テスト成功!".to_string())
}

// ========================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                let icon = app
                    .default_window_icon()
                    .cloned()
                    .unwrap_or_else(|| Image::new_owned(vec![0, 0, 0, 0], 1, 1));
                let app_handle = app.app_handle().clone();
                let _tray = TrayIconBuilder::new()
                    .icon(icon)
                    .on_tray_icon_event(move |_tray, event| match event {
                        TrayIconEvent::Click { .. } => {
                            if let Some(window) = app_handle.get_webview_window("main") {
                                if let Err(e) =
                                    window.emit("error", "Failed to show window".to_string())
                                {
                                    eprintln!("emit failed: {e}");
                                }
                            } else {
                                let msg = "main window not found".to_string();
                                eprintln!("{msg}");
                                emit_error_to_all(&app_handle, msg.clone());
                            }
                        }
                        _ => {}
                    })
                    .build(app)?;
                let menu = MenuBuilder::new(app)
                    .text("open", "Open")
                    .text("close", "Close")
                    .build()?;

                app.set_menu(menu)?;
            }
            Ok(())
        })
        .manage(AppState::new())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            open_file,
            add_to_recent_files,
            get_recent_files,
            scan_ghost_directory,
            scan_ghosts,
            load_ghost,
            send_shiori_request,
            send_shiori_event,
            on_mouse_click,
            on_second_change,
            get_current_ghost,
            get_all_ghosts,
            get_shiori_status,
            unload_current_ghost,
            test_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
