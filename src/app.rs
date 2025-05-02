#![allow(non_snake_case)]

use dioxus::prelude::*;
use serde::{Deserialize, Serialize};
use std::rc::Rc;

#[derive(Clone, Debug)]
struct FileContent {
    path: String,
    content: Option<String>,
    error: Option<String>,
}

#[derive(Clone, Debug, Default)]
struct AppState {
    files: Vec<FileContent>,
    current_file: Option<usize>,
    recent_files: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct OpenFileResult {
    content: Option<String>,
    error: Option<String>,
}

pub fn App() -> Element {
    let state = use_signal(|| AppState::default());
    let loading = use_signal(|| false);

    // 起動時に最近開いたファイル一覧を取得
    use_effect(move || {
        loading.set(true);
        async move {
            match tauri_sys::tauri::invoke::<_, Vec<String>>("get_recent_files", &()).await {
                Ok(recent_files) => {
                    state.write().recent_files = recent_files;
                }
                Err(e) => {
                    eprintln!("Error getting recent files: {:?}", e);
                }
            }
            loading.set(false);
        }
    });

    rsx! {
        div { class: "container",
            header { class: "app-header",
                h1 { "Shift-JIS File Viewer" }
            }

            div { class: "app-content",
                div { class: "sidebar",
                    h3 { "最近開いたファイル" }
                    if loading.read().clone() {
                        p { "読み込み中..." }
                    } else {
                        ul {
                            state.read().recent_files.iter().map(|path| {
                                let path_clone = path.clone();
                                rsx! {
                                    li {
                                        key: "{path}",
                                        button {
                                            onclick: move |_| {
                                                open_file(path_clone.clone(), state.clone());
                                            },
                                            "{extract_filename(&path_clone)}"
                                        }
                                    }
                                }
                            })
                        }
                    }

                    button {
                        onclick: move |_| {
                            open_file_dialog(state.clone());
                        },
                        "ファイルを開く"
                    }
                }

                div { class: "content",
                    if state.read().current_file.is_some() {
                        let idx = state.read().current_file.unwrap();
                        let file = &state.read().files[idx];
                        rsx! {
                            div { class: "file-view",
                                h2 { "{extract_filename(&file.path)}" }

                                if let Some(error) = &file.error {
                                    div { class: "error",
                                        "エラー: {error}"
                                    }
                                } else if let Some(content) = &file.content {
                                    pre { class: "file-content",
                                        "{content}"
                                    }
                                } else {
                                    p { "ファイルを読み込み中..." }
                                }
                            }
                        }
                    } else {
                        rsx! {
                            div { class: "welcome",
                                h2 { "Shift-JIS File Viewerへようこそ" }
                                p { "サイドバーからファイルを選択するか、「ファイルを開く」ボタンをクリックしてください。" }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ファイル名のみを抽出する関数
fn extract_filename(path: &str) -> String {
    std::path::Path::new(path)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or(path)
        .to_string()
}

// ファイル選択ダイアログを開く関数
async fn open_file_dialog(state: Signal<AppState>) {
    match tauri_sys::dialog::open_dialog(tauri_sys::dialog::OpenDialogOptions {
        multiple: false,
        directory: false,
        ..Default::default()
    })
    .await
    {
        Ok(Some(paths)) => {
            if let Some(path) = paths.get(0) {
                open_file(path.clone(), state);
            }
        }
        Ok(None) => {
            // ユーザーがキャンセル
        }
        Err(e) => {
            eprintln!("Error opening file dialog: {:?}", e);
        }
    }
}

// ファイルを開く関数
fn open_file(path: String, state: Signal<AppState>) {
    let path_clone = path.clone();

    // ファイル読み込み中にUIをブロックしないためにasync/awaitを使用
    wasm_bindgen_futures::spawn_local(async move {
        // Tauri APIを呼び出してファイルを開く
        let result = tauri_sys::tauri::invoke::<_, String>(
            "open_file",
            &serde_json::json!({
                "path": path_clone
            }),
        )
        .await;

        // 結果をUIに反映
        match result {
            Ok(content) => {
                // 最近開いたファイルリストに追加
                let _ = tauri_sys::tauri::invoke::<_, ()>(
                    "add_to_recent_files",
                    &serde_json::json!({
                        "path": path_clone.clone()
                    }),
                )
                .await;

                // 最近開いたファイルリストを再取得
                if let Ok(recent_files) =
                    tauri_sys::tauri::invoke::<_, Vec<String>>("get_recent_files", &()).await
                {
                    state.write().recent_files = recent_files;
                }

                // 既存のファイルを探す
                let mut state_mut = state.write();
                let idx = state_mut.files.iter().position(|f| f.path == path_clone);

                match idx {
                    Some(idx) => {
                        // 既存のファイルを更新
                        state_mut.files[idx].content = Some(content);
                        state_mut.files[idx].error = None;
                        state_mut.current_file = Some(idx);
                    }
                    None => {
                        // 新しいファイルを追加
                        let idx = state_mut.files.len();
                        state_mut.files.push(FileContent {
                            path: path_clone,
                            content: Some(content),
                            error: None,
                        });
                        state_mut.current_file = Some(idx);
                    }
                }
            }
            Err(e) => {
                let mut state_mut = state.write();
                let idx = state_mut.files.iter().position(|f| f.path == path_clone);

                match idx {
                    Some(idx) => {
                        // エラー情報を更新
                        state_mut.files[idx].content = None;
                        state_mut.files[idx].error = Some(e.to_string());
                        state_mut.current_file = Some(idx);
                    }
                    None => {
                        // エラー情報を含む新しいエントリを追加
                        let idx = state_mut.files.len();
                        state_mut.files.push(FileContent {
                            path: path_clone,
                            content: None,
                            error: Some(e.to_string()),
                        });
                        state_mut.current_file = Some(idx);
                    }
                }
            }
        }
    });
}
