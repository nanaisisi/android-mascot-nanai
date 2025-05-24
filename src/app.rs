#![allow(non_snake_case)]

use dioxus::prelude::*;
use serde::{Deserialize, Serialize};

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

    let current_file_idx = state.read().current_file;
    let file = current_file_idx.map(|idx| state.read().files[idx].clone());

    return rsx! {
        div { class: "container",
            header { class: "app-header",
                h1 { "Shift-JIS File Viewer" }
            }
            link { rel: "stylesheet", href: "styles.css" }
            // ウィンドウ移動用のドラッグエリアdivを追加
            div { style: "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;-webkit-app-region:drag;pointer-events:auto;" }
            main { class: "container",
                h1 { "Welcome to Tauri + Dioxus" }
                div { class: "app-content",
                    div { class: "sidebar",
                        h3 { "最近開いたファイル" }
                        if loading.read().clone() {
                            p { "読み込み中..." }
                        } else {
                            ul {
                                if state.read().recent_files.is_empty() {
                                    li { "最近開いたファイルはありません" }
                                } else {
                                    {
                                        state
                                            .read()
                                            .recent_files
                                            .iter()
                                            .map(|path| {
                                                let path_clone = path.clone();
                                                rsx! {
                                                    li { key: "{path}",
                                                        button { "{extract_filename(&path_clone)}" }
                                                    }
                                                }
                                            })
                                    }
                                }
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
                        if let Some(file) = file {
                            if let Some(error) = &file.error {
                                div { class: "file-view",
                                    h2 { "{extract_filename(&file.path)}" }
                                    div { class: "error", "エラー: {error}" }
                                }
                            } else if let Some(content) = &file.content {
                                div { class: "file-view",
                                    h2 { "{extract_filename(&file.path)}" }
                                    pre { class: "file-content", "{content}" }
                                }
                            } else {
                                div { class: "file-view",
                                    h2 { "{extract_filename(&file.path)}" }
                                    p { "ファイルを読み込み中..." }
                                }
                            }
                        } else {
                            div { class: "welcome",
                                h2 { "Shift-JIS File Viewerへようこそ" }
                                p {
                                    "サイドバーからファイルを選択するか、「ファイルを開く」ボタンをクリックしてください。"
                                }
                            }
                        }
                    }
                }
            }
        }
    };
}

// ファイル名のみを抽出する関数
pub fn extract_filename(path: &str) -> String {
    std::path::Path::new(path)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or(path)
        .to_string()
}

// ファイル選択ダイアログを開く関数
#[allow(unused)]
pub async fn open_file_dialog(_state: Signal<AppState>) {
    // Webビルドでは未実装
}

// ファイルを開く関数
#[allow(unused)]
pub fn open_file(_path: String, _state: Signal<AppState>) {
    // Webビルドでは未実装
}
