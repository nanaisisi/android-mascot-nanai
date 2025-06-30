/**
 * Main Application Controller
 * Single Activity Container管理
 */

// モジュールのインポート
import { GhostController } from './scripts/ghost-controller.js';
import { SettingsController } from './scripts/settings-controller.js';
import { BalloonController } from './scripts/balloon-controller.js';
import { AndroidAdapter } from './scripts/android-adapter.js';

class MascotNanaiApp {
  constructor() {
    this.currentView = 'ghost-view';
    this.controllers = {};
    this.androidAdapter = null;
    
    this.init();
  }

  async init() {
    console.log('🎭 Mascot Nanai App initializing...');
    
    try {
      // Android環境の初期化
      this.androidAdapter = new AndroidAdapter();
      await this.androidAdapter.init();
      
      // コントローラーの初期化
      this.initControllers();
      
      // イベントリスナーの設定
      this.setupEventListeners();
      
      // 初期ビューの表示
      this.showView('ghost-view');
      
      console.log('✅ App initialized successfully');
      
      // デバッグ用：3秒後にテストメッセージを表示
      setTimeout(() => {
        this.controllers.balloon.showMessage('こんにちは！なないです〜♪', {
          type: 'talk',
          duration: 3000,
          choices: ['おはよう！', 'こんにちは']
        });
      }, 3000);
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
    }
  }

  initControllers() {
    // ゴーストコントローラー
    this.controllers.ghost = new GhostController();
    
    // 設定コントローラー
    this.controllers.settings = new SettingsController();
    
    // バルーンコントローラー
    this.controllers.balloon = new BalloonController();
    
    // コントローラー間の連携設定
    this.setupControllerInteractions();
  }

  setupControllerInteractions() {
    // ゴースト -> バルーン：位置連動
    this.controllers.ghost.on('positionChanged', (position) => {
      this.controllers.balloon.updateGhostPosition(position);
    });
    
    // ゴースト -> バルーン：話す
    this.controllers.ghost.on('talk', (message) => {
      this.controllers.balloon.showMessage(message);
    });
    
    // 設定 -> ゴースト：透明度変更
    this.controllers.settings.on('opacityChanged', (opacity) => {
      this.controllers.ghost.setOpacity(opacity);
    });
    
    // 設定 -> ゴースト：ゴースト変更
    this.controllers.settings.on('ghostChanged', (ghostId) => {
      this.controllers.ghost.changeGhost(ghostId);
    });
  }

  setupEventListeners() {
    // 設定ボタン
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.showView('settings-view');
      });
    }

    // 設定戻るボタン
    const settingsBackBtn = document.getElementById('settings-back-btn');
    if (settingsBackBtn) {
      settingsBackBtn.addEventListener('click', () => {
        this.showView('ghost-view');
      });
    }

    // 話すボタン
    const talkBtn = document.getElementById('talk-btn');
    if (talkBtn) {
      talkBtn.addEventListener('click', () => {
        this.controllers.ghost.randomTalk();
      });
    }

    // Android戻るボタン対応
    if (this.androidAdapter) {
      this.androidAdapter.on('backPressed', () => {
        this.handleBackPress();
      });
    }

    // 画面回転対応
    globalThis.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.controllers.ghost.adjustPosition();
      }, 100);
    });

    // ビジビリティ変更（アプリがバックグラウンドに行った時など）
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.controllers.ghost.pause();
      } else {
        this.controllers.ghost.resume();
      }
    });
  }

  showView(viewId) {
    console.log(`🔄 Switching to view: ${viewId}`);
    
    // 現在のビューを非表示
    const currentViewElement = document.getElementById(this.currentView);
    if (currentViewElement) {
      currentViewElement.classList.remove('active');
    }

    // 新しいビューを表示
    const newViewElement = document.getElementById(viewId);
    if (newViewElement) {
      newViewElement.classList.add('active');
      this.currentView = viewId;
      
      // ビュー切り替えアニメーション
      this.animateViewTransition(viewId);
    }
  }

  animateViewTransition(viewId) {
    const viewElement = document.getElementById(viewId);
    if (!viewElement) return;

    switch (viewId) {
      case 'settings-view':
        viewElement.classList.add('slide-in');
        setTimeout(() => {
          viewElement.classList.remove('slide-in');
        }, 300);
        break;
      
      case 'ghost-view':
        // ゴーストビューに戻る時のアニメーション
        this.controllers.ghost.playAppearAnimation();
        break;
    }
  }

  handleBackPress() {
    console.log('📱 Back button pressed');
    
    switch (this.currentView) {
      case 'settings-view':
        this.showView('ghost-view');
        return true; // イベントを消費
      
      case 'ghost-view':
        // ゴーストビューでバックボタンが押された場合はアプリを最小化
        if (this.androidAdapter) {
          this.androidAdapter.minimizeApp();
        }
        return true;
      
      default:
        return false; // デフォルト動作を許可
    }
  }

  // 外部API
  showMessage(text, options = {}) {
    return this.controllers.balloon.showMessage(text, options);
  }

  changeGhost(ghostId) {
    return this.controllers.ghost.changeGhost(ghostId);
  }

  getSettings() {
    return this.controllers.settings.getSettings();
  }

  updateSettings(settings) {
    return this.controllers.settings.updateSettings(settings);
  }
}

// グローバルインスタンス
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
