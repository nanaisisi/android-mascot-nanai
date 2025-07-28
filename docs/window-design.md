> **AI 関与について**: このドキュメントは GitHub
> Copilot の支援により作成されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

# ウィンドウ設計

## 概要

Android 向けマスコットアプリケーションにおける UI 構成設計。 SSP（原意 Sakura
Script Player）のコンセプトを Android 環境に適応させる。

> **注**:
> Windows プラットフォームは Android 向け UI の検証用として使用し、将来的な Windows 固有機能（Splashscreen 等）は別途検討・分離して記載する。

## 開発段階

1. **Windows 検証**: Android 向け UI の動作検証（技術検証・デバッグ用）
2. **Android 本実装**: System Overlay での本格実装

## UI 構成（Android 向け）

### 1. Single Activity Container (index.html)

- **用途**: アプリケーション全体の制御・表示領域
- **特徴**:
  - Android Activity 内の WebView
  - 全ての機能を包含するコンテナ
  - View 切り替えによる画面遷移
- **機能**:
  - View 管理・切り替え
  - Android 権限管理
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
  - ネイティブ Android UI 風デザイン
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

## Android 技術制約

### 権限要件

- `SYSTEM_ALERT_WINDOW`: 他アプリ上表示（要ユーザー許可）
- `FOREGROUND_SERVICE`: バックグラウンド動作
- `WAKE_LOCK`: 画面表示維持（オプション）

### 実装制限

- **複数ウィンドウ**: Android 標準では不可
- **透過表示**: WebView 内での CSS 透過のみ
- **システムオーバーレイ**: 非常に制限的、権限必要
- **フローティング**: CSS Transform による疑似実装

## ファイル配置

### メイン構成（Android 向け、Windows 検証用に同等実装）

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

### 将来的な Windows 固有構成（参考・分離検討対象）

```
src/windows/               (Windows固有機能検証時のみ)
├── splashscreen.html     (スプラッシュ画面)
├── multi-window.html     (複数ウィンドウ管理)
└── desktop-features.html (デスクトップ固有機能)
```

> **注**: Windows 固有の機能（複数ウィンドウ、透過、Always On
> Top 等）は将来的な検討事項として分離。現在は Android 向け UI の検証に集中。

## Tauri 設定

### メイン設定（Android 向け、Windows 検証用に同等）

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

### 将来的な Windows 固有設定（分離検討対象）

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

> **注**: Windows 固有の設定は将来的な検討事項。現在は Android 向け UI の検証に集中。

## 実装順序

### Phase 1: Android 向け UI 基本実装（Windows 検証用でも同等実装）

- **目標**: WebView 内でのキャラクター表示（Android 本番・Windows 検証両用）
- **内容**:
  - Single Activity Container 構築
  - ゴーストビューの基本表示
  - タッチインタラクション

### Phase 2: Android 向け UI 拡張（Windows 検証用でも同等実装）

- **目標**: 設定画面・メッセージ機能（Android 本番・Windows 検証両用）
- **内容**:
  - 設定ビューの実装
  - バルーンビューの実装
  - ビュー切り替え機能

### Phase 3: Android 高度機能

- **目標**: システムオーバーレイ・サービス化（Android 専用）
- **内容**:
  - SYSTEM_ALERT_WINDOW 権限対応
  - フォアグラウンドサービス実装
  - より高度なインタラクション

### 将来的検討事項: Windows 固有機能

- **目標**: デスクトップ固有機能の検証（分離検討対象）
- **内容**:
  - 複数ウィンドウ版の作成
  - 透過・フローティング検証
  - Splashscreen 等の実装

> **注**:
> Windows 固有機能は現在の開発スコープ外。Android 向け UI の検証完了後に別途検討。
