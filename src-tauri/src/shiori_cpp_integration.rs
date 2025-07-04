/*!
 * SHIORI C++ Integration Module
 *
 * YAYAとSATORIYAのC++ソースコードを直接Rustに統合し、
 * FFI経由でSHIORI/3.0プロトコルを実装する
 */

use once_cell::sync::Lazy;
use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_int, c_long};
use std::sync::{Arc, Mutex};

// YAYA C++関数への外部宣言
unsafe extern "C" {
    // YAYA内部初期化関数（C++側で実装）
    fn yaya_initialize() -> c_int;
    fn yaya_finalize() -> c_int;
    fn yaya_set_directory(dir: *const c_char) -> c_int;

    // SHIORI/3.0標準関数（YAYA C++実装）
    fn yaya_load(h: c_long, length: c_long) -> c_int;
    fn yaya_unload() -> c_int;
    fn yaya_request(h: c_long, length: *mut c_long) -> *mut c_char;

    // YAYA特殊関数
    fn yaya_get_version() -> *const c_char;
    fn yaya_set_encoding(encoding: c_int) -> c_int;
}

// SATORIYA関数への外部宣言（将来実装用）
unsafe extern "C" {
    // 雛形 - SATORIYA実装時に追加
    fn satoriya_initialize() -> c_int;
    fn satoriya_finalize() -> c_int;
}

/// SHIORI エンジンタイプ
#[derive(Debug, Clone, PartialEq)]
pub enum EngineType {
    YAYA,
    SATORIYA,
    None,
}

/// SHIORI実行状態
#[derive(Debug)]
struct ShioriState {
    engine: EngineType,
    initialized: bool,
    ghost_path: Option<String>,
}

/// グローバルSHIORIステート（シングルトン）
static SHIORI_STATE: Lazy<Arc<Mutex<ShioriState>>> = Lazy::new(|| {
    Arc::new(Mutex::new(ShioriState {
        engine: EngineType::None,
        initialized: false,
        ghost_path: None,
    }))
});

/// YAYA SHIORI 統合クラス
pub struct YayaEngine;

impl YayaEngine {
    /// YAYA初期化
    pub fn initialize(ghost_dir: &str) -> Result<(), String> {
        let mut state = SHIORI_STATE
            .lock()
            .map_err(|_| "Failed to lock SHIORI state")?;

        if state.initialized && state.engine == EngineType::YAYA {
            return Ok(());
        }

        // 既存エンジンの終了
        if state.initialized {
            Self::cleanup_internal(&mut state)?;
        }

        let dir_cstr = CString::new(ghost_dir).map_err(|_| "Invalid ghost directory path")?;

        unsafe {
            // YAYA初期化
            let result = yaya_initialize();
            if result != 1 {
                return Err(format!("YAYA initialization failed: {}", result));
            }

            // ディレクトリ設定
            let result = yaya_set_directory(dir_cstr.as_ptr());
            if result != 1 {
                yaya_finalize();
                return Err(format!("Failed to set YAYA directory: {}", result));
            }

            // エンコーディング設定 (UTF-8 = 65001)
            yaya_set_encoding(65001);
        }

        state.engine = EngineType::YAYA;
        state.initialized = true;
        state.ghost_path = Some(ghost_dir.to_string());

        Ok(())
    }

    /// SHIORI load実行
    pub fn load() -> Result<i32, String> {
        let state = SHIORI_STATE
            .lock()
            .map_err(|_| "Failed to lock SHIORI state")?;

        if !state.initialized || state.engine != EngineType::YAYA {
            return Err("YAYA not initialized".to_string());
        }

        unsafe {
            let result = yaya_load(0, 0);
            Ok(result)
        }
    }

    /// SHIORI unload実行
    pub fn unload() -> Result<i32, String> {
        let state = SHIORI_STATE
            .lock()
            .map_err(|_| "Failed to lock SHIORI state")?;

        if !state.initialized || state.engine != EngineType::YAYA {
            return Err("YAYA not initialized".to_string());
        }

        unsafe {
            let result = yaya_unload();
            Ok(result)
        }
    }

    /// SHIORI request実行
    pub fn request(input: &str) -> Result<String, String> {
        let state = SHIORI_STATE
            .lock()
            .map_err(|_| "Failed to lock SHIORI state")?;

        if !state.initialized || state.engine != EngineType::YAYA {
            return Err("YAYA not initialized".to_string());
        }

        let input_cstr = CString::new(input).map_err(|_| "Invalid input string")?;

        unsafe {
            let mut output_length: c_long = 0;
            let input_ptr = input_cstr.as_ptr() as c_long;

            let output_ptr = yaya_request(input_ptr, &mut output_length);

            if output_ptr.is_null() {
                return Err("YAYA request failed".to_string());
            }

            let output_cstr = CStr::from_ptr(output_ptr);
            let output = output_cstr.to_string_lossy().into_owned();

            Ok(output)
        }
    }

    /// YAYAバージョン取得
    pub fn get_version() -> Result<String, String> {
        unsafe {
            let version_ptr = yaya_get_version();
            if version_ptr.is_null() {
                return Err("Failed to get YAYA version".to_string());
            }

            let version_cstr = CStr::from_ptr(version_ptr);
            Ok(version_cstr.to_string_lossy().into_owned())
        }
    }

    /// YAYA終了
    pub fn finalize() -> Result<(), String> {
        let mut state = SHIORI_STATE
            .lock()
            .map_err(|_| "Failed to lock SHIORI state")?;

        Self::cleanup_internal(&mut state)
    }

    fn cleanup_internal(state: &mut std::sync::MutexGuard<ShioriState>) -> Result<(), String> {
        if state.initialized && state.engine == EngineType::YAYA {
            unsafe {
                yaya_finalize();
            }
        }

        state.engine = EngineType::None;
        state.initialized = false;
        state.ghost_path = None;

        Ok(())
    }
}

/// SATORIYA SHIORI 統合クラス（将来実装）
pub struct SatoriyaEngine;

impl SatoriyaEngine {
    pub fn initialize(_ghost_dir: &str) -> Result<(), String> {
        Err("SATORIYA engine not yet implemented".to_string())
    }

    pub fn load() -> Result<i32, String> {
        Err("SATORIYA engine not yet implemented".to_string())
    }

    pub fn unload() -> Result<i32, String> {
        Err("SATORIYA engine not yet implemented".to_string())
    }

    pub fn request(_input: &str) -> Result<String, String> {
        Err("SATORIYA engine not yet implemented".to_string())
    }
}

/// 統合SHIORIインターフェイス
pub struct IntegratedShiori;

impl IntegratedShiori {
    /// 自動検出してSHIORI初期化
    pub fn initialize_auto(ghost_dir: &str) -> Result<EngineType, String> {
        // YAYA検出ロジック（yaya.txt, aya.dll等）
        let ghost_path = std::path::Path::new(ghost_dir);

        if ghost_path.join("yaya.txt").exists()
            || ghost_path.join("aya.dll").exists()
            || ghost_path.join("yaya.dll").exists()
        {
            YayaEngine::initialize(ghost_dir)?;
            return Ok(EngineType::YAYA);
        }

        // SATORIYA検出ロジック（satori.dll等）
        if ghost_path.join("satori.dll").exists() {
            // SatoriyaEngine::initialize(ghost_dir)?;
            return Err("SATORIYA detected but not yet supported".to_string());
        }

        Err("No compatible SHIORI engine detected".to_string())
    }

    /// 現在のエンジンタイプ取得
    pub fn current_engine() -> Result<EngineType, String> {
        let state = SHIORI_STATE
            .lock()
            .map_err(|_| "Failed to lock SHIORI state")?;

        Ok(state.engine.clone())
    }

    /// SHIORIリクエスト実行（エンジン自動判定）
    pub fn request(input: &str) -> Result<String, String> {
        let engine_type = Self::current_engine()?;

        match engine_type {
            EngineType::YAYA => YayaEngine::request(input),
            EngineType::SATORIYA => SatoriyaEngine::request(input),
            EngineType::None => Err("No SHIORI engine initialized".to_string()),
        }
    }

    /// SHIORIロード実行
    pub fn load() -> Result<i32, String> {
        let engine_type = Self::current_engine()?;

        match engine_type {
            EngineType::YAYA => YayaEngine::load(),
            EngineType::SATORIYA => SatoriyaEngine::load(),
            EngineType::None => Err("No SHIORI engine initialized".to_string()),
        }
    }

    /// SHIORIアンロード実行
    pub fn unload() -> Result<i32, String> {
        let engine_type = Self::current_engine()?;

        match engine_type {
            EngineType::YAYA => YayaEngine::unload(),
            EngineType::SATORIYA => SatoriyaEngine::unload(),
            EngineType::None => Err("No SHIORI engine initialized".to_string()),
        }
    }

    /// 全SHIORI終了
    pub fn finalize() -> Result<(), String> {
        let engine_type = Self::current_engine()?;

        match engine_type {
            EngineType::YAYA => YayaEngine::finalize(),
            EngineType::SATORIYA => Ok(()), // 未実装
            EngineType::None => Ok(()),
        }
    }
}
