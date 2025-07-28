> **AI 関与について**: このドキュメントは GitHub
> Copilot の支援により作成されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

# SHIORI 統合技術仕様

## 概要

Android 向け SSP 互換環境において、Windows
DLL ベースの SHIORI 実装をネイティブコードとして組み込む技術仕様。

## 背景と課題

### 従来の SHIORI システム

- **SHIORI**: ゴーストの人工知能を担う DLL
- **Windows DLL**: Windows 固有の動的ライブラリ形式
- **API 呼び出し**: SSP（本体）から DLL 関数を直接呼び出し

### Android 環境での課題

1. **DLL 非対応**: Android は Windows DLL を実行できない
2. **セキュリティ制約**: Mobile OS のサンドボックス制約
3. **エミュレーション限界**: wine 等のエミュレーターは非現実的
4. **パフォーマンス**: 仮想化オーバーヘッドの問題

## 解決アプローチ

### コード組み込み方式

Windows DLL の代替として、SHIORI ソースコードを直接アプリケーションに組み込む。

```
従来: SSP.exe → SHIORI.dll
新方式: Tauri App → 組み込みSHIORI
```

## 技術アーキテクチャ

### 1. ソースコード配置

```
src/cpp/
├── satoriya-shiori/     # SATORI SHIORI実装
│   ├── satoriya/        # コア
│   └── LICENSE          # BSD 2-Clause
└── yaya-shiori/         # YAYA SHIORI実装
    ├── *.cpp            # 実装ファイル群
    ├── *.h              # ヘッダーファイル群
    └── LICENSE          # 修正BSD
```

### 2. 統合レイヤー構成

```
JavaScript/WebView Layer
         ↕
    Tauri Commands
         ↕
    Rust FFI Bridge
         ↕
    C++ SHIORI Engine
         ↕
    Ghost Data Files
```

### 3. インターフェース変換

#### 従来の DLL API

```c
HGLOBAL __declspec(dllexport) __cdecl request(HGLOBAL h, long *len);
BOOL __declspec(dllexport) __cdecl load(HGLOBAL h, long len);
BOOL __declspec(dllexport) __cdecl unload();
```

#### 新しい Rust FFI

```rust
extern "C" {
    fn shiori_request(input: *const c_char, len: usize) -> *mut c_char;
    fn shiori_load(ghost_path: *const c_char) -> bool;
    fn shiori_unload() -> bool;
}
```

## 実装段階

### Phase 1: 基本統合

1. **C++ビルド環境**: CMake/Cargo での統合ビルド
2. **FFI Bridge**: Rust-C++間の基本的なデータ交換
3. **最小動作**: 単純なリクエスト/レスポンス

### Phase 2: SHIORI 機能

1. **ゴーストローディング**: descript.txt 解析と SHIORI 初期化
2. **メッセージ処理**: SAKURA Script の処理とレスポンス生成
3. **状態管理**: セッション・変数の永続化

### Phase 3: 高度機能

1. **複数 SHIORI 対応**: SATORI・YAYA 等の切り替え
2. **プラグイン機能**: 追加 SHIORI の動的ロード
3. **パフォーマンス最適化**: メモリ管理・処理速度向上

## ビルド統合

### Cargo.toml 設定

```toml
[build-dependencies]
cc = "1.0"

[dependencies]
# FFI関連
libc = "0.2"
```

### build.rs スクリプト

```rust
use cc::Build;

fn main() {
    // SATORI SHIORI のビルド
    Build::new()
        .cpp(true)
        .files(&["src/cpp/satoriya-shiori/satoriya/*.cpp"])
        .compile("satori_shiori");

    // YAYA SHIORI のビルド
    Build::new()
        .cpp(true)
        .files(&["src/cpp/yaya-shiori/*.cpp"])
        .compile("yaya_shiori");
}
```

## データフロー

### 1. ゴースト初期化

```
User Input → JavaScript → Tauri Command → Rust → C++ SHIORI Load
```

### 2. メッセージ処理

```
User Click → JavaScript Event → Tauri Request → Rust FFI → C++ Process → Response
```

### 3. 状態同期

```
SHIORI State ↔ Rust Storage ↔ JavaScript State ↔ UI Update
```

## セキュリティ考慮

### Android 固有制約

1. **ファイルアクセス**: アプリサンドボックス内でのファイル操作
2. **メモリ管理**: ネイティブコードでのメモリリーク対策
3. **権限管理**: 必要最小限の権限での動作

### 対策

1. **サンドボックス内実行**: アプリ専用ディレクトリでの動作
2. **RAII**: Rust の自動メモリ管理活用
3. **エラーハンドリング**: 安全な失敗処理

## ライセンス統合

### 本プロジェクト

- Apache 2.0 / MIT デュアルライセンス

### 組み込み SHIORI

- **SATORI**: BSD 2-Clause License
- **YAYA**: 修正 BSD ライセンス

### 統合時の注意

- 各ライセンスの著作権表示を維持
- 配布時のライセンス文書同梱
- ソースコード公開時の義務遵守

## パフォーマンス目標

### レスポンス時間

- SHIORI 初期化: < 1 秒
- メッセージ処理: < 100ms
- 状態保存: < 50ms

### メモリ使用量

- SHIORI : < 50MB
- キャッシュ: < 10MB
- UI 表示: < 30MB

## 将来拡張

### Web Extension 準拠

- 設定 API・ストレージ API 等の標準化
- クロスプラットフォーム対応

### VSCode Extension 参考

- 拡張機能アーキテクチャの応用
- プラグインシステムの実装
