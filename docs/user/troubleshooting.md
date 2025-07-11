# トラブルシューティング - Mascot Nanai

> **AI関与について**: このドキュメントはGitHub Copilotの支援により作成されました。

このドキュメントでは、Mascot Nanaiの使用中に発生する可能性のある問題とその解決方法について説明します。

## よくある問題

### 🚨 起動関連の問題

#### 問題1: アプリケーションが起動しない
**症状**: 
- アプリケーションを起動しようとすると即座に終了する
- エラーメッセージが表示されない

**原因**:
- Tauri ランタイムの問題
- 依存関係の不足
- 権限の問題

**解決方法**:

1. **Windows**:
   ```bash
   # デバッグモードで起動してログを確認
   RUST_LOG=debug cargo tauri dev
   ```

2. **必要な依存関係の確認**:
   - Microsoft Visual C++ 再頒布可能パッケージ
   - WebView2 ランタイム

3. **権限の確認**:
   - 管理者権限で実行してみる
   - ファイアウォールの除外設定

#### 問題2: 起動時にエラーメッセージが表示される
**症状**:
- "Failed to load ghost" エラー
- "Configuration error" エラー

**解決方法**:
1. **ゴーストディレクトリの確認**:
   ```
   assets/ghost/mock_nanai/ が存在するか確認
   ```

2. **設定ファイルの初期化**:
   ```bash
   # 設定ファイルの削除（初期化）
   rm -rf ~/.local/share/mascot-nanai/
   ```

### 🎭 ゴースト関連の問題

#### 問題3: ゴーストが表示されない
**症状**:
- アプリは起動するが、キャラクターが表示されない
- 透明なウィンドウのみ表示される

**原因**:
- ゴーストファイルの破損
- 画像ファイルの読み込み失敗
- パスの問題

**解決方法**:

1. **ゴーストファイルの確認**:
   ```bash
   # ゴーストディレクトリの構造確認
   ls -la assets/ghost/mock_nanai/
   ls -la assets/ghost/mock_nanai/shell/master/
   ```

2. **画像ファイルの確認**:
   ```bash
   # 画像ファイルが存在するか確認
   ls -la assets/ghost/mock_nanai/shell/master/surface*.png
   ```

3. **descript.txt の確認**:
   ```
   # ファイルの内容を確認
   cat assets/ghost/mock_nanai/shell/master/descript.txt
   ```

#### 問題4: ゴーストの切り替えができない
**症状**:
- ゴースト管理画面でゴーストを選択しても変更されない
- エラーメッセージが表示される

**解決方法**:

1. **ゴーストスキャンの実行**:
   - 設定 → デバッグ → スキャン実行

2. **ログの確認**:
   ```bash
   # デバッグログの確認
   RUST_LOG=debug cargo tauri dev
   ```

3. **ゴーストファイルの整合性チェック**:
   - descript.txt の文字エンコーディング確認
   - ファイルパスの確認

### 🖱️ UI関連の問題

#### 問題5: メニューが表示されない
**症状**:
- 右上のメニューボタンをクリックしても何も起こらない
- メニューが部分的にしか表示されない

**原因**:
- iframe 通信の問題
- JavaScript エラー
- CSS の問題

**解決方法**:

1. **ブラウザコンソールの確認**:
   ```
   F12 → Console タブ → エラーメッセージを確認
   ```

2. **iframe 通信の確認**:
   ```javascript
   // メニューiframeの読み込み確認
   console.log(document.getElementById('menu-iframe'));
   ```

3. **キャッシュのクリア**:
   ```bash
   # アプリの再起動
   Ctrl+R でリロード
   ```

#### 問題6: モーダルが正しく動作しない
**症状**:
- モーダルが開かない
- モーダルの内容が表示されない
- 背景が透過されない

**解決方法**:

1. **CSS の確認**:
   ```css
   /* モーダルの表示設定確認 */
   .modal {
       display: block;
       z-index: 1000;
   }
   ```

2. **JavaScript イベントの確認**:
   ```javascript
   // イベントリスナーの確認
   document.addEventListener('DOMContentLoaded', function() {
       console.log('DOM loaded');
   });
   ```

### 🔧 設定関連の問題

#### 問題7: 設定が保存されない
**症状**:
- 設定を変更しても次回起動時に元に戻る
- 設定画面でエラーが発生する

**解決方法**:

1. **設定ファイルの場所確認**:
   ```bash
   # Windows
   %APPDATA%\mascot-nanai\settings.json
   
   # Linux
   ~/.local/share/mascot-nanai/settings.json
   ```

2. **権限の確認**:
   - 設定ディレクトリの書き込み権限
   - ファイルの読み取り専用属性

3. **設定の手動修正**:
   ```json
   {
       "ghost_directory": "assets/ghost",
       "current_ghost": "mock_nanai",
       "window_position": [100, 100],
       "always_on_top": false
   }
   ```

### 📱 Android関連の問題

#### 問題8: Android版が正しく動作しない
**症状**:
- アプリがクラッシュする
- 一部の機能が使用できない

**解決方法**:

1. **Android バージョンの確認**:
   - Android 8.0 (API 26) 以上が必要

2. **権限の確認**:
   ```
   設定 → アプリ → Mascot Nanai → 権限
   → ストレージ権限を許可
   ```

3. **ストレージ容量の確認**:
   - 最低1GB以上の空き容量が必要

4. **ログの確認**:
   ```bash
   # Android Debug Bridge でログ確認
   adb logcat | grep mascot-nanai
   ```

## デバッグ方法

### ログの取得

#### 開発環境でのログ
```bash
# 詳細ログで起動
RUST_LOG=debug cargo tauri dev

# 特定のモジュールのログ
RUST_LOG=mascot_nanai::ghost=debug cargo tauri dev
```

#### 本番環境でのログ
```bash
# ログファイルの場所
# Windows: %APPDATA%\mascot-nanai\logs\
# Linux: ~/.local/share/mascot-nanai/logs/
```

### ブラウザ開発者ツール

1. **コンソールの確認**:
   ```
   F12 → Console タブ
   ```

2. **ネットワークの確認**:
   ```
   F12 → Network タブ
   ```

3. **要素の確認**:
   ```
   F12 → Elements タブ
   ```

### 設定の初期化

#### 完全な初期化
```bash
# 設定ファイルの削除
rm -rf ~/.local/share/mascot-nanai/

# キャッシュの削除
rm -rf ~/.cache/mascot-nanai/

# 再起動
cargo tauri dev
```

## パフォーマンス問題

### 重い・遅い場合

#### 原因
- メモリ不足
- CPU使用率の高い処理
- 大量のファイルアクセス

#### 対策
1. **メモリ使用量の確認**:
   ```bash
   # プロセス監視
   top -p $(pgrep mascot-nanai)
   ```

2. **ファイルアクセスの最適化**:
   - 不要なファイルスキャンの停止
   - キャッシュの活用

3. **設定の調整**:
   ```json
   {
       "animation_fps": 30,
       "cache_size": 100,
       "scan_interval": 300
   }
   ```

### メモリリークの確認

```bash
# メモリ使用量の監視
watch -n 1 'ps aux | grep mascot-nanai'

# ヒープの確認（開発時）
cargo tauri dev --features=heap-profiling
```

## 環境別の問題

### Windows固有の問題

#### WebView2の問題
```bash
# WebView2 ランタイムの確認
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
```

#### ファイアウォールの問題
```
Windows Defender ファイアウォール
→ アプリの許可
→ mascot-nanai.exe を許可
```

### Linux固有の問題

#### 依存関係の問題
```bash
# 必要なライブラリの確認
ldd target/release/mascot-nanai

# 不足している場合
sudo apt-get install libwebkit2gtk-4.0-dev
```

## 報告の仕方

### Issue報告時の情報

```markdown
## 環境情報
- OS: Windows 11 / Android 12 / Ubuntu 20.04
- アプリバージョン: v1.0.0
- インストール方法: バイナリ / ソースビルド

## 問題の詳細
- 発生日時: 2025-07-11 15:30
- 再現手順: 
  1. アプリを起動
  2. ゴースト管理を開く
  3. ...

## エラーログ
```
RUST_LOG=debug の出力結果
```

## 期待される動作
...

## 追加情報
...
```

## 自己解決のヒント

1. **再起動**: 問題の多くは再起動で解決
2. **設定初期化**: 設定が原因の場合は初期化
3. **ログ確認**: エラーログで原因を特定
4. **バージョン確認**: 最新バージョンを使用
5. **環境確認**: システム要件を満たしているか確認

---

*このドキュメントは継続的に更新され、新しい問題と解決方法が追加されます。*

*最終更新: 2025年7月11日*