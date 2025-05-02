// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ararat::open_shift_jis_file;
use std::path::PathBuf;

// ファイルを開くコマンド
#[tauri::command]
fn open_file(path: String) -> Result<String, String> {
    open_shift_jis_file(&path).map_err(|e| e.to_string())
}

// 最近開いたファイル履歴を管理するための関数
#[tauri::command]
fn add_to_recent_files(path: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    // アプリケーション状態からrecent_filesを取得または初期化
    let app_state = app_handle.state::<tauri::State<AppState>>();
    let mut recent_files = app_state.recent_files.lock().map_err(|e| e.to_string())?;

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
fn get_recent_files(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let app_state = app_handle.state::<tauri::State<AppState>>();
    let recent_files = app_state.recent_files.lock().map_err(|e| e.to_string())?;
    Ok(recent_files.clone())
}

// アプリケーション状態を定義
#[derive(Default)]
struct AppState {
    recent_files: std::sync::Mutex<Vec<String>>,
}

fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            open_file,
            add_to_recent_files,
            get_recent_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
