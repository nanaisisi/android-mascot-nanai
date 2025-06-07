#![allow(non_snake_case)]
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = ["window", "__TAURI__", "core"])]
    async fn invoke(cmd: &str, args: JsValue) -> JsValue;
}

#[derive(Serialize, Deserialize)]
struct GreetArgs<'a> {
    name: &'a str,
}

/// ghostディレクトリのパスを取得
fn get_ghost_dir() -> PathBuf {
    // プロジェクトルート直下のghostディレクトリ
    PathBuf::from("ghost")
}

/// ghostディレクトリ直下のディレクトリ一覧を取得
fn get_ghost_dir_list() -> Vec<String> {
    let ghost_dir = get_ghost_dir();
    let mut list = Vec::new();
    if let Ok(entries) = fs::read_dir(&ghost_dir) {
        for entry in entries.flatten() {
            if entry.path().is_dir() {
                if let Some(name) = entry.file_name().to_str() {
                    list.push(name.to_string());
                }
            }
        }
    }
    list
}
