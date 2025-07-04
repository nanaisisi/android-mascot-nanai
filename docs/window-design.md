# ウィンドウ設計

> **AI関与について**: このドキュメントはGitHub
> Copilotの支援により作成されました。技術検討・設計はオーナーユーザーとAIの協議により行われています。

## 概要

Android向けマスコットアプリケーションにおけるUI構成設計。 SSP（原意 Sakura
Script Player）のコンセプトをAndroid環境に適応させる。

> **注**:
> WindowsプラットフォームはAndroid向けUIの検証用として使用し、将来的なWindows固有機能（Splashscreen等）は別途検討・分離して記載する。

## 開発段階

1. **Windows検証**: Android向けUIの動作検証（技術検証・デバッグ用）
2. **Android本実装**: System Overlay での本格実装

## UI構成（Android向け）

### 1. Single Activity Container (index.html)

- **用途**: アプリケーション全体の制御・表示領域
- **特徴**:
  - Android Activity内のWebView
  - 全ての機能を包含するコンテナ
  - View切り替えによる画面遷移
- **機能**:
  - View管理・切り替え
  - Android権限管理
  - システムオーバーレイ制御

### 2. ゴーストビュー (#ghost-view)

- **用途**: キャラクター表示
- **実装**: CSS Transform + position:fixed
- **特徴**:
  - 画面内フローティング表示
  - タッチ・ドラッグ対応
  - アニメーション表示
- **機能**:
  - キャラクター画像表示
  - タッチインタラクション
  - 位置記憶・復元

### 3. 設定ビュー (#settings-view)

- **用途**: アプリケーション設定
- **実装**: スライドイン/モーダルオーバーレイ
- **特徴**:
  - ネイティブAndroid UI風デザイン
  - スワイプ・タップ操作
- **機能**:
  - ゴースト選択・切り替え
  - 表示設定
  - 権限設定

### 4. バルーンビュー (#balloon-view)

- **用途**: メッセージ・台詞表示
- **実装**: 動的生成オーバーレイ
- **特徴**:
  - ゴーストに連動した位置表示
  - 自動消去タイマー
- **機能**:
  - テキスト表示
  - 選択肢ボタン
  - 音声再生連動

## Android技術制約

### 権限要件

- `SYSTEM_ALERT_WINDOW`: 他アプリ上表示（要ユーザー許可）
- `FOREGROUND_SERVICE`: バックグラウンド動作
- `WAKE_LOCK`: 画面表示維持（オプション）

### 実装制限

- **複数ウィンドウ**: Android標準では不可
- **透過表示**: WebView内でのCSS透過のみ
- **システムオーバーレイ**: 非常に制限的、権限必要
- **フローティング**: CSS Transformによる疑似実装

## ファイル配置

### メイン構成（Android向け、Windows検証用に同等実装）

```
src/
├── index.html              (Single Activity Container / Windows検証用UI)
├── main.js                 (App Controller)
├── styles.css              (Global Styles)
├── views/
│   ├── ghost.css          (ゴーストビュー)
│   ├── settings.css       (設定ビュー)
│   └── balloon.css        (バルーンビュー)
├── scripts/
│   ├── ghost-controller.js     (ゴースト制御)
│   ├── settings-controller.js  (設定制御)
│   ├── balloon-controller.js   (バルーン制御)
│   └── android-adapter.js      (Android固有処理)
└── assets/                 (既存のまま)
    └── ghost/
        └── mock_nanai/
```

### 将来的なWindows固有構成（参考・分離検討対象）

```
src/windows/               (Windows固有機能検証時のみ)
├── splashscreen.html     (スプラッシュ画面)
├── multi-window.html     (複数ウィンドウ管理)
└── desktop-features.html (デスクトップ固有機能)
```

> **注**: Windows固有の機能（複数ウィンドウ、透過、Always On
> Top等）は将来的な検討事項として分離。現在はAndroid向けUIの検証に集中。

## Tauri設定

### メイン設定（Android向け、Windows検証用に同等）

```json
{
  "app": {
    "windows": [
      {
        "label": "main",
        "url": "index.html",
        "title": "Mascot Nanai",
        "width": 400,
        "height": 600,
        "transparent": false,
        "decorations": true,
        "resizable": false,
        "fullscreen": false
      }
    ]
  },
  "bundle": {
    "android": {
      "permissions": [
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.FOREGROUND_SERVICE"
      ]
    }
  }
}
```

### 将来的なWindows固有設定（分離検討対象）

```json
{
  "app": {
    "windows": [
      {
        "label": "splashscreen",
        "url": "windows/splashscreen.html",
        "transparent": true,
        "decorations": false,
        "alwaysOnTop": true
      }
    ]
  }
}
```

> **注**: Windows固有の設定は将来的な検討事項。現在はAndroid向けUIの検証に集中。

## 実装順序

### Phase 1: Android向けUI基本実装（Windows検証用でも同等実装）

- **目標**: WebView内でのキャラクター表示（Android本番・Windows検証両用）
- **内容**:
  - Single Activity Container構築
  - ゴーストビューの基本表示
  - タッチインタラクション

### Phase 2: Android向けUI拡張（Windows検証用でも同等実装）

- **目標**: 設定画面・メッセージ機能（Android本番・Windows検証両用）
- **内容**:
  - 設定ビューの実装
  - バルーンビューの実装
  - ビュー切り替え機能

### Phase 3: Android高度機能

- **目標**: システムオーバーレイ・サービス化（Android専用）
- **内容**:
  - SYSTEM_ALERT_WINDOW権限対応
  - フォアグラウンドサービス実装
  - より高度なインタラクション

### 将来的検討事項: Windows固有機能

- **目標**: デスクトップ固有機能の検証（分離検討対象）
- **内容**:
  - 複数ウィンドウ版の作成
  - 透過・フローティング検証
  - Splashscreen等の実装

> **注**:
> Windows固有機能は現在の開発スコープ外。Android向けUIの検証完了後に別途検討。
