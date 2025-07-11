# クイックスタートガイド

> **AI関与について**: このドキュメントはGitHub Copilotの支援により作成されました。

このガイドでは、Android Mascot Nanaiを最短時間で動作させるための手順を説明します。

## 📋 目次

- [システム要件](#システム要件)
- [インストール](#インストール)
- [初回セットアップ](#初回セットアップ)
- [基本的な使い方](#基本的な使い方)
- [トラブルシューティング](#トラブルシューティング)
- [次のステップ](#次のステップ)

## 💻 システム要件

### 開発環境

- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **Rust**: 1.70.0 以上
- **Node.js**: 18.0.0 以上
- **Git**: 2.30.0 以上

### ランタイム要件

- **メモリ**: 2GB 以上推奨
- **ストレージ**: 1GB 以上の空き容量
- **グラフィック**: 透過表示対応

## 🚀 インストール

### 1. リポジトリのクローン

```bash
git clone https://github.com/nanaisisi/android-mascot-nanai.git
cd android-mascot-nanai
```

### 2. サブモジュールの初期化

```bash
git submodule update --init --recursive
```

### 3. 依存関係のインストール

```bash
# Rustツールチェインの確認
rustc --version
cargo --version

# Node.jsの確認（開発時のみ）
node --version
npm --version

# プロジェクトの依存関係インストール
cargo build
```

## ⚙️ 初回セットアップ

### 1. 設定ファイルの作成

```bash
# 設定ファイルをデフォルト設定でコピー
cp config.toml.example config.toml  # 存在する場合
```

### 2. ゴーストファイルの配置

```bash
# サンプルゴーストの確認
ls assets/ghost/

# 追加ゴーストの配置先
mkdir -p assets/ghost/your_ghost_name
```

### 3. 開発サーバーの起動

```bash
# デバッグモードでの起動
RUST_LOG=debug cargo tauri dev
```

## 🎮 基本的な使い方

### 1. アプリケーションの起動

開発サーバーを起動すると、自動的にアプリケーションウィンドウが開きます。

### 2. ゴーストの選択

1. 右上のメニューボタン（☰）をクリック
2. 「👻 ゴースト管理」を選択
3. 利用可能なゴーストから選択

### 3. 基本操作

- **右クリック**: コンテキストメニューの表示
- **ドラッグ**: ウィンドウの移動
- **左クリック**: ゴーストとの対話

### 4. 設定の変更

1. メニューから「⚙️ 設定」を選択
2. 各種設定を調整
3. 「保存」で設定を反映

## ❗ トラブルシューティング

### よくある問題と解決方法

#### 1. アプリケーションが起動しない

```bash
# デバッグログを確認
RUST_LOG=debug cargo tauri dev

# 依存関係を再インストール
cargo clean
cargo build
```

#### 2. ゴーストが表示されない

- `assets/ghost/` ディレクトリの存在確認
- ゴーストファイルの構造確認
- 権限の確認

#### 3. メニューが反応しない

- ブラウザの開発者ツールでJavaScriptエラーを確認
- `Ctrl+Shift+I` でデバッグコンソールを開く

#### 4. ビルドエラー

```bash
# Rustツールチェインの更新
rustup update

# 依存関係のクリーンアップ
cargo clean
rm -rf target/
cargo build
```

### ログファイルの確認

```bash
# アプリケーションログの場所
# Windows: %APPDATA%/mascot-nanai/logs/
# macOS: ~/Library/Logs/mascot-nanai/
# Linux: ~/.local/share/mascot-nanai/logs/
```

## 🔧 環境固有の設定

### Windows

```powershell
# PowerShellでの環境変数設定
$env:RUST_LOG = "debug"
cargo tauri dev
```

### macOS/Linux

```bash
# 環境変数の設定
export RUST_LOG=debug
cargo tauri dev
```

### Android（実験的）

```bash
# Android SDKの設定が必要
export ANDROID_HOME=/path/to/android-sdk
export ANDROID_NDK_HOME=/path/to/android-ndk

# APKのビルド
cargo tauri android build -d -t aarch64
```

## 📱 次のステップ

### 学習リソース

1. **[プロジェクト仕様書](../PROJECT-SPEC.md)**: 詳細な技術仕様
2. **[開発手法](../docs/development-approach.md)**: 技術選択の背景
3. **[SHIORI統合](../docs/shiori-integration.md)**: SHIORI連携の詳細

### 開発への参加

1. **GitHub Issues**: バグ報告・機能要望
2. **Pull Requests**: コード改善への貢献
3. **ドキュメント**: 文書改善・翻訳

### コミュニティ

- **GitHub Discussions**: 一般的な質問・議論
- **Issue Tracker**: バグ報告・機能要望
- **Wiki**: 詳細な技術情報

## 🆘 サポート

問題が解決しない場合は、以下の情報を含めてGitHub Issuesに報告してください：

- **OS**: オペレーティングシステムとバージョン
- **Rustバージョン**: `rustc --version`
- **エラーログ**: 関連するエラーメッセージ
- **再現手順**: 問題を再現する手順

---

**最終更新**: 2024年7月11日  
**バージョン**: v0.1.0-alpha