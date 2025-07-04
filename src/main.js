/**
 * Mascot Nanai - Android UI検証用メインコントローラ
 * Android向けUIの検証・開発
 */

class MascotNanaiApp {
  constructor() {
    this.currentView = 'ghost';
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    console.log('🎭 Mascot Nanai Android UI検証開始...');
    
    try {
      this.updateStatus('Android向けUI初期化中...');
      
      // UI環境の初期化
      await this.initUIEnvironment();
      
      // イベントリスナーの設定
      this.setupEventListeners();
      
      // 初期ビューの表示
      this.showView('ghost');
      
      this.isInitialized = true;
      this.updateStatus('Android向けUI検証準備完了');
      
      console.log('✅ Android UI検証環境初期化完了');
      
    } catch (error) {
      console.error('❌ Android UI検証環境の初期化に失敗:', error);
      this.updateStatus(`エラー: ${error.message}`);
    }
  }

  async initUIEnvironment() {
    // Android向けUI機能の初期化
    console.log('📱 Android向けUI機能準備中...');
    
    // Android向けUI機能の準備
    // - シングルコンテナ管理
    // - ビュー切り替え
    // - タッチインタラクション
    // - Android固有制約への対応
  }

  setupEventListeners() {
    // ビュー切り替えボタン
    const showGhostBtn = document.getElementById('show-ghost');
    if (showGhostBtn) {
      showGhostBtn.addEventListener('click', () => {
        this.showView('ghost');
      });
    }

    const showBalloonBtn = document.getElementById('show-balloon');
    if (showBalloonBtn) {
      showBalloonBtn.addEventListener('click', () => {
        this.showView('balloon');
      });
    }

    const showSettingsBtn = document.getElementById('show-settings');
    if (showSettingsBtn) {
      showSettingsBtn.addEventListener('click', () => {
        this.showView('settings');
      });
    }

    // 設定画面の戻るボタン
    const backToGhostBtn = document.getElementById('back-to-ghost');
    if (backToGhostBtn) {
      backToGhostBtn.addEventListener('click', () => {
        this.showView('ghost');
      });
    }

    // ゴースト表示切り替え
    const ghostVisibleCheckbox = document.getElementById('ghost-visible');
    if (ghostVisibleCheckbox) {
      ghostVisibleCheckbox.addEventListener('change', (e) => {
        this.toggleGhostVisibility(e.target.checked);
      });
    }

    // ゴーストキャラクターのタッチインタラクション
    const ghostCharacter = document.getElementById('ghost-character');
    if (ghostCharacter) {
      ghostCharacter.addEventListener('click', () => {
        this.onGhostTouch();
      });
    }
  }

  showView(viewName) {
    console.log(`📱 ビュー切り替え: ${viewName}`);
    
    // 全ビューを非表示
    const views = document.querySelectorAll('.view');
    views.forEach(view => {
      view.classList.add('hidden');
    });

    // 指定されたビューを表示
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
      targetView.classList.remove('hidden');
      this.currentView = viewName;
      this.updateStatus(`${viewName}ビュー表示中`);
    }
  }

  toggleGhostVisibility(visible) {
    const ghostCharacter = document.getElementById('ghost-character');
    if (ghostCharacter) {
      ghostCharacter.style.display = visible ? 'block' : 'none';
      this.updateStatus(`ゴースト表示: ${visible ? 'ON' : 'OFF'}`);
    }
  }

  onGhostTouch() {
    console.log('👻 ゴーストタッチ検出');
    
    // バルーンビューを表示
    this.showView('balloon');
    
    // メッセージをランダム選択
    const messages = [
      'こんにちは！',
      'タッチありがとう！',
      'Android向けUI検証中です',
      'どんな機能が欲しいですか？',
      'がんばって開発していますよ～'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const balloonText = document.getElementById('balloon-text');
    if (balloonText) {
      balloonText.textContent = randomMessage;
    }

    // 3秒後にゴーストビューに戻る
    setTimeout(() => {
      this.showView('ghost');
    }, 3000);
  }

  updateStatus(message) {
    const statusElement = document.getElementById('app-status');
    if (statusElement) {
      statusElement.textContent = message;
    }
    console.log(`📊 Status: ${message}`);
  }

  // 外部API（Android実装用）
  getAppInfo() {
    return {
      isInitialized: this.isInitialized,
      platform: 'Android検証用',
      currentView: this.currentView,
      version: '0.1.0-android-ui'
    };
  }
}

// アプリケーション初期化
let app = null;

// DOM読み込み完了後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  app = new MascotNanaiApp();
  
  // デバッグ用：グローバルアクセス
  if (typeof globalThis !== 'undefined') {
    globalThis.mascotApp = app;
  }
}

export { MascotNanaiApp };
