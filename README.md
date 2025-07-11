# Android Mascot Nanai

> **AI関与について**: このドキュメントはGitHub Copilotの支援により作成されました。

**Android Mascot Nanai**は、伺か（Ukagaka）システムを Android 環境で動作させるためのクロスプラットフォームデスクトップマスコットアプリケーションです。

[![License](https://img.shields.io/badge/License-Apache%202.0%20%7C%20MIT-blue.svg)](https://github.com/nanaisisi/android-mascot-nanai#license)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Windows%20%7C%20Linux-green.svg)](https://github.com/nanaisisi/android-mascot-nanai)
[![Development Status](https://img.shields.io/badge/Status-Alpha-yellow.svg)](https://github.com/nanaisisi/android-mascot-nanai)

## 📋 目次

- [概要](#概要)
- [特徴](#特徴)
- [クイックスタート](#クイックスタート)
- [技術仕様](#技術仕様)
- [開発環境](#開発環境)
- [ドキュメント](#ドキュメント)
- [ライセンス](#ライセンス)
- [貢献](#貢献)

## 🎯 概要

Android Mascot Nanaiは、Windows向けSSP（SHIORI Subsystem Protocol）互換の伺かシステムをAndroid環境で実現するアプリケーションです。Tauri + Rust + Web技術を使用してクロスプラットフォーム対応を実現しています。

### 主な目的

- **Android対応**: スマートフォンでの伺かシステム動作
- **SSP互換**: 既存のゴーストとの高い互換性
- **モダン実装**: 最新技術による安全で高性能な実装
- **拡張性**: Web技術によるユーザー拡張の容易さ

## ✨ 特徴

### 🔄 互換性
- **SHIORI対応**: SATORI・YAYA等の主要SHIORIエンジンをサポート
- **ゴースト互換**: 既存のゴーストファイルをそのまま使用可能
- **プラットフォーム対応**: Android・Windows・Linux対応

### 🎨 モダンUI
- **透過表示**: 従来の伺かと同様の透過マスコット表示
- **レスポンシブ**: 各種画面サイズに対応
- **カスタマイズ**: 豊富な表示オプション

### 🔧 技術的特徴
- **Rust製**: 安全性・パフォーマンス・メモリ効率
- **Web技術**: HTML/CSS/JavaScript による拡張容易性
- **セキュリティ**: Tauriによるサンドボックス化

## 🚀 クイックスタート

### 前提条件

- **Rust**: 1.70.0 以上
- **Node.js**: 18.0.0 以上 (開発時)
- **Git**: バージョン管理用

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/nanaisisi/android-mascot-nanai.git
cd android-mascot-nanai

# サブモジュールの初期化
git submodule update --init --recursive

# 依存関係のインストール
npm install  # フロントエンド
cargo build  # バックエンド
```

### 開発環境での実行

```bash
# 開発サーバーの起動
cargo tauri dev
```

### プロダクションビルド

```bash
# デスクトップ版
cargo tauri build

# Android版 (APK)
cargo tauri android build -d -t aarch64
```

## 🏗️ 技術仕様

### アーキテクチャ

```
┌─────────────────┐
│   Frontend      │  HTML/CSS/JavaScript
│   (WebView)     │
├─────────────────┤
│   Tauri         │  Rust Application Framework
│   (Bridge)      │
├─────────────────┤
│   Backend       │  Rust Core Logic
│   (Rust)       │
├─────────────────┤
│   SHIORI        │  C++ Integration
│   (C++)         │
└─────────────────┘
```

### 主要技術

- **フロントエンド**: Vanilla HTML/CSS/JavaScript
- **バックエンド**: Rust + Tauri
- **SHIORI統合**: C++ライブラリ統合
- **ビルドシステム**: Cargo + Tauri CLI

## 🛠️ 開発環境

### 推奨IDE

- [VS Code](https://code.visualstudio.com/) + 拡張機能:
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### 開発コマンド

```bash
# 開発サーバー起動
cargo tauri dev

# コードフォーマット
cargo fmt

# Linting
cargo clippy

# テスト実行
cargo test
```

## 📚 ドキュメント

### 主要ドキュメント

- **[プロジェクト仕様書](PROJECT-SPEC.md)**: 詳細な技術仕様
- **[開発TODO](TODO.md)**: 現在の開発状況・課題
- **[ドキュメント計画](docs/DOCUMENTATION_PLAN.md)**: 包括的なドキュメント戦略

### 技術ドキュメント

- **[開発手法](docs/development-approach.md)**: 技術選択・開発方針
- **[SHIORI統合](docs/shiori-integration.md)**: SHIORI連携の技術仕様
- **[標準仕様](docs/standard-ghost-spec.md)**: ゴースト仕様

### 開発状況

- **現在のバージョン**: v0.1.0-alpha
- **開発段階**: アルファ版
- **主要機能**: 基本UI・ゴースト管理・SHIORI統合基盤

## 📄 ライセンス

このプロジェクトはデュアルライセンス形式です。以下のいずれかのライセンスを選択してください。

- **Apache License 2.0** ([LICENSE-APACHE](LICENSE-APACHE))
- **MIT License** ([LICENSE-MIT](LICENSE-MIT))

### 組み込みライブラリ

- **SATORI SHIORI**: BSD 2-Clause License
- **YAYA SHIORI**: 修正BSDライセンス

## 🤝 貢献

プロジェクトへの貢献を歓迎します！

### 貢献方法

1. **Issue報告**: バグ・要望・質問等
2. **プルリクエスト**: コード改善・新機能追加
3. **ドキュメント**: 文書改善・翻訳

### 開発ガイドライン

- **コードスタイル**: `cargo fmt` + `cargo clippy`
- **コミット**: 明確なコミットメッセージ
- **テスト**: 新機能には適切なテスト追加

## 📧 サポート

- **GitHub Issues**: バグ報告・機能要望
- **GitHub Discussions**: 一般的な質問・議論
- **プロジェクトWiki**: 詳細な技術情報

## 📊 プロジェクト状況

### 現在の進捗

- ✅ **基本アーキテクチャ**: 完了
- ✅ **UI基盤**: 完了
- 🚧 **SHIORI統合**: 進行中
- 🚧 **Android対応**: 進行中
- ❌ **プラグインシステム**: 未実装

### 今後の予定

- SHIORI統合の完全実装
- Android版の安定化
- 標準伺かメニュー実装
- プラグインシステム開発

---

**最終更新**: 2024年7月11日  
**バージョン**: v0.1.0-alpha