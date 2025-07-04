//! SHIORI FFI Bindings
//!
//! YAYAとSATORIYAのC++コードとのFFI（Foreign Function Interface）定義

use libc::{c_char, c_int, c_long, c_void};
use std::ffi::{CStr, CString};
use std::ptr;

/// SHIORI/3.0プロトコルの戻り値
pub type HGLOBAL = *mut c_void;

/// YAYA SHIORI エクスポート関数の定義
extern "C" {
    // YAYAの主要なエクスポート関数
    pub fn load(h: HGLOBAL, len: c_long) -> c_int;
    pub fn unload() -> c_int;
    pub fn request(h: HGLOBAL, len: *mut c_long) -> HGLOBAL;

    // YAYA固有の関数
    pub fn SHIORI_FW(h: HGLOBAL, len: *mut c_long) -> HGLOBAL;
}

/// SHIORI関数の安全なRustラッパー
pub struct ShioriInterface {
    is_loaded: bool,
}

impl ShioriInterface {
    pub fn new() -> Self {
        ShioriInterface { is_loaded: false }
    }

    /// SHIORIの初期化
    pub fn load(&mut self, dirpath: &str) -> Result<(), String> {
        if self.is_loaded {
            return Err("SHIORI is already loaded".to_string());
        }

        let dirpath_cstring =
            CString::new(dirpath).map_err(|e| format!("Invalid directory path: {}", e))?;

        let dirpath_ptr = dirpath_cstring.as_ptr() as HGLOBAL;
        let dirpath_len = dirpath_cstring.as_bytes().len() as c_long;

        unsafe {
            let result = load(dirpath_ptr, dirpath_len);
            if result == 1 {
                self.is_loaded = true;
                Ok(())
            } else {
                Err(format!("SHIORI load failed with code: {}", result))
            }
        }
    }

    /// SHIORIの終了処理
    pub fn unload(&mut self) -> Result<(), String> {
        if !self.is_loaded {
            return Ok(());
        }

        unsafe {
            let result = unload();
            self.is_loaded = false;

            if result == 1 {
                Ok(())
            } else {
                Err(format!("SHIORI unload failed with code: {}", result))
            }
        }
    }

    /// SHIORIリクエストの送信
    pub fn request(&self, request_str: &str) -> Result<String, String> {
        if !self.is_loaded {
            return Err("SHIORI is not loaded".to_string());
        }

        let request_cstring =
            CString::new(request_str).map_err(|e| format!("Invalid request string: {}", e))?;

        let request_ptr = request_cstring.as_ptr() as HGLOBAL;
        let mut response_len: c_long = 0;

        unsafe {
            let response_ptr = request(request_ptr, &mut response_len);

            if response_ptr.is_null() {
                return Err("SHIORI request returned null".to_string());
            }

            // レスポンスを文字列に変換
            let response_slice =
                std::slice::from_raw_parts(response_ptr as *const u8, response_len as usize);

            // UTF-8として解釈
            let response_str = String::from_utf8_lossy(response_slice).to_string();

            // メモリを解放（YAYAが提供する方法で解放する必要がある）
            // TODO: 適切なメモリ解放方法を実装

            Ok(response_str)
        }
    }

    /// SHIORI/3.0 フレームワークリクエスト
    pub fn shiori_fw(&self, request_str: &str) -> Result<String, String> {
        if !self.is_loaded {
            return Err("SHIORI is not loaded".to_string());
        }

        let request_cstring =
            CString::new(request_str).map_err(|e| format!("Invalid request string: {}", e))?;

        let request_ptr = request_cstring.as_ptr() as HGLOBAL;
        let mut response_len: c_long = 0;

        unsafe {
            let response_ptr = SHIORI_FW(request_ptr, &mut response_len);

            if response_ptr.is_null() {
                return Err("SHIORI_FW request returned null".to_string());
            }

            let response_slice =
                std::slice::from_raw_parts(response_ptr as *const u8, response_len as usize);

            let response_str = String::from_utf8_lossy(response_slice).to_string();

            Ok(response_str)
        }
    }

    pub fn is_loaded(&self) -> bool {
        self.is_loaded
    }
}

impl Drop for ShioriInterface {
    fn drop(&mut self) {
        if self.is_loaded {
            let _ = self.unload();
        }
    }
}

/// SHIORIリクエストの構築ヘルパー
pub struct ShioriRequestBuilder {
    method: String,
    version: String,
    headers: Vec<(String, String)>,
}

impl ShioriRequestBuilder {
    pub fn new() -> Self {
        ShioriRequestBuilder {
            method: "GET".to_string(),
            version: "SHIORI/3.0".to_string(),
            headers: Vec::new(),
        }
    }

    pub fn method(mut self, method: &str) -> Self {
        self.method = method.to_string();
        self
    }

    pub fn header(mut self, key: &str, value: &str) -> Self {
        self.headers.push((key.to_string(), value.to_string()));
        self
    }

    pub fn sender(self, sender: &str) -> Self {
        self.header("Sender", sender)
    }

    pub fn charset(self, charset: &str) -> Self {
        self.header("Charset", charset)
    }

    pub fn event(self, event: &str) -> Self {
        self.header("Event", event)
    }

    pub fn reference(self, index: usize, value: &str) -> Self {
        self.header(&format!("Reference{}", index), value)
    }

    pub fn build(self) -> String {
        let mut request = format!("{} {} {}\r\n", self.method, self.version, self.version);

        for (key, value) in self.headers {
            request.push_str(&format!("{}: {}\r\n", key, value));
        }

        request.push_str("\r\n");
        request
    }
}

/// 便利な関数群
impl ShioriRequestBuilder {
    /// OnBootイベントのリクエストを作成
    pub fn on_boot() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .header("Event", "OnBoot")
            .charset("UTF-8")
    }

    /// OnCloseイベントのリクエストを作成
    pub fn on_close() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .header("Event", "OnClose")
            .charset("UTF-8")
    }

    /// OnMouseClickイベントのリクエストを作成
    pub fn on_mouse_click(x: i32, y: i32, button: &str) -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .header("Event", "OnMouseClick")
            .reference(0, &x.to_string())
            .reference(1, &y.to_string())
            .reference(2, button)
            .charset("UTF-8")
    }

    /// OnSecondChangeイベントのリクエストを作成
    pub fn on_second_change() -> Self {
        ShioriRequestBuilder::new()
            .method("NOTIFY")
            .header("Event", "OnSecondChange")
            .charset("UTF-8")
    }
}
