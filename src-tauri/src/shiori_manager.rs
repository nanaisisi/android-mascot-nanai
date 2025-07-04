//! SHIORI Manager
//!
//! ゴーストディレクトリの検出、SHIORI種別の判定、実行管理を行う

use crate::shiori_cpp_integration::{EngineType, IntegratedShiori};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use walkdir::WalkDir;
/// SHIORIの種類
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ShioriType {
    YAYA,
    SATORIYA,
    Unknown(String),
}

impl From<EngineType> for ShioriType {
    fn from(engine: EngineType) -> Self {
        match engine {
            EngineType::YAYA => ShioriType::YAYA,
            EngineType::SATORIYA => ShioriType::SATORIYA,
            EngineType::None => ShioriType::Unknown("None".to_string()),
        }
    }
}

/// ゴーストの情報
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GhostInfo {
    pub name: String,
    pub path: PathBuf,
    pub shiori_type: ShioriType,
    pub shiori_dll: Option<PathBuf>,
    pub description: Option<String>,
    pub craftman: Option<String>,
    pub version: Option<String>,
}

/// SHIORIマネージャー
pub struct ShioriManager {
    ghosts: RwLock<HashMap<String, GhostInfo>>,
    current_ghost: RwLock<Option<String>>,
    active_engine: RwLock<Option<EngineType>>,
}

impl ShioriManager {
    pub fn new() -> Arc<Self> {
        Arc::new(ShioriManager {
            ghosts: RwLock::new(HashMap::new()),
            current_ghost: RwLock::new(None),
            active_engine: RwLock::new(None),
        })
    }

    /// ゴーストディレクトリをスキャンしてSHIORIを検出
    pub fn scan_ghost_directory(&self, ghost_dir: &Path) -> Result<(), String> {
        if !ghost_dir.exists() {
            return Err(format!("Ghost directory not found: {:?}", ghost_dir));
        }

        let mut found_ghosts = HashMap::new();

        // ゴーストディレクトリ内を再帰的に検索
        for entry in WalkDir::new(ghost_dir).max_depth(3) {
            let entry = entry.map_err(|e| format!("Directory walk error: {}", e))?;
            let path = entry.path();

            // descript.txtファイルを探す
            if path.file_name() == Some("descript.txt".as_ref()) {
                if let Some(ghost_path) = path.parent() {
                    if let Ok(ghost_info) = self.analyze_ghost_directory(ghost_path) {
                        found_ghosts.insert(ghost_info.name.clone(), ghost_info);
                    }
                }
            }
        }

        // 結果を更新
        let mut ghosts = self.ghosts.write();
        *ghosts = found_ghosts;

        Ok(())
    }

    /// 個別のゴーストディレクトリを解析
    fn analyze_ghost_directory(&self, ghost_path: &Path) -> Result<GhostInfo, String> {
        let descript_path = ghost_path.join("descript.txt");
        let ghost_name = ghost_path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        // descript.txtを読み込み
        let descript_content = fs::read_to_string(&descript_path)
            .map_err(|e| format!("Failed to read descript.txt: {}", e))?;

        let (description, craftman, version) = self.parse_descript(&descript_content);

        // SHIORIファイルを検索
        let (shiori_type, shiori_dll) = self.detect_shiori_type(ghost_path)?;

        Ok(GhostInfo {
            name: ghost_name,
            path: ghost_path.to_path_buf(),
            shiori_type,
            shiori_dll,
            description,
            craftman,
            version,
        })
    }

    /// SHIORIの種類とDLLパスを検出
    fn detect_shiori_type(
        &self,
        ghost_path: &Path,
    ) -> Result<(ShioriType, Option<PathBuf>), String> {
        // DLLファイルを検索
        for entry in WalkDir::new(ghost_path).max_depth(2) {
            let entry = entry.map_err(|e| format!("SHIORI detection error: {}", e))?;
            let path = entry.path();

            if let Some(extension) = path.extension() {
                if extension == "dll" {
                    let file_name = path
                        .file_name()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_lowercase();

                    // YAYA系のDLL
                    if file_name.contains("yaya") || file_name.contains("aya") {
                        return Ok((ShioriType::YAYA, Some(path.to_path_buf())));
                    }

                    // SATORIYA系のDLL
                    if file_name.contains("satori") {
                        return Ok((ShioriType::SATORIYA, Some(path.to_path_buf())));
                    }

                    // 汎用的なSHIORIファイル名
                    if file_name == "shiori.dll" {
                        // DLLの内容やディレクトリ構造から推測
                        let shiori_type = self.guess_shiori_type_from_directory(ghost_path);
                        return Ok((shiori_type, Some(path.to_path_buf())));
                    }
                }
            }
        }

        // DLLが見つからない場合は、ディレクトリ構造から推測
        let shiori_type = self.guess_shiori_type_from_directory(ghost_path);
        Ok((shiori_type, None))
    }

    /// ディレクトリ構造からSHIORIタイプを推測
    fn guess_shiori_type_from_directory(&self, ghost_path: &Path) -> ShioriType {
        // 典型的なYAYAファイルの存在をチェック
        let yaya_files = ["yaya.txt", "yaya_shiori3.dll", "aya5.dll"];
        for yaya_file in &yaya_files {
            if ghost_path.join(yaya_file).exists() {
                return ShioriType::YAYA;
            }
        }

        // 典型的なSATORIYAファイルの存在をチェック
        let satori_files = ["satori.dll", "satori_conf.txt"];
        for satori_file in &satori_files {
            if ghost_path.join(satori_file).exists() {
                return ShioriType::SATORIYA;
            }
        }

        ShioriType::Unknown("No SHIORI detected".to_string())
    }

    /// descript.txtファイルを解析
    fn parse_descript(&self, content: &str) -> (Option<String>, Option<String>, Option<String>) {
        let mut description = None;
        let mut craftman = None;
        let mut version = None;

        for line in content.lines() {
            if let Some((key, value)) = line.split_once(',') {
                match key.trim() {
                    "name" => description = Some(value.trim().to_string()),
                    "craftman" => craftman = Some(value.trim().to_string()),
                    "version" => version = Some(value.trim().to_string()),
                    _ => {}
                }
            }
        }

        (description, craftman, version)
    }

    /// ゴーストを読み込み
    pub fn load_ghost(&self, ghost_name: &str) -> Result<(), String> {
        // 既存のSHIORIを終了
        if let Some(_) = *self.active_engine.read() {
            IntegratedShiori::finalize()?;
            *self.active_engine.write() = None;
        }

        // ゴースト情報を取得
        let ghost_info = {
            let ghosts = self.ghosts.read();
            ghosts
                .get(ghost_name)
                .ok_or_else(|| format!("Ghost not found: {}", ghost_name))?
                .clone()
        };

        // SHIORIを初期化
        let ghost_path_str = ghost_info.path.to_string_lossy();
        let engine_type = IntegratedShiori::initialize_auto(&ghost_path_str)?;

        // SHIORIロード実行
        IntegratedShiori::load()?;

        // OnBootイベントを送信
        let boot_request = "GET SHIORI/3.0\r\nID: OnBoot\r\n\r\n";
        let _boot_response = IntegratedShiori::request(boot_request)?;

        // アクティブなエンジンとして設定
        *self.active_engine.write() = Some(engine_type);
        *self.current_ghost.write() = Some(ghost_name.to_string());

        Ok(())
    }

    /// SHIORIにリクエストを送信
    pub fn send_request(&self, request: &str) -> Result<String, String> {
        if self.active_engine.read().is_none() {
            return Err("No SHIORI engine is active".to_string());
        }

        IntegratedShiori::request(request)
    }

    /// イベントを送信
    pub fn send_event(&self, event: &str, references: &[&str]) -> Result<String, String> {
        if self.active_engine.read().is_none() {
            return Err("No SHIORI engine is active".to_string());
        }

        // SHIORI/3.0リクエスト形式でイベントを構築
        let mut request = format!("GET SHIORI/3.0\r\nID: {}\r\n", event);

        for (i, reference) in references.iter().enumerate() {
            request.push_str(&format!("Reference{}: {}\r\n", i, reference));
        }
        request.push_str("\r\n");

        IntegratedShiori::request(&request)
    }

    /// マウスクリックイベントを送信
    pub fn on_mouse_click(&self, x: i32, y: i32, button: &str) -> Result<String, String> {
        self.send_event("OnMouseClick", &[&x.to_string(), &y.to_string(), button])
    }

    /// 秒数変化イベントを送信
    pub fn on_second_change(&self) -> Result<String, String> {
        self.send_event("OnSecondChange", &[])
    }

    /// 現在読み込まれているゴースト名を取得
    pub fn current_ghost(&self) -> Option<String> {
        self.current_ghost.read().clone()
    }

    /// すべてのゴースト情報を取得
    pub fn get_all_ghosts(&self) -> HashMap<String, GhostInfo> {
        self.ghosts.read().clone()
    }

    /// 特定のゴースト情報を取得
    pub fn get_ghost_info(&self, name: &str) -> Option<GhostInfo> {
        self.ghosts.read().get(name).cloned()
    }

    /// SHIORIの状態を取得
    pub fn is_shiori_loaded(&self) -> bool {
        self.active_engine.read().is_some()
    }

    /// SHIORIを終了
    pub fn unload_current_ghost(&self) -> Result<(), String> {
        // OnCloseイベントを送信
        if self.is_shiori_loaded() {
            let _ = self.send_event("OnClose", &[]);
        }

        // SHIORIを終了
        if self.active_engine.read().is_some() {
            IntegratedShiori::finalize()?;
            *self.active_engine.write() = None;
        }
        *self.current_ghost.write() = None;

        Ok(())
    }
}
