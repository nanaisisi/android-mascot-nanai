**AI関与について**: このドキュメントはGitHub

> Copilotの支援により作成されました。技術検討・設計はオーナーユーザーとAIの協議により行われています。

# ドキュメント変更履歴

## 2025年6月30日 - 開発方針の大幅変更

### window-design.md の変更

#### 1. 開発段階セクション（変更前後）

> **重要**: 当初Android向けに特化した実装を行ったが、実装が混乱、不明瞭。
> Windows環境での十分な検証と機能実装を優先し、段階的にAndroidに移植する方針に変更。

```markdown
## 開発段階

~~

### 修正された開発フロー

1. **Windows First**: PC環境での多機能実装・検証
   - 複数ウィンドウによる表現
   - デスクトップ環境の利点を活用
   - YAYA連携の完全実装
   - 透過・フローティング・Always On Top等の高度機能

2. **Android Adaptation**: 検証済み機能の移植
   - Windows版で実証された機能をベースに
   - プラットフォーム制約に応じた適応
   - 必要に応じた機能の調整・統合
```

**変更理由**:
Android特化による不明瞭さ、Windows環境での機能実装を優先する方針に転換

#### 2. 実装順序セクション（大幅変更）

**変更前:**

```markdown
### Phase 1: Android基本実装

- WebView内でのキャラクター表示
- Single Activity Container構築

### Phase 2: Android UI拡張

- 設定画面・メッセージ機能実装

### Phase 3: Windows検証環境

- 複数ウィンドウ版の作成（副次的）

### Phase 4: Android高度機能

- システムオーバーレイ対応
```

````
**変更後:**

```markdown
### Phase 1: Windows多機能実装

- PC環境での完全機能実装・検証
- 独立した複数ウィンドウ（ゴースト、設定、バルーン）
- YAYA Shioriとの完全連携
- システムトレイ・ホットキー対応

### Phase 2: Windows機能拡張・安定化

- 高度機能の実装と動作安定性確保
- 複雑なアニメーション・エフェクト
- プラグインシステム

### Phase 3: Android基盤移植

- Windows版機能のAndroid環境への適応
- Single Activity Container化

### Phase 4: Android高度機能


- Android固有機能の活用
````

**変更理由**:
Windows環境を主軸とした段階的開発に変更、Android移植は後続フェーズに

#### 3. 新規追加セクション

**追加内容:**

```markdown
## 開発方針の転換

### 現状の反省点

1. **過度なAndroid特化**: PC環境の利点を活用できていない
2. **機能制限**: Single Activity Containerによる表現力の制限
3. **YAYA連携不足**: 独自実装によるエコシステムとの乖離

### 新方針: Windows First Development

1. **複数ウィンドウ活用**: 各機能を独立したウィンドウとして実装
2. **デスクトップ環境最適化**: 透過、Always On Top、フローティング等の活用
3. **YAYA完全連携**: Shiori DLLとの直接連携
4. **段階的移植**: Windows版ベースでAndroid版開発

### 今後の作業

1. **index.htmlの最小化**: 複雑な実装を基本構造のみに簡素化
2. **独立ウィンドウ設計**: 各機能を独立HTMLファイルに分離
3. **YAYA連携基盤**: Tauri経由Shiori DLL呼び出し実装
4. **Windows向け最適化**: デスクトップ環境の利点最大化
```

**追加理由**: 方針転換の背景と具体的な作業方針を明確化

```markdown
### 影響を受けるファイル

#### src/index.html

- **変更**: Android特化の複雑なUI → Windows開発用最小限UI
- **内容**: Single Activity Container削除、開発用ボタン追加

#### src/main.js

- **変更**: Android特化コントローラー → Windows開発基盤クラス
- **内容**: 複数ウィンドウ管理、YAYA連携スタブ実装

#### src/styles.css

- **変更**: Android特化スタイル → Windows向け開発UI
- **内容**: タッチ操作対応削除、デスクトップ向けスタイル採用

### 技術的な方針変更

1. **UI設計**: Single Activity Container → 複数独立ウィンドウ
2. **プラットフォーム**: Android First → Windows First
3. **機能実装**: 制約ベース → 機能フル実装
4. **連携**: 簡易実装 → YAYA完全連携

### 期待される効果

1. **多機能性の回復**: PC環境の利点を最大活用
2. **拡張性の向上**: 段階的機能追加が容易
3. **エコシステム連携**: 既存SHIORI環境との完全互換
4. **開発効率**: 制約の少ない環境での迅速な機能実装
```

## 2025年6月30日（続） - 方針の再見直し・整理

### 目的: Android向けUI検証を主軸とした方針への回帰

#### 実施内容

1. **window-design.md の方針明確化**
   - WindowsはAndroid向けUIの検証用であることを明記
   - 将来的なWindows固有機能（Splashscreen等）は分離検討対象として明記
   - 実装順序からWindows固有機能を分離し、将来的検討事項に変更

2. **方針転換の理由**
   - Android向けUIの検証・開発に集中したい
   - Windows固有機能は現在のスコープ外とし、混乱を避ける
   - 段階的・焦点を絞った開発アプローチの採用

3. **具体的な変更点**
   - 概要セクション: Windows検証用の役割を明記
   - ファイル配置: Windows固有構成を将来検討事項として分離
   - Tauri設定: Windows固有設定を将来検討事項として分離
   - 実装順序: Windows固有機能を将来的検討事項に移動

**変更理由**:
Android向けUIの検証・実装に集中し、将来的な話は分離することで明確性を向上。
