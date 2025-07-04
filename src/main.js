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

    // SHIORIテストボタン
    const scanGhostsBtn = document.getElementById('scan-ghosts');
    if (scanGhostsBtn) {
      scanGhostsBtn.addEventListener('click', () => {
        this.scanGhosts();
      });
    }

    const testShioriBtn = document.getElementById('test-shiori');
    if (testShioriBtn) {
      testShioriBtn.addEventListener('click', () => {
        this.testShiori();
      });
    }

    const loadTestGhostBtn = document.getElementById('load-test-ghost');
    if (loadTestGhostBtn) {
      loadTestGhostBtn.addEventListener('click', () => {
        this.loadTestGhost();
      });
    }

    // デバッグ用テストボタンがあれば接続
    const debugTestBtn = document.getElementById('debug-test');
    if (debugTestBtn) {
      debugTestBtn.addEventListener('click', () => {
        this.debugTest();
      });
    }

    // テキストコピー機能の強化
    this.setupTextCopyFeatures();
  }

  setupTextCopyFeatures() {
    // レスポンスエリアでのテキストコピー機能強化
    const responseArea = document.getElementById('shiori-response');
    if (responseArea) {
      // ダブルクリックで全選択
      responseArea.addEventListener('dblclick', () => {
        this.selectAllText(responseArea);
      });

      // 右クリックでコンテキストメニュー（コピー）
      responseArea.addEventListener('contextmenu', (e) => {
        // ブラウザのデフォルトコンテキストメニューを有効にする
        e.stopPropagation();
      });

      // 長押しでテキスト選択（モバイル対応）
      let touchTimer = null;
      responseArea.addEventListener('touchstart', (e) => {
        touchTimer = setTimeout(() => {
          this.selectAllText(responseArea);
        }, 800); // 800ms長押し
      });

      responseArea.addEventListener('touchend', () => {
        if (touchTimer) {
          clearTimeout(touchTimer);
          touchTimer = null;
        }
      });

      responseArea.addEventListener('touchmove', () => {
        if (touchTimer) {
          clearTimeout(touchTimer);
          touchTimer = null;
        }
      });
    }

    // ゴーストリストでも同様の機能を追加
    const ghostList = document.getElementById('ghost-list');
    if (ghostList) {
      ghostList.addEventListener('dblclick', () => {
        this.selectAllText(ghostList);
      });
    }
  }

  selectAllText(element) {
    if (window.getSelection) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
      
      console.log('📋 テキスト全選択完了');
      this.updateStatus('テキストを全選択しました（Ctrl+Cでコピー）');
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

  // SHIORI関連のテスト機能
  async scanGhosts() {
    console.log('🔍 ゴーストディレクトリをスキャン中...');
    this.updateStatus('ゴーストスキャン中...');
    
    try {
      // 相対パスでプロジェクト内のassetsディレクトリを指定
      const testPath = "./assets/ghost";
      console.log(`📂 スキャン対象: ${testPath}`);
      
      const result = await globalThis.__TAURI__.core.invoke('scan_ghost_directory', { 
        ghostDir: testPath 
      });
      
      console.log('✅ ゴーストスキャン結果:', result);
      this.displayGhostList(result);
      this.updateStatus(`ゴーストスキャン完了: ${result.length}個のゴーストを発見`);
      
    } catch (error) {
      console.error('❌ ゴーストスキャンエラー:', error);
      this.updateStatus(`ゴーストスキャンエラー: ${error}`);
      
      // エラーの詳細情報を表示
      this.displayGhostList([]);
      const errorDiv = document.getElementById('ghost-list');
      if (errorDiv) {
        errorDiv.innerHTML = `<div class="error-info">
          <h4>エラー詳細:</h4>
          <pre>${error}</pre>
          <p>Tauriコマンドが正常に呼び出されていない可能性があります。</p>
        </div>`;
      }
    }
  }

  async testShiori() {
    console.log('🧪 SHIORI統合テスト開始...');
    this.updateStatus('SHIORI統合テスト中...');
    
    try {
      // テスト用リクエスト
      const testRequest = "GET Version SHIORI/3.0\r\n\r\n";
      console.log(`📨 送信リクエスト: ${testRequest}`);
      
      const result = await globalThis.__TAURI__.core.invoke('send_shiori_request', { 
        request: testRequest 
      });
      
      console.log('✅ SHIORIレスポンス:', result);
      this.displayShioriResponse(result);
      this.updateStatus('SHIORI統合テスト完了');
      
    } catch (error) {
      console.error('❌ SHIORI統合テストエラー:', error);
      this.updateStatus(`SHIORI統合テストエラー: ${error}`);
      
      // エラーの詳細情報を表示
      const responseDiv = document.getElementById('shiori-response');
      if (responseDiv) {
        responseDiv.innerHTML = `<div class="error-info">
          <h4>SHIORI通信エラー:</h4>
          <pre>${error}</pre>
          <p>SHIORIエンジンが読み込まれていない可能性があります。先にゴーストを読み込んでください。</p>
        </div>`;
      }
    }
  }

  async loadTestGhost() {
    console.log('👻 テストゴースト読み込み開始...');
    this.updateStatus('テストゴースト読み込み中...');
    
    try {
      // テスト用のゴースト名（実際に存在するmock_nanai）
      const testGhostName = "mock_nanai";
      console.log(`👻 読み込み対象: ${testGhostName}`);
      
      const result = await globalThis.__TAURI__.core.invoke('load_ghost', { 
        ghostName: testGhostName 
      });
      
      console.log('✅ テストゴースト読み込み結果:', result);
      this.updateStatus('テストゴースト読み込み完了');
      
      // 読み込み成功時のフィードバック
      const responseDiv = document.getElementById('shiori-response');
      if (responseDiv) {
        responseDiv.innerHTML = `<div class="success-info">
          <h4>ゴースト読み込み成功:</h4>
          <pre>${result}</pre>
          <p>これでSHIORIテストが可能になりました。</p>
        </div>`;
      }
      
    } catch (error) {
      console.error('❌ テストゴースト読み込みエラー:', error);
      this.updateStatus(`テストゴースト読み込みエラー: ${error}`);
      
      // エラーの詳細情報を表示
      const responseDiv = document.getElementById('shiori-response');
      if (responseDiv) {
        responseDiv.innerHTML = `<div class="error-info">
          <h4>ゴースト読み込みエラー:</h4>
          <pre>${error}</pre>
          <p>指定されたゴーストが見つからないか、SHIORIファイルに問題がある可能性があります。</p>
        </div>`;
      }
    }
  }

  async debugTest() {
    console.log('🔧 デバッグテスト開始...');
    this.updateStatus('Tauriコマンドテスト中...');
    
    try {
      const result = await globalThis.__TAURI__.core.invoke('test_command');
      console.log('✅ デバッグテスト成功:', result);
      this.updateStatus(`デバッグテスト成功: ${result}`);
      
      const responseDiv = document.getElementById('shiori-response');
      if (responseDiv) {
        responseDiv.innerHTML = `<div class="success-info">
          <h4>Tauriコマンドテスト成功:</h4>
          <pre>${result}</pre>
          <p>Tauri統合が正常に動作しています。</p>
        </div>`;
      }
      
    } catch (error) {
      console.error('❌ デバッグテストエラー:', error);
      this.updateStatus(`デバッグテストエラー: ${error}`);
      
      const responseDiv = document.getElementById('shiori-response');
      if (responseDiv) {
        responseDiv.innerHTML = `<div class="error-info">
          <h4>Tauriコマンドテストエラー:</h4>
          <pre>${error}</pre>
          <p>Tauri統合に問題があります。</p>
        </div>`;
      }
    }
  }

  displayGhostList(ghosts) {
    const ghostListDiv = document.getElementById('ghost-list');
    if (!ghostListDiv) return;
    
    if (ghosts && ghosts.length > 0) {
      ghostListDiv.innerHTML = '<h4>発見されたゴースト:</h4>' +
        ghosts.map(ghost => `<div class="ghost-item">${ghost.name} (${ghost.shiori_type})</div>`).join('');
    } else {
      ghostListDiv.innerHTML = '<p>ゴーストが見つかりませんでした。</p>';
    }
  }

  displayShioriResponse(response) {
    const responseDiv = document.getElementById('shiori-response');
    if (!responseDiv) return;
    
    responseDiv.innerHTML = `<h4>SHIORIレスポンス:</h4><pre>${response}</pre>`;
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
