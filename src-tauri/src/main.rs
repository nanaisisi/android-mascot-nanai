// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use mascot_nanai_ui::open_shift_jis_file;
use tauri::Emitter;
use tauri::Manager;
use tauri::image::Image;
use tauri::tray::{TrayIconBuilder, TrayIconEvent};

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

// アプリケーション状態を定義
#[derive(Default)]
struct AppState {
    recent_files: std::sync::Mutex<Vec<String>>,
}

fn main() {
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
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            open_file,
            add_to_recent_files,
            get_recent_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    mascot_nanai_lib::run()
}
