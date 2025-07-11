# Mascot Nanai

> **AI関与について**: このプロジェクトはGitHub Copilotの支援により開発されました。AI主導開発の実践例として、キャラクター設定・仕様・実装はオーナーユーザーとAIの協議により決定されています。

## 🎭 概要

Mascot Nanaiは、**伺か（うかがか）**互換のデスクトップマスコットアプリケーションです。Android/Windows対応のクロスプラットフォーム・アプリケーションとして、**AI主導開発**により構築されています。

### 🌟 特徴
- 🤖 **AI主導開発** - GitHub Copilotを活用した高品質な実装
- 📱 **クロスプラットフォーム** - Android/Windows対応
- 🔧 **モダンな技術** - Tauri + Rust + Web技術
- 🎭 **伺か互換** - 既存の伺かゴーストとの互換性
- 🎨 **拡張性** - Web技術によるカスタマイズ性

## 🚀 クイックスタート

### 📱 ユーザー向け
1. **[インストール](docs/user/installation.md)** - アプリのインストール方法
2. **[使用方法](docs/user/user-guide.md)** - 基本的な使用方法
3. **[トラブルシューティング](docs/user/troubleshooting.md)** - 問題解決方法

### 👨‍💻 開発者向け
1. **[貢献ガイド](CONTRIBUTING.md)** - プロジェクトへの貢献方法
2. **[システムアーキテクチャ](docs/developer/architecture.md)** - システム構成
3. **[AI主導開発](docs/AI_driven.md)** - AI活用開発手法

## 🛠️ 技術構成

### フロントエンド
- **HTML5 + CSS3 + Vanilla JavaScript** - 拡張性を重視したシンプルな構成
- **iframe メニューシステム** - 独立性と柔軟性を両立

### バックエンド
- **Rust** - 高性能・安全性・クロスプラットフォーム対応
- **Tauri** - 軽量なデスクトップアプリケーションフレームワーク

### SHIORI連携
- **Git サブモジュール** - 各SHIORIエンジンの統合
- **クロスプラットフォーム対応** - DLLに依存しない実装

## 🏗️ 開発環境

### 必要なツール
- **Rust** (最新 stable) - メインの開発言語
- **Node.js** (LTS) - フロントエンドツール
- **Git** - バージョン管理・サブモジュール
- **Android SDK** - Android版ビルド用

### ビルド手順
```bash
# リポジトリのクローン
git clone https://github.com/nanaisisi/android-mascot-nanai.git
cd android-mascot-nanai

# サブモジュールの初期化
git submodule update --init

# デスクトップ版の開発実行
cargo tauri dev

# Android版のビルド
cargo tauri android build -d -t aarch64
```

## 📚 包括的なドキュメント

このプロジェクトは、**AI主導開発**の実践例として、包括的なドキュメントを提供しています。

### 📖 主要ドキュメント
- **[📋 ドキュメント一覧](docs/README.md)** - 全ドキュメントの概要
- **[🎯 プロジェクト仕様](PROJECT-SPEC.md)** - 詳細な技術仕様
- **[✅ 開発計画](TODO.md)** - 現在の開発状況と計画
- **[📄 ドキュメント提案](docs/documentation-proposal.md)** - 今回作成したドキュメント戦略

### 🎯 目的別ガイド
- **初めて使う方** → [インストールガイド](docs/user/installation.md)
- **使い方を知りたい** → [ユーザーガイド](docs/user/user-guide.md)
- **開発に参加したい** → [貢献ガイド](CONTRIBUTING.md)
- **技術を理解したい** → [アーキテクチャ](docs/developer/architecture.md)
- **AI開発に興味がある** → [AI主導開発](docs/AI_driven.md)

## 🎭 伺か互換性

### 対応状況
- ✅ **基本的なゴースト表示** - キャラクター描画・アニメーション
- ✅ **シェル切り替え** - 外見の変更
- ✅ **バルーン表示** - 会話システム
- ✅ **基本メニュー** - 右クリックメニュー
- 🔄 **SHIORI連携** - 会話エンジン（実装中）
- 🔄 **ネットワーク更新** - 自動更新機能（予定）

### 互換性の詳細
詳細な互換性情報は[伺か標準仕様](docs/standard-ghost-spec.md)を参照してください。

## 🤖 AI主導開発について

このプロジェクトは、**GitHub Copilot**を活用した**AI主導開発**の実践例です。

### 開発体制
- **AI（GitHub Copilot）**: コード実装・ドキュメント作成・技術検討
- **人間（オーナー）**: 方針決定・品質管理・最終判断
- **協調開発**: 設計議論・問題解決・品質向上

### 特徴
- **高品質な実装** - AIによる一貫性のあるコード
- **包括的なドキュメント** - 自動化された文書作成
- **迅速な開発** - AI支援による効率的な実装
- **学習と改善** - 継続的な開発手法の改善

詳細は[AI主導開発ドキュメント](docs/AI_driven.md)を参照してください。

## 💻 推奨IDE設定

- [VS Code](https://code.visualstudio.com/) +
  [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) +
  [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 🤝 コミュニティ

### サポート・質問
- **[GitHub Issues](https://github.com/nanaisisi/android-mascot-nanai/issues)** - バグ報告・機能要望
- **[GitHub Discussions](https://github.com/nanaisisi/android-mascot-nanai/discussions)** - 一般的な質問・議論

### 貢献方法
- **バグ報告** - 問題の発見と報告
- **機能要望** - 新しいアイデアの提案
- **コード貢献** - 実装の改善・追加
- **ドキュメント改善** - 文書の修正・追加

詳細は[貢献ガイド](CONTRIBUTING.md)を参照してください。

# How to build

<code>cargo tauri dev</code>

#署名無視build、apk<br><code>cargo tauri android build -d -t aarch64</code>

# ライセンス

## 本ソフトウェア

デュアルライセンスからライセンスを選択してご使用ください。

Licensed under either of

Apache License, Version 2.0, (LICENSE-APACHE or
https://www.apache.org/licenses/LICENSE-2.0) MIT license (LICENSE-MIT or
https://opensource.org/licenses/MIT) at your option.

## [SATORI-SHIORI](https://github.com/ukatech/satoriya-shiori)

BSD 2-Clause License

Copyright (c) 2001-2005, Kusigahama Yagi. Copyright (c) 2006-, SEIBIHAN. All
rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

## [YAYA-SHIORI](https://github.com/YAYA-shiori/yaya-shiori)

修正BSDライセンス

Copyright (c) 2007-, 整備班 All rights reserved. http://ms.shillest.net/

ソースコード形式かバイナリ形式か、変更するかしないかを問わず、以下の条件を満たす場合に限り、再頒布および使用が許可されます。

・ソースコードを再頒布する場合、上記の著作権表示、本条件一覧、および下記免責条項を含めること。
・バイナリ形式で再頒布する場合、頒布物に付属のドキュメント等の資料に、上記の著作権表示、本条件一覧、および下記免責条項を含めること。
・書面による特別の許可なしに、本ソフトウェアから派生した製品の宣伝または販売促進に、「整備班」の名前または貢献者の名前を使用してはならない。

本ソフトウェアは、著作権者および貢献者によって「現状のまま」提供されており、明示黙示を問わず、商業的な使用可能性、および特定の目的に対する適合性に関する暗黙の保証も含め、またそれに限定されない、いかなる保証もありません。著作権者も貢献者も、事由のいかんを問わず、
損害発生の原因いかんを問わず、かつ責任の根拠が契約であるか厳格責任であるか（過失その他の）不法行為であるかを問わず、仮にそのような損害が発生する可能性を知らされていたとしても、本ソフトウェアの使用によって発生した（代替品または代用サービスの調達、使用の喪失、データの喪失、利益の喪失、業務の中断も含め、またそれに限定されない）直接損害、間接損害、偶発的な損害、特別損害、懲罰的損害、または結果損害について、一切責任を負わないものとします。
