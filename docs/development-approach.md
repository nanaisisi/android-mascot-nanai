> **AI 関与について**: このドキュメントは GitHub
> Copilot の支援により作成されました。オーナーユーザーは主に方針決定と技術検討を担当し、コード実装やドキュメント作成は AI が主要な役割を果たしています。

# 開発手法・技術選択

## 概要

Android 向け SSP 互換環境の開発における技術選択と開発手法の記録。

## 技術スタック選択

### フレームワーク: Tauri + Rust

#### 選択理由

- **クロスプラットフォーム**: Windows/Android/Linux 対応
- **ユーザー拡張性**: Web 技術ベースでの高いアクセシビリティ
- **Web 技術活用**: HTML/CSS/JavaScript での UI 開発（拡張性のため）
- **セキュリティ**: Rust の安全性と Tauri のサンドボックス
- **ネイティブアクセス**: システム API への直接アクセス可能

> **ユーザー拡張性について**:
> Rust での拡張開発は一般ユーザーには学習コストが高いため、広く普及している Web 技術をベースとすることで、より多くの開発者が拡張機能を作成できるようにしています。

#### 代替案との比較

> **注記**: 各技術には一長一短があり、プロジェクトの要件に応じた選択が重要です。

| 技術         | 利点               | 欠点             | 採用理由                |
| ------------ | ------------------ | ---------------- | ----------------------- |
| **Tauri**    | 軽量、高速、拡張性 | 学習コスト       | ✅ 総合的優位性         |
| Electron     | 成熟、豊富な事例   | 重い、メモリ消費 | ❌ Android 非対応       |
| Flutter      | ネイティブ性能     | Web 技術未使用   | ❌ SHIORI 統合困難      |
| React Native | モバイル特化       | 複雑性           | ❌ デスクトップ対応不足 |

### フロントエンド: 単純な HTML 方式

#### 選択理由

- **学習コストの低さ**: 基本的な Web 技術のみ
- **デバッグの容易さ**: ブラウザ開発者ツールが使用可能
- **拡張性**: 将来的なフレームワーク導入が容易
- **軽量性**: 最小限の依存関係

#### 技術構成

```
Frontend: Vanilla HTML + CSS + JavaScript
├── HTML: 基本的な構造とマークアップ
├── CSS: スタイリングとアニメーション
└── JavaScript: インタラクション制御
```

#### フレームワーク非採用の理由

- **React/Vue**: 初期開発では過剰な複雑性
- **Android 制約**: Single Activity 内での動作に最適化
- **SSP 互換**: シンプルな UI 要件に適合
- **開発方針**: フレームワークは基本的に導入しない方針

> **過去の試行**:
> 当初は Rust の Dioxus フレームワークを検討していましたが、拡張性とシンプル性を重視し、純粋な Web 技術に回帰した。

## DLL 代替戦略

### Git サブモジュール方式

#### 実装方法

```bash
# SATORI SHIORI サブモジュール追加
git submodule add https://github.com/ukatech/satoriya-shiori.git src/cpp/satoriya-shiori

# YAYA SHIORI サブモジュール追加
git submodule add https://github.com/YAYA-shiori/yaya-shiori.git src/cpp/yaya-shiori
```

#### 利点

1. **最新版追従**: 上流リポジトリの更新を簡単に取り込み
2. **ライセンス分離**: 各 SHIORI のライセンスを独立管理
3. **開発履歴**: 独立した開発履歴の維持

#### 管理方針

- **バージョン固定**: 安定版をピン留め
- **定期更新**: セキュリティ・バグ修正の追従
- **テスト必須**: サブモジュール更新時の動作確認

### ビルド統合

> **DLL 形式回避について**: 従来の Windows
> DLL 形式を回避してクロスプラットフォーム対応するため、ビルドプロセスは複雑になります。

```rust
// build.rs での統合例
fn main() {
    // Git サブモジュールの確認
    if !Path::new("src/cpp/satoriya-shiori/satoriya").exists() {
        panic!("Git submodules not initialized. Run: git submodule update --init");
    }

    // SHIORIのビルド
    build_shiori_engines();
}
```

## ゴーストデータ管理

### ディレクトリ構造

```
assets/ghost/
└── mock_nanai/           # テンプレートベースゴースト
    ├── ghost/
    │   └── master/
    │       └── descript.txt
    └── shell/
        └── master/
            ├── descript.txt
            ├── surface0.png
            └── surfaces.txt
```

### 著作権対応

#### 自作コンテンツ方式

- **画像**: 自作

#### テンプレート化

```
Template Ghost Structure:
├── 基本設定 (descript.txt)
├── サンプル画像 (surface*.png)
├── 基本台詞 (SHIORI script)
└── ライセンス明記 (readme.txt)
```

#### 配布時の注意

- **ライセンス表記**: すべての素材のライセンスを明記
- **著作権情報**: 作者・出典の適切な記載
- **使用許諾**: 二次利用規約の明確化

## 開発環境構成

### 必要ツール

```
開発環境:
├── Rust (最新 stable)
├── Node.js (LTS版)
├── Git (サブモジュール管理)
├── C++ Compiler (SHIORI ビルド用)
└── Android SDK (Android版ビルド用)
```

### IDE とプラグイン

- **VS Code**: 推奨 IDE
- **rust-analyzer**: Rust 言語サポート
- **Tauri Extension**: Tauri 開発支援
- **GitLens**: Git 管理支援

### ビルド設定

```toml
# Cargo.toml の依存関係
[dependencies]
tauri = { version = "2.0", features = ["api-all"] }
serde = { version = "1.0", features = ["derive"] }

[build-dependencies]
tauri-build = { version = "2.0", features = [] }
cc = "1.0"  # C++ SHIORI ビルド用
```

## 品質管理

### テスト戦略

1. **単体テスト**: Rust コンポーネントのテスト
2. **統合テスト**: SHIORI との連携テスト
3. **UI テスト**: ブラウザでの動作確認
4. **Android テスト**: 実機での動作確認

### CI/CD パイプライン

```yaml
# GitHub Actions 例
name: Build and Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true # サブモジュール込みでチェックアウト
      - name: Setup Rust
      - name: Build SHIORI
      - name: Run Tests
```

### コード品質

- **rustfmt**: コードフォーマット統一
- **clippy**: Lint チェック
- **cargo audit**: セキュリティ脆弱性チェック

## 将来拡張計画

### ユーザー拡張機能

1. **プラグイン API**: WEB 系でのプラグイン開発
2. **カスタム SHIORI**: 本アプリ独自の SHIORI
3. **UI カスタマイズ**: テーマ・レイアウト変更、balloon 他

### プラットフォーム拡張

1. **Windows 対応** Windows 対応
2. **iOS 対応**: Tauri の iOS サポート活用
3. **Web 版**: WASM でのブラウザ版
4. **デスクトップ**: Windows/Linux/macOS 対応、UI 最適化

### 技術的改善

1. **3D 対応**
2. **AI 技術対応**
3. **パフォーマンス**: メモリ使用量・起動時間の最適化
4. **セキュリティ**: サンドボックス強化・権限最小化
5. **アクセシビリティ**: 画面読み上げ・キーボード操作対応

## 開発指針

### 原則

1. **拡張性**: 将来の機能追加を考慮した設計
2. **互換性**: SSP との高い互換性維持
3. **安全性**: セキュリティとプライバシーの確保

### 開発プロセス

1. **段階的開発**: 小さな機能から順次実装
2. **早期テスト**: 各段階での動作確認
3. **ドキュメント**: 設計・実装の記録保持

### 段階的実装アプローチ

#### Phase 1: ゴースト情報読み込み機能

- **優先度**: 最高（SHIORI 不要で動作可能）
- **内容**:
  - `assets/ghost/` ディレクトリのスキャン
  - `descript.txt` の解析・パース
  - ゴーストメタデータの抽出
  - 内部辞書への格納

#### Phase 2: ゴースト表示システム

- **優先度**: 高（基本機能）
- **内容**:
  - surface 画像の読み込み・表示
  - アニメーション対応
  - タッチ・ドラッグインタラクション
  - 基本的な UI 制御

#### Phase 3: SSP 互換性確保

- **優先度**: 高（互換性維持）
- **内容**:
  - ファイル構造の互換性
  - 設定フォーマットの対応
  - 基本的なコマンド体系
  - エラーハンドリング

#### Phase 4: SHIORI 接続システム

- **優先度**: 中（本格機能）
- **内容**:
  - DLL 識別・ロード機能
  - SHIORI API エミュレーション
  - メッセージ処理システム
  - 状態管理・永続化

### SHIORI 識別・対応戦略

#### DLL 識別方式

```
ゴーストディレクトリ/ghost/master/ 内での DLL 検索:
├── satori.dll → SATORI SHIORI 使用
├── yaya.dll   → YAYA SHIORI 使用
├── 他のDLL    → 将来対応予定
└── DLL不在    → 静的ゴースト（表示のみ）
```

#### 実装優先順位

1. **YAYA SHIORI**: 最も普及、優先実装
2. **SATORI SHIORI**: 次に普及、二次実装
3. **カスタム SHIORI**: 本ソフトウェア専用
4. **他の SHIORI**: コミュニティ要望に応じて対応

#### 技術実装

```rust
// SHIORI識別例
fn detect_shiori_type(ghost_path: &Path) -> SHIORIType {
    let master_path = ghost_path.join("ghost/master");

    if master_path.join("yaya.dll").exists() {
        SHIORIType::YAYA
    } else if master_path.join("satori.dll").exists() {
        SHIORIType::SATORI
    } else {
        SHIORIType::Static  // 静的ゴースト
    }
}
```

### クロスプラットフォーム対応

#### 本ソフトウェア専用 SHIORI

- **特徴**:
  - Rust 文法

## 開発体制

#### AI 支援開発

- **主要ツール**: GitHub Copilot
- **役割分担**:
  - **オーナーユーザー**: プロジェクト方針決定、要件定義、技術検討
  - **AI (GitHub Copilot)**: コード生成支援、実装サポート、ドキュメント作成
- **開発プロセス**:
  - Tauri と伺か系技術の参考資料調査
  - AI との技術検討・設計議論
  - AI によるコード実装支援
  - オーナーによる方針確認・品質管理

#### AI 関与範囲

- **コード実装**: AI が主要な実装を担当
- **ドキュメント**: AI が作成または大幅に関与
- **設計検討**: AI との協議による技術選択
- **テスト設計**: AI 支援によるテスト戦略策定
