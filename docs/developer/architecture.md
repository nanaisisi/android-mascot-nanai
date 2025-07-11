# システムアーキテクチャ - Mascot Nanai

> **AI関与について**: このドキュメントはGitHub Copilotの支援により作成されました。

このドキュメントでは、Mascot Nanaiのシステムアーキテクチャについて詳しく説明します。

## 概要

Mascot Nanaiは、Tauri フレームワークを使用したクロスプラットフォーム・デスクトップマスコットアプリケーションです。フロントエンドにWeb技術（HTML/CSS/JavaScript）、バックエンドにRustを使用し、AI主導開発により構築されています。

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Mascot Nanai                            │
├─────────────────────────────────────────────────────────────┤
│                  Frontend (Web)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Main UI       │  │   Menu System   │  │   Modals        │ │
│  │  (index.html)   │  │ (menu-iframe)   │  │   (overlays)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                     │                     │        │
│           └─────────────────────┼─────────────────────┘        │
│                                 │                              │
├─────────────────────────────────┼─────────────────────────────┤
│                  Tauri Bridge   │                              │
│                                 │                              │
├─────────────────────────────────┼─────────────────────────────┤
│                  Backend (Rust) │                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                Application Core                             │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │   Ghost Manager │  │   SHIORI Engine │  │   UI Controller │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  │           │                     │                     │        │ │
│  │           └─────────────────────┼─────────────────────┘        │ │
│  │                                 │                              │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │                    File System                             │ │ │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │ │
│  │  │  │   Ghost Files   │  │   Config Files  │  │   Asset Files   │ │ │ │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## レイヤー構成

### 1. フロントエンド レイヤー

#### 主要コンポーネント

##### Main UI (`src/index.html`)
- **責務**: メインアプリケーションUI
- **技術**: HTML5 + CSS3 + Vanilla JavaScript
- **機能**:
  - ゴースト表示
  - 基本的なユーザーインタラクション
  - モーダル制御

##### Menu System (`src/menu-iframe.html`)
- **責務**: 独立したメニューシステム
- **技術**: iframe ベースの独立UI
- **機能**:
  - 伺か標準メニューの表示
  - 親ウィンドウとの通信
  - メニュー項目の動的生成

##### Modal System
- **責務**: オーバーレイUI
- **技術**: CSS + JavaScript
- **機能**:
  - ゴースト管理
  - 設定画面
  - デバッグコンソール

#### データフロー

```
User Interaction → JavaScript Event → Tauri Command → Rust Backend
                                                            ↓
UI Update ← JavaScript Handler ← Tauri Event ← Rust Response
```

### 2. Tauri Bridge レイヤー

#### Tauri Commands
```rust
// ゴースト管理
#[tauri::command]
async fn scan_ghosts(ghost_path: String) -> Result<ScanResult, String>

#[tauri::command]
async fn load_ghost(ghost_name: String) -> Result<String, String>

// SHIORI連携
#[tauri::command]
async fn send_shiori_event(event: String) -> Result<String, String>

// 設定管理
#[tauri::command]
async fn save_settings(settings: String) -> Result<(), String>
```

#### Tauri Events
```rust
// UI更新イベント
emit("ghost-loaded", ghost_info);
emit("settings-changed", new_settings);
emit("error-occurred", error_details);
```

### 3. バックエンド レイヤー

#### Application Core

##### Ghost Manager
- **責務**: ゴースト管理
- **機能**:
  - ゴーストファイルのスキャン
  - ゴースト情報の解析
  - ゴーストの読み込み・切り替え

```rust
pub struct GhostManager {
    current_ghost: Option<GhostInfo>,
    ghost_list: Vec<GhostInfo>,
    ghost_directory: PathBuf,
}

impl GhostManager {
    pub fn scan_ghosts(&mut self) -> Result<Vec<GhostInfo>, Error> { ... }
    pub fn load_ghost(&mut self, name: &str) -> Result<GhostInfo, Error> { ... }
    pub fn get_ghost_info(&self, name: &str) -> Option<&GhostInfo> { ... }
}
```

##### SHIORI Engine
- **責務**: SHIORI連携
- **機能**:
  - SHIORI DLLの識別
  - SHIORIプロトコルの実装
  - イベント処理

```rust
pub struct ShioriEngine {
    shiori_type: ShioriType,
    current_ghost: Option<String>,
}

pub enum ShioriType {
    Satori,
    Yaya,
    Static,
}

impl ShioriEngine {
    pub fn detect_shiori_type(&self, ghost_path: &Path) -> ShioriType { ... }
    pub fn send_event(&mut self, event: &str) -> Result<String, Error> { ... }
}
```

##### UI Controller
- **責務**: UI状態管理
- **機能**:
  - ウィンドウ管理
  - イベント処理
  - 設定管理

```rust
pub struct UIController {
    window_state: WindowState,
    settings: AppSettings,
}

impl UIController {
    pub fn update_window_state(&mut self, state: WindowState) { ... }
    pub fn save_settings(&self) -> Result<(), Error> { ... }
    pub fn load_settings(&mut self) -> Result<(), Error> { ... }
}
```

## データ構造

### ゴースト情報

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GhostInfo {
    pub name: String,
    pub path: PathBuf,
    pub description: Option<String>,
    pub author: Option<String>,
    pub version: Option<String>,
    pub shiori_type: ShioriType,
    pub shells: Vec<ShellInfo>,
    pub balloons: Vec<BalloonInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShellInfo {
    pub name: String,
    pub path: PathBuf,
    pub surfaces: Vec<SurfaceInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SurfaceInfo {
    pub id: u32,
    pub file_path: PathBuf,
    pub collision_areas: Vec<CollisionArea>,
}
```

### 設定データ

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub ghost_directory: PathBuf,
    pub current_ghost: Option<String>,
    pub window_position: (i32, i32),
    pub window_size: (u32, u32),
    pub always_on_top: bool,
    pub click_through: bool,
    pub shell_scale: f64,
    pub balloon_scale: f64,
}
```

## ファイル構成

### フロントエンド

```
src/
├── index.html              # メインHTML
├── main.js                 # メインJavaScript
├── styles.css              # メインスタイル
├── menu-iframe.html        # メニューHTML
├── menu-iframe.js          # メニューJavaScript
└── menu-iframe.css         # メニュースタイル
```

### バックエンド

```
src-tauri/
├── src/
│   ├── main.rs            # アプリケーションエントリポイント
│   ├── lib.rs             # ライブラリルート
│   ├── ghost/             # ゴースト管理
│   │   ├── mod.rs
│   │   ├── manager.rs
│   │   └── types.rs
│   ├── shiori/            # SHIORI連携
│   │   ├── mod.rs
│   │   ├── engine.rs
│   │   └── protocol.rs
│   └── ui/                # UI制御
│       ├── mod.rs
│       ├── controller.rs
│       └── events.rs
├── tauri.conf.json        # Tauri設定
└── Cargo.toml            # Rust依存関係
```

## 通信プロトコル

### JavaScript → Rust

```javascript
// Tauri コマンドの呼び出し
import { invoke } from '@tauri-apps/api/tauri';

// ゴーストスキャン
const result = await invoke('scan_ghosts', { 
    ghostPath: '/path/to/ghosts' 
});

// ゴースト読み込み
const ghost = await invoke('load_ghost', { 
    ghostName: 'example_ghost' 
});
```

### Rust → JavaScript

```rust
// イベントの発行
use tauri::Manager;

app.emit_all("ghost-loaded", GhostLoadedPayload {
    name: ghost.name.clone(),
    surfaces: ghost.surfaces.clone(),
})?;
```

### iframe 通信

```javascript
// 親ウィンドウ → iframe
iframe.contentWindow.postMessage({
    type: 'ghost-changed',
    data: ghostInfo
}, '*');

// iframe → 親ウィンドウ
window.parent.postMessage({
    type: 'menu-selected',
    data: { action: 'open-settings' }
}, '*');
```

## セキュリティ

### Tauri セキュリティ

- **CSP (Content Security Policy)**: 厳格なCSP設定
- **API制限**: 必要最小限のAPI露出
- **サンドボックス**: フロントエンドのサンドボックス実行

### ファイルアクセス

```rust
// 安全なファイルアクセス
pub fn safe_read_file(path: &Path) -> Result<String, Error> {
    // パスの検証
    if !path.starts_with(&app_data_dir()) {
        return Err(Error::InvalidPath);
    }
    
    // ファイル読み込み
    std::fs::read_to_string(path)
        .map_err(|e| Error::FileRead(e))
}
```

## パフォーマンス

### 最適化戦略

1. **遅延読み込み**: 大きなリソースの遅延読み込み
2. **キャッシュ**: 頻繁にアクセスするデータのキャッシュ
3. **非同期処理**: 重い処理の非同期実行
4. **リソース管理**: メモリ使用量の最適化

### 監視

```rust
// パフォーマンス監視
#[cfg(debug_assertions)]
mod perf {
    use std::time::Instant;
    
    pub fn measure_time<F, R>(name: &str, f: F) -> R
    where
        F: FnOnce() -> R,
    {
        let start = Instant::now();
        let result = f();
        let duration = start.elapsed();
        println!("{}: {:?}", name, duration);
        result
    }
}
```

## 拡張性

### プラグインシステム（将来対応）

```rust
pub trait Plugin {
    fn name(&self) -> &str;
    fn version(&self) -> &str;
    fn init(&mut self) -> Result<(), Error>;
    fn handle_event(&mut self, event: &Event) -> Result<(), Error>;
}
```

### カスタムSHIORI

```rust
pub trait CustomShiori {
    fn process_request(&mut self, request: &str) -> Result<String, Error>;
    fn get_random_talk(&self) -> Result<String, Error>;
    fn update_aitalk_interval(&mut self, interval: u32);
}
```

## 開発・デバッグ

### ログシステム

```rust
use log::{info, warn, error, debug};

// ログレベル設定
#[cfg(debug_assertions)]
const LOG_LEVEL: log::LevelFilter = log::LevelFilter::Debug;

#[cfg(not(debug_assertions))]
const LOG_LEVEL: log::LevelFilter = log::LevelFilter::Info;
```

### エラーハンドリング

```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Ghost not found: {0}")]
    GhostNotFound(String),
    
    #[error("SHIORI error: {0}")]
    ShioriError(String),
    
    #[error("File system error: {0}")]
    FileSystemError(#[from] std::io::Error),
}
```

---

*このドキュメントは継続的に更新され、システムの進化に合わせて改善されます。*

*最終更新: 2025年7月11日*