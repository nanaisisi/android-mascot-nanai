use mascot_nanai_ui::open_shift_jis_file;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::path::PathBuf;
use std::sync::Arc;
use tauri::Emitter;
use tauri::Manager;

// Desktop専用の機能
#[cfg(desktop)]
use tauri::menu::MenuBuilder;
#[cfg(desktop)]
use tauri::image::Image;
#[cfg(desktop)]
use tauri::tray::{TrayIconBuilder, TrayIconEvent};

// SHIORI関連モジュール
mod shiori_cpp_integration;
mod shiori_manager;

use shiori_manager::{GhostInfo, ShioriManager};

// アプリケーション状態を定義
struct AppState {
    recent_files: std::sync::Mutex<Vec<String>>,
    shiori_manager: Arc<ShioriManager>,
}

impl AppState {
    fn new() -> Self {
        AppState {
            recent_files: std::sync::Mutex::new(Vec::new()),
            shiori_manager: ShioriManager::new(),
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

/// ゴーストディレクトリをスキャンしてSHIORIを検出
#[tauri::command]
async fn scan_ghost_directory(
    state: tauri::State<'_, AppState>,
    ghost_dir: String,
) -> Result<Vec<GhostInfo>, String> {
    // パスが相対パスの場合はワークスペースルートからの絶対パスに変換
    let ghost_path = {
        let path = PathBuf::from(&ghost_dir);
        if path.is_absolute() {
            path
        } else {
            // src-tauri/../assets/ghost のように解決
            let exe_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
            let project_root = exe_dir.parent().unwrap_or(&exe_dir);
            project_root.join(path)
        }
    };

    state.shiori_manager.scan_ghost_directory(&ghost_path)?;

    let ghosts = state.shiori_manager.get_all_ghosts();
    Ok(ghosts.into_values().collect())
}

/// ゴーストを読み込み
#[tauri::command]
async fn load_ghost(
    state: tauri::State<'_, AppState>,
    ghost_name: String,
) -> Result<String, String> {
    state.shiori_manager.load_ghost(&ghost_name)?;
    Ok(format!("Ghost '{}' loaded successfully", ghost_name))
}

/// SHIORIにリクエストを送信
#[tauri::command]
async fn send_shiori_request(
    state: tauri::State<'_, AppState>,
    request: String,
) -> Result<String, String> {
    state.shiori_manager.send_request(&request)
}

/// SHIORIにイベントを送信
#[tauri::command]
async fn send_shiori_event(
    state: tauri::State<'_, AppState>,
    event: String,
    references: Vec<String>,
) -> Result<String, String> {
    let refs: Vec<&str> = references.iter().map(|s| s.as_str()).collect();
    state.shiori_manager.send_event(&event, &refs)
}

/// マウスクリックイベントを送信
#[tauri::command]
async fn on_mouse_click(
    state: tauri::State<'_, AppState>,
    x: i32,
    y: i32,
    button: String,
) -> Result<String, String> {
    state.shiori_manager.on_mouse_click(x, y, &button)
}

/// 秒数変化イベントを送信
#[tauri::command]
async fn on_second_change(state: tauri::State<'_, AppState>) -> Result<String, String> {
    state.shiori_manager.on_second_change()
}

/// 現在のゴースト情報を取得
#[tauri::command]
async fn get_current_ghost(state: tauri::State<'_, AppState>) -> Result<Option<GhostInfo>, String> {
    match state.shiori_manager.current_ghost() {
        Some(ghost_name) => Ok(state.shiori_manager.get_ghost_info(&ghost_name)),
        None => Ok(None),
    }
}

/// すべてのゴースト情報を取得
#[tauri::command]
async fn get_all_ghosts(state: tauri::State<'_, AppState>) -> Result<Vec<GhostInfo>, String> {
    let ghosts = state.shiori_manager.get_all_ghosts();
    Ok(ghosts.into_values().collect())
}

/// SHIORIの状態を取得
#[tauri::command]
async fn get_shiori_status(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    Ok(state.shiori_manager.is_shiori_loaded())
}

/// 現在のゴーストを終了
#[tauri::command]
async fn unload_current_ghost(state: tauri::State<'_, AppState>) -> Result<String, String> {
    state.shiori_manager.unload_current_ghost()?;
    Ok("Ghost unloaded successfully".to_string())
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
            Ok(())
        })
        .manage(AppState::new())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            open_file,
            add_to_recent_files,
            get_recent_files,
            scan_ghost_directory,
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
