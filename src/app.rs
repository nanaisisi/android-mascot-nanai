#![allow(non_snake_case)]

use dioxus::prelude::*;
use serde::{Deserialize, Serialize};
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

pub fn App() -> Element {
    // shell画像のテスト表示（sample/ghost/emily4/shell/master/surface0000.png）
    rsx! {
        link { rel: "stylesheet", href: "styles.css" }
        main { class: "container",
            h1 { "ゴーストキャラクター表示テスト" }
            div { style: "background: #222; padding: 2em; border-radius: 1em; width: fit-content; margin: 2em auto;",
                img {
                    src: "/sample/ghost/emily4/shell/master/surface0000.png",
                    style: "image-rendering: pixelated; background: transparent; width: 320px; height: 320px;",
                }
            }
            p {
                "surface0000.png（キャラクター本体画像）が透過PNGとして正しく表示されていればOKです。"
            }
        }
    }
}
