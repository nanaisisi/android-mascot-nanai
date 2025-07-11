# インストールガイド - Mascot Nanai

> **AI関与について**: このドキュメントはGitHub Copilotの支援により作成されました。

このガイドでは、Mascot Nanaiをお使いのデバイスにインストールする方法を説明します。

## システム要件

### 最小要件
- **OS**: Windows 10 (64-bit) / Android 8.0 (API 26) 以上
- **RAM**: 4GB以上
- **ストレージ**: 1GB以上の空き容量
- **ネットワーク**: インターネット接続（初回セットアップ時）

### 推奨要件
- **OS**: Windows 11 / Android 11 以上
- **RAM**: 8GB以上
- **ストレージ**: 2GB以上の空き容量
- **CPU**: マルチコア（4コア以上）

## インストール方法

### 🖥️ Windows（デスクトップ版）

#### 方法1: プリビルドバイナリ（推奨）

1. **リリースページから Download**
   - [Releases](https://github.com/nanaisisi/android-mascot-nanai/releases)
   - 最新の `mascot-nanai-windows-x64.msi` をダウンロード

2. **インストーラーの実行**
   ```
   mascot-nanai-windows-x64.msi を実行
   → インストールウィザードに従って進める
   → インストール完了
   ```

3. **アプリケーションの起動**
   - スタートメニューから「Mascot Nanai」を検索
   - または、デスクトップのショートカットをダブルクリック

#### 方法2: ソースからビルド

1. **開発環境のセットアップ**
   ```bash
   # Rust のインストール
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Node.js のインストール（LTS版）
   # https://nodejs.org/からダウンロード
   
   # Git のインストール
   # https://git-scm.com/からダウンロード
   ```

2. **ソースコードの取得**
   ```bash
   git clone https://github.com/nanaisisi/android-mascot-nanai.git
   cd android-mascot-nanai
   git submodule update --init
   ```

3. **ビルドと実行**
   ```bash
   # 依存関係のインストール
   cargo build --release
   
   # 開発版の実行
   cargo tauri dev
   
   # リリース版のビルド
   cargo tauri build
   ```

### 📱 Android版

#### 方法1: APKファイル（推奨）

1. **APKファイルの取得**
   - [Releases](https://github.com/nanaisisi/android-mascot-nanai/releases)
   - 最新の `mascot-nanai-android.apk` をダウンロード

2. **不明なソースの許可**
   ```
   設定 → セキュリティ → 不明なソースを許可
   または
   設定 → アプリと通知 → 特別なアプリアクセス → 不明なアプリのインストール
   ```

3. **APKのインストール**
   - ダウンロードした `.apk` ファイルをタップ
   - インストール確認ダイアログで「インストール」をタップ

#### 方法2: ソースからビルド

1. **開発環境のセットアップ**
   ```bash
   # Android Studio のインストール
   # https://developer.android.com/studio
   
   # SDK の設定
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   
   # Rust Android ターゲットの追加
   rustup target add aarch64-linux-android
   rustup target add armv7-linux-androideabi
   rustup target add i686-linux-android
   rustup target add x86_64-linux-android
   ```

2. **ソースコードの取得**
   ```bash
   git clone https://github.com/nanaisisi/android-mascot-nanai.git
   cd android-mascot-nanai
   git submodule update --init
   ```

3. **Android用ビルド**
   ```bash
   # デバッグビルド
   cargo tauri android build -d -t aarch64
   
   # リリースビルド
   cargo tauri android build -t aarch64
   ```

## 初回セットアップ

### 1. アプリケーションの起動
- Windows: スタートメニューから起動
- Android: アプリドロワーから起動

### 2. 初期設定

#### 基本設定
1. **言語設定**
   - 日本語（デフォルト）
   - English（将来対応予定）

2. **ゴーストディレクトリの設定**
   - Windows: `C:\Users\[ユーザー名]\Documents\Mascot Nanai\ghost`
   - Android: `/storage/emulated/0/Android/data/com.mascot.nanai/ghost`

3. **権限の確認**
   - Android: ストレージアクセス権限の許可
   - Windows: ファイアウォールの設定確認

### 3. サンプルゴーストの確認

初回起動時に、テスト用のゴーストが自動的に読み込まれます：

```
assets/ghost/mock_nanai/
├── ghost/master/
│   ├── descript.txt      # ゴースト基本情報
│   ├── dic_*.txt         # 会話辞書
│   └── satori_*.txt      # SATORI設定
└── shell/master/
    ├── descript.txt      # シェル情報
    ├── surface*.png      # キャラクター画像
    └── surfaces.txt      # 表面設定
```

## 動作確認

### 基本動作のテスト

1. **ゴーストの表示**
   - キャラクターが画面に表示される
   - 透過背景が正しく動作する

2. **メニューの動作**
   - 右上のメニューボタンをクリック
   - メニューが表示される
   - 各項目が正しく動作する

3. **ゴースト管理**
   - ゴースト管理画面の表示
   - ゴーストの切り替え
   - 設定の保存・読み込み

### トラブルシューティング

#### よくある問題

##### 1. アプリが起動しない
**症状**: アプリケーションが起動せず、すぐに終了する

**原因と対処法**:
- **Windows**: 
  - Microsoft Visual C++ 再頒布可能パッケージのインストール
  - Windows Defender の除外設定
- **Android**: 
  - Android バージョンの確認（8.0以上）
  - ストレージ容量の確認

##### 2. ゴーストが表示されない
**症状**: アプリは起動するが、キャラクターが表示されない

**原因と対処法**:
- ゴーストファイルの存在確認
- ファイルパスの確認
- 権限設定の確認

##### 3. メニューが動作しない
**症状**: メニューボタンを押しても反応しない

**原因と対処法**:
- ブラウザコンポーネントの確認
- JavaScript の有効化
- セキュリティ設定の確認

## サポート

### 公式サポート
- **GitHub Issues**: https://github.com/nanaisisi/android-mascot-nanai/issues
- **Discussions**: https://github.com/nanaisisi/android-mascot-nanai/discussions

### コミュニティサポート
- **Wiki**: プロジェクトWikiページ
- **FAQ**: よくある質問集

### 問題報告時の情報
- OS バージョン
- アプリバージョン
- エラーメッセージ
- 再現手順

---

*このガイドは継続的に更新されます。問題や改善提案があれば、Issue でお知らせください。*

*最終更新: 2025年7月11日*