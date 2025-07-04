/**
 * Mascot Nanai - 透過マスコットアプリ版
 * ゴースト読み込み機能を含む完全実装
 */

class MascotNanaiApp {
  constructor() {
    this.isInitialized = false;
    this.ghosts = [];
    this.currentGhost = null;
    this.currentBalloon = 'default';
    this.settings = {
      autoLoadGhost: true,
      enableNotifications: true,
      darkMode: false,
      alwaysOnTop: true,
      ghostSize: 'medium',
      debugLevel: 'info'
    };
    
    this.init();
  }

  async init() {
    console.log('=== Mascot Nanai 初期化開始 ===');
    console.log('Tauri環境:', typeof window.__TAURI__ !== 'undefined');
    console.log('DOM読み込み状況:', document.readyState);
    
    try {
      // UI環境の初期化
      console.log('UI環境初期化中...');
      await this.initUIEnvironment();
      console.log('UI環境初期化完了');
      
      // イベントリスナーの設定
      console.log('イベントリスナー設定中...');
      this.setupEventListeners();
      console.log('イベントリスナー設定完了');
      
      // 設定読み込み
      console.log('設定読み込み中...');
      this.loadSettings();
      console.log('設定読み込み完了:', this.settings);
      
      // UI設定の適用
      console.log('UI設定適用中...');
      this.applyGhostSize();
      console.log('UI設定適用完了');
      
      // 自動ゴースト読み込み
      if (this.settings.autoLoadGhost) {
        console.log('自動ゴースト読み込み開始...');
        await this.autoLoadGhost();
        console.log('自動ゴースト読み込み完了');
      }
      
      // 初期化完了
      this.isInitialized = true;
      console.log('=== Mascot Nanai 初期化完了 ===');
      
      // 初期状態では何も表示しない
      this.updateGhostCharacter(null);
      
      // 秒間隔イベントの開始
      this.startSecondTimer();
      
      console.log('✅ 透過マスコットUI初期化完了');
      
    } catch (error) {
      console.error('❌ UI初期化に失敗:', error);
    }
  }

  initUIEnvironment() {
    console.log('📱 マスコットUI機能準備中...');
    
    // UI要素の取得
    this.elements = {
      // メイン要素
      statusText: document.getElementById('status-text'),
      connectionStatus: document.getElementById('connection-status'),
      ghostCharacter: document.getElementById('ghost-character'),
      balloonDisplay: document.getElementById('balloon-display'),
      balloonText: document.getElementById('balloon-text'),
      
      // モーダル要素
      modalOverlay: document.getElementById('modal-overlay'),
      modalContent: document.getElementById('modal-content'),
      modalClose: document.getElementById('modal-close'),
    };
  }

  // ===========================================
  // 自動ゴースト読み込み機能
  // ===========================================

  async autoLoadGhost() {
    console.log('🔄 自動ゴースト読み込み開始...');
    
    try {
      // 保存されたゴースト情報を読み込み
      const savedGhost = localStorage.getItem('mascot-nanai-current-ghost');
      if (savedGhost) {
        const ghostInfo = JSON.parse(savedGhost);
        console.log('💾 保存されたゴースト情報:', ghostInfo);
        
        // ゴーストの存在確認とロード
        const exists = await this.verifyGhostExists(ghostInfo);
        if (exists) {
          this.currentGhost = ghostInfo;
          this.updateGhostCharacter(ghostInfo.name);
          this.updateStatus(`ゴースト「${ghostInfo.name}」をロード`, true);
          return;
        }
      }
      
      // 保存されたゴーストがない場合、デフォルトディレクトリをスキャン
      await this.scanAndLoadFirstGhost();
      
    } catch (error) {
      console.error('❌ 自動ゴースト読み込みエラー:', error);
      this.updateStatus('ゴースト読み込み失敗', false);
      // エラーの場合は何も表示しない
      this.updateGhostCharacter(null);
    }
  }

  async verifyGhostExists(ghostInfo) {
    try {
      // Tauriが利用可能でない場合（ブラウザテスト等）
      if (!window.__TAURI__) {
        console.log('Tauri環境ではありません - ローカルテスト中');
        return false;
      }
      
      const result = await window.__TAURI__.invoke('scan_ghosts', { 
        ghostPath: ghostInfo.path || 'assets/ghost' 
      });
      
      return result.ghosts?.some(g => g.name === ghostInfo.name) || false;
    } catch (error) {
      console.error('ゴースト存在確認エラー:', error);
      return false;
    }
  }

  async scanAndLoadFirstGhost() {
    console.log('🔍 デフォルトゴーストスキャン開始...');
    
    try {
      // Tauriが利用可能でない場合のエラーハンドリング
      if (!window.__TAURI__) {
        console.log('Tauri環境ではありません');
        this.updateStatus('開発環境モード', false);
        this.updateGhostCharacter(null);
        return;
      }
      
      const result = await window.__TAURI__.invoke('scan_ghosts', { 
        ghostPath: 'assets/ghost' 
      });
      
      this.ghosts = result.ghosts || [];
      console.log(`👻 ${this.ghosts.length}個のゴーストを発見`);
      
      if (this.ghosts.length > 0) {
        // mock_nanaiを最優先で選択、見つからない場合は最初のゴーストを選択
        let defaultGhost = this.ghosts.find(g => g.name === 'mock_nanai');
        if (!defaultGhost) {
          defaultGhost = this.ghosts[0];
        }
        
        this.selectGhost(defaultGhost.name);
        console.log(`🎯 「${defaultGhost.name}」を自動選択`);
      } else {
        this.updateStatus('ゴーストが見つかりません', false);
        this.showBalloon('ゴーストファイルが見つかりません。assets/ghostディレクトリを確認してください。');
        setTimeout(() => this.hideBalloon(), 5000);
        // ゴーストが見つからない場合は何も表示しない
        this.updateGhostCharacter(null);
      }
      
    } catch (error) {
      console.error('❌ ゴーストスキャンエラー:', error);
      this.updateStatus('スキャンエラー', false);
      // エラーの場合は何も表示しない
      this.updateGhostCharacter(null);
    }
  }

  setupEventListeners() {
    console.log('🔧 イベントリスナー設定中...');

    // 右上メニューボタン（iframe版）
    const menuBtn = document.getElementById('menu-btn');
    const menuIframeContainer = document.getElementById('menu-iframe-container');
    
    if (menuBtn) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleIframeMenu(menuIframeContainer);
        console.log('iframeメニューボタンクリック');
      });
      console.log('✅ iframeメニューボタンのイベントリスナー設定完了');
    } else {
      console.error('❌ メニューボタンが見つかりません');
    }

    // iframe内からのメッセージ受信（既にindex.htmlで設定済み）
    console.log('✅ iframeメッセージリスナーは既に設定済み');

    // メニュー外をクリックしたら閉じる
    document.addEventListener('click', () => {
      this.hideIframeMenu(menuIframeContainer);
    });

    // 旧メニューアイテム（削除済みのため、コメントアウト）
    // これらのイベントリスナーはiframeメニューで処理される
    
    // ゴーストキャラクターのクリック
    this.elements.ghostCharacter?.addEventListener('click', () => {
      this.onGhostClick();
    });

    // 右クリックでiframeメニュー表示
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.toggleIframeMenu(menuIframeContainer);
    });

    // モーダル制御
    this.elements.modalClose?.addEventListener('click', () => this.hideModal());
    this.elements.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === this.elements.modalOverlay) {
        this.hideModal();
      }
    });

    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideModal();
        this.hideIframeMenu(menuIframeContainer);
      } else if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        this.refreshGhosts();
      }
    });
  }

  // ===========================================
  // ゴースト・バルーン表示機能
  // ===========================================

  onGhostClick() {
    // ゴーストクリック時の動作
    if (this.currentGhost) {
      // Tauri側のマウスクリックイベントも送信
      this.notifyMouseClick();
      // SHIORI経由でマウスクリックイベント送信
      this.sendShioriEvent('OnMouseClick');
    } else {
      // ゴーストが選択されていない場合は何もしない
      console.log('ゴーストが選択されていません');
    }
  }

  startSecondTimer() {
    // 1秒間隔でOnSecondChangeイベントを送信
    this.secondTimer = setInterval(async () => {
      if (this.currentGhost) {
        try {
          await window.__TAURI__.invoke('on_second_change');
        } catch (error) {
          // エラーは無視（SHIORIが読み込まれていない場合など）
        }
      }
    }, 1000);
  }

  stopSecondTimer() {
    if (this.secondTimer) {
      clearInterval(this.secondTimer);
      this.secondTimer = null;
    }
  }

  async notifyMouseClick() {
    try {
      await window.__TAURI__.invoke('on_mouse_click');
      console.log('🖱️ マウスクリック通知送信');
    } catch (error) {
      console.log('マウスクリック通知エラー:', error);
    }
  }

  async sendShioriEvent(eventName) {
    try {
      console.log(`📤 SHIORIイベント送信: ${eventName}`);
      
      const response = await window.__TAURI__.invoke('send_shiori_event', { 
        event: eventName 
      });
      
      if (response && response.trim()) {
        this.showBalloon(response);
      } else {
        // SHIORIからの応答がない場合のフォールバック
        this.showBalloon('こんにちは！');
      }
      
      // 3秒後に自動で隠す
      setTimeout(() => this.hideBalloon(), 3000);
      
    } catch (error) {
      console.error('❌ SHIORIイベントエラー:', error);
      this.showBalloon('エラーが発生しました。');
      setTimeout(() => this.hideBalloon(), 3000);
    }
  }

  async sendRandomMessageToGhost() {
    // 利用可能なSHIORIイベント
    const randomEvents = [
      'OnBoot',
      'OnSecondChange',
      'OnTalk',
      'OnAITalk'
    ];
    
    const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    await this.sendShioriEvent(randomEvent);
  }

  showBalloon(text) {
    if (this.elements.balloonText && this.elements.balloonDisplay) {
      this.elements.balloonText.textContent = text;
      this.elements.balloonDisplay.style.display = 'block';
    }
  }

  hideBalloon() {
    if (this.elements.balloonDisplay) {
      this.elements.balloonDisplay.style.display = 'none';
    }
  }

  updateGhostCharacter(ghostName) {
    // ゴーストキャラクターの更新
    if (this.elements.ghostCharacter) {
      const placeholder = this.elements.ghostCharacter.querySelector('.character-placeholder');
      if (placeholder) {
        // ghostNameがnullまたは未定義の場合は何も表示しない
        if (!ghostName) {
          placeholder.innerHTML = '';
          placeholder.title = '';
          return;
        }
        
        // mock_nanaiの場合は実際の画像を表示
        if (ghostName === 'mock_nanai') {
          placeholder.innerHTML = `<img src="assets/ghost/mock_nanai/shell/master/surface0.png" 
                                         alt="${ghostName}" 
                                         style="width: 100%; height: 100%; object-fit: contain;" 
                                         onerror="console.error('画像読み込みエラー'); this.style.display='none';">`;
        } else {
          // その他のゴーストの場合も何も表示しない
          placeholder.innerHTML = '';
        }
        
        placeholder.title = ghostName || '';
      }
    }
  }

  applyGhostSize() {
    const sizes = {
      small: '80px',
      medium: '120px',
      large: '160px'
    };
    
    const ghostDisplay = document.querySelector('.ghost-display');
    const placeholder = document.querySelector('.character-placeholder');
    
    if (ghostDisplay) {
      const size = sizes[this.settings.ghostSize] || sizes.medium;
      ghostDisplay.style.width = size;
      ghostDisplay.style.height = size;
    }
    
    if (placeholder) {
      // テキストベースの場合のフォントサイズ
      placeholder.style.fontSize = sizes[this.settings.ghostSize] || sizes.medium;
    }
  }

  // ===========================================
  // iframeメニュー制御機能
  // ===========================================

  toggleIframeMenu(menuContainer) {
    if (!menuContainer) {
      console.error('iframeメニューコンテナが見つかりません');
      return;
    }
    
    const isCurrentlyVisible = menuContainer.style.display !== 'none';
    console.log(`iframeメニュー表示切り替え: ${isCurrentlyVisible ? '非表示' : '表示'}`);
    
    if (isCurrentlyVisible) {
      menuContainer.style.display = 'none';
    } else {
      menuContainer.style.display = 'block';
    }
  }

  hideIframeMenu(menuContainer) {
    if (!menuContainer) return;
    menuContainer.style.display = 'none';
  }

  // ===========================================
  // 旧メニュー制御機能（後方互換性）
  // ===========================================

  toggleMenu(menu) {
    if (!menu) {
      console.error('メニュー要素が見つかりません');
      return;
    }
    
    const isCurrentlyVisible = menu.classList.contains('show');
    console.log(`メニュー表示切り替え: ${isCurrentlyVisible ? '非表示' : '表示'}`);
    
    menu.classList.toggle('show');
  }

  hideMenu(menu) {
    if (!menu) return;
    menu.classList.remove('show');
  }

  // ===========================================
  // モーダル制御機能
  // ===========================================

  showModal(contentId) {
    const content = document.getElementById(contentId);
    if (!content || !this.elements.modalContent || !this.elements.modalOverlay) return;

    this.elements.modalContent.innerHTML = content.innerHTML;
    this.elements.modalOverlay.style.display = 'flex';
    
    // モーダル固有のイベントリスナーを設定
    this.setupModalEventListeners(contentId);
  }

  hideModal() {
    if (this.elements.modalOverlay) {
      this.elements.modalOverlay.style.display = 'none';
    }
  }

  setupModalEventListeners(contentId) {
    switch (contentId) {
      case 'ghost-modal-content':
        this.setupGhostModalListeners();
        break;
      case 'balloon-modal-content':
        this.setupBalloonModalListeners();
        break;
      case 'scan-modal-content':
        this.setupScanModalListeners();
        break;
      case 'test-modal-content':
        this.setupTestModalListeners();
        break;
      case 'settings-modal-content':
        this.setupSettingsModalListeners();
        break;
      case 'debug-modal-content':
        this.setupDebugModalListeners();
        break;
    }
  }

  // ===========================================
  // ゴーストモーダル（強化版）
  // ===========================================

  showGhostModal() {
    this.showModal('ghost-modal-content');
    this.refreshGhostList();
    this.updateCurrentGhostDisplay();
  }

  setupGhostModalListeners() {
    document.getElementById('refresh-ghosts-btn')?.addEventListener('click', () => {
      this.refreshGhosts();
    });
  }

  async refreshGhosts() {
    console.log('🔄 ゴーストリスト更新中...');
    
    try {
      const ghostDirectory = document.getElementById('ghost-directory')?.value || 'assets/ghost';
      
      this.updateGhostStatus('スキャン中...');
      
      // Tauriが利用可能でない場合のエラーハンドリング
      if (!window.__TAURI__) {
        this.updateGhostStatus('Tauri環境ではありません');
        console.log('Tauri環境ではありません - ダミーデータを使用');
        this.ghosts = [];
        this.refreshGhostList();
        return;
      }
      
      const result = await window.__TAURI__.invoke('scan_ghosts', { 
        ghostPath: ghostDirectory 
      });
      
      console.log('👻 ゴーストスキャン結果:', result);
      
      this.ghosts = result.ghosts || [];
      this.refreshGhostList();
      
      this.updateGhostStatus(`${this.ghosts.length}個のゴーストが見つかりました`);
      
      // デバッグ情報も表示
      if (result.debug) {
        console.log('🔍 スキャンデバッグ情報:', result.debug);
      }
      
    } catch (error) {
      console.error('❌ ゴーストスキャンエラー:', error);
      this.updateGhostStatus(`エラー: ${error}`);
      this.ghosts = [];
      this.refreshGhostList();
    }
  }

  refreshGhostList() {
    const ghostList = document.getElementById('ghost-list');
    if (!ghostList) return;

    if (this.ghosts.length === 0) {
      ghostList.innerHTML = '<div class="info">ゴーストが見つかりません。パスを確認してスキャンしてください。</div>';
      return;
    }

    ghostList.innerHTML = this.ghosts.map((ghost, index) => 
      `<div class="ghost-item ${this.currentGhost?.name === ghost.name ? 'active' : ''}" 
           data-ghost="${ghost.name}" data-index="${index}">
        <strong>${ghost.name}</strong><br>
        <small>${ghost.path}</small>
      </div>`
    ).join('');

    // ゴーストアイテムクリックイベント
    ghostList.querySelectorAll('.ghost-item').forEach(item => {
      item.addEventListener('click', () => {
        this.selectGhost(item.dataset.ghost);
        
        // 他のアイテムの active クラスを削除
        ghostList.querySelectorAll('.ghost-item').forEach(i => i.classList.remove('active'));
        // 選択されたアイテムに active クラスを追加
        item.classList.add('active');
      });
    });
  }

  selectGhost(ghostName) {
    const ghost = this.ghosts.find(g => g.name === ghostName);
    if (!ghost) return;

    this.currentGhost = ghost;
    this.updateCurrentGhostDisplay();
    this.updateGhostCharacter(ghostName);
    
    // ゴースト情報を保存
    localStorage.setItem('mascot-nanai-current-ghost', JSON.stringify(ghost));
    
    // SHIORI初期化を試行
    this.initializeGhostSHIORI(ghost);
    
    this.showBalloon(`ゴースト「${ghostName}」を選択しました。`);
    setTimeout(() => this.hideBalloon(), 2000);
    
    this.updateStatus(`ゴースト: ${ghostName}`, true);
  }

  async initializeGhostSHIORI(ghost) {
    try {
      console.log(`🎭 SHIORI初期化開始: ${ghost.name}`);
      
      const result = await window.__TAURI__.invoke('load_ghost', {
        ghostName: ghost.name
      });
      
      console.log('✅ SHIORI初期化成功:', result);
      
      // 初期化後にOnBootイベントを送信
      setTimeout(async () => {
        try {
          await this.sendShioriEvent('OnBoot');
        } catch (error) {
          console.log('OnBootイベント送信スキップ:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ SHIORI初期化エラー:', error);
    }
  }

  updateCurrentGhostDisplay() {
    const currentGhostEl = document.getElementById('current-ghost');
    if (currentGhostEl && this.currentGhost) {
      currentGhostEl.textContent = this.currentGhost.name;
      currentGhostEl.style.background = '#e8f5e8';
      currentGhostEl.style.color = '#2e7d32';
    } else if (currentGhostEl) {
      currentGhostEl.textContent = '未選択';
      currentGhostEl.style.background = '#f5f5f5';
      currentGhostEl.style.color = '#666';
    }
  }

  updateGhostStatus(message) {
    const ghostList = document.getElementById('ghost-list');
    if (ghostList) {
      ghostList.innerHTML = `<div class="info">${message}</div>`;
    }
  }

  // ===========================================
  // その他のモーダル機能（既存実装を維持）
  // ===========================================

  showBalloonModal() {
    this.showModal('balloon-modal-content');
  }

  setupBalloonModalListeners() {
    document.getElementById('refresh-balloons-btn')?.addEventListener('click', () => {
      this.refreshBalloons();
    });
  }

  refreshBalloons() {
    console.log('💭 バルーン更新');
    this.showBalloon('バルーン機能は今後実装予定です。');
    setTimeout(() => this.hideBalloon(), 2000);
  }

  showScanModal() {
    this.showModal('scan-modal-content');
  }

  setupScanModalListeners() {
    document.getElementById('start-scan-btn')?.addEventListener('click', () => {
      this.startScan();
    });
  }

  async startScan() {
    const scanPath = document.getElementById('scan-path')?.value || 'assets/';
    const scanResults = document.getElementById('scan-results');
    const debugInfo = document.getElementById('scan-debug-info');

    if (scanResults) {
      scanResults.innerHTML = '<div class="info">スキャン実行中...</div>';
    }

    try {
      const result = await window.__TAURI__.invoke('scan_ghosts', { 
        ghostPath: scanPath 
      });

      if (scanResults) {
        const resultHtml = `
          <div><strong>スキャン完了:</strong></div>
          <div>パス: ${result.inputPath} → ${result.resolvedPath}</div>
          <div>検出ゴースト: ${result.ghosts?.length || 0}個</div>
          ${result.ghosts?.map(g => `<div>- ${g.name} (${g.path})</div>`).join('') || ''}
        `;
        scanResults.innerHTML = resultHtml;
      }

      if (debugInfo && result.debug) {
        debugInfo.innerHTML = `<pre>${result.debug}</pre>`;
      }

    } catch (error) {
      if (scanResults) {
        scanResults.innerHTML = `<div class="error">エラー: ${error}</div>`;
      }
    }
  }

  showTestModal() {
    this.showModal('test-modal-content');
  }

  setupTestModalListeners() {
    document.getElementById('test-shiori-init')?.addEventListener('click', () => {
      this.testShioriInit();
    });
    
    document.getElementById('test-shiori-request')?.addEventListener('click', () => {
      this.testShioriRequest();
    });
    
    document.getElementById('test-shiori-finalize')?.addEventListener('click', () => {
      this.testShioriFinalize();
    });
    
    document.getElementById('send-test-message')?.addEventListener('click', () => {
      this.sendTestMessage();
    });
    
    document.getElementById('test-path-resolve')?.addEventListener('click', () => {
      this.testPathResolve();
    });
  }

  async testShioriInit() {
    this.updateTestResults('SHIORI初期化テスト実行中...');
    
    try {
      const result = await window.__TAURI__.invoke('shiori_initialize', {});
      this.updateTestResults(`SHIORI初期化成功: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      this.updateTestResults(`SHIORI初期化エラー: ${error}`);
    }
  }

  async testShioriRequest() {
    this.updateTestResults('SHIORIリクエストテスト実行中...');
    
    try {
      const result = await window.__TAURI__.invoke('shiori_request', { 
        request: 'GET SHIORI/3.0\\r\\nCharset: UTF-8\\r\\n\\r\\n' 
      });
      this.updateTestResults(`SHIORIリクエスト成功: ${result}`);
    } catch (error) {
      this.updateTestResults(`SHIORIリクエストエラー: ${error}`);
    }
  }

  async testShioriFinalize() {
    this.updateTestResults('SHIORI終了テスト実行中...');
    
    try {
      const result = await window.__TAURI__.invoke('shiori_finalize', {});
      this.updateTestResults(`SHIORI終了成功: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      this.updateTestResults(`SHIORI終了エラー: ${error}`);
    }
  }

  async sendTestMessage() {
    const message = document.getElementById('test-message')?.value || 'hello';
    this.updateTestResults(`テストメッセージ送信中: "${message}"`);
    
    try {
      const result = await window.__TAURI__.invoke('send_message_to_ghost', { 
        message: message 
      });
      this.updateTestResults(`メッセージ送信成功: ${result}`);
      
      // バルーンに応答を表示
      this.showBalloon(result || 'テストメッセージを送信しました');
      setTimeout(() => this.hideBalloon(), 3000);
      
    } catch (error) {
      this.updateTestResults(`メッセージ送信エラー: ${error}`);
    }
  }

  async testPathResolve() {
    const testPath = document.getElementById('path-test-input')?.value || '../assets/ghost';
    this.updateTestResults(`パス解決テスト実行中: "${testPath}"`);
    
    try {
      const result = await window.__TAURI__.invoke('resolve_asset_path', { 
        path: testPath 
      });
      this.updateTestResults(`パス解決成功:\n入力: ${result.input}\n解決: ${result.resolved}`);
    } catch (error) {
      this.updateTestResults(`パス解決エラー: ${error}`);
    }
  }

  updateTestResults(message) {
    const testResults = document.getElementById('test-results');
    if (testResults) {
      testResults.innerHTML = `<pre>${message}</pre>`;
    }
  }

  // ===========================================
  // 設定モーダル（強化版）
  // ===========================================

  showSettingsModal() {
    this.showModal('settings-modal-content');
    this.loadSettingsModal();
  }

  setupSettingsModalListeners() {
    document.getElementById('save-settings-btn')?.addEventListener('click', () => {
      this.saveSettings();
    });
    
    document.getElementById('reset-settings-btn')?.addEventListener('click', () => {
      this.resetSettings();
    });
  }

  loadSettings() {
    // アプリ起動時の設定読み込み
    const saved = localStorage.getItem('mascot-nanai-settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
    this.applySettings();
  }

  loadSettingsModal() {
    // モーダル表示時の設定読み込み
    const autoLoadGhost = document.getElementById('auto-load-ghost');
    if (autoLoadGhost) autoLoadGhost.checked = this.settings.autoLoadGhost;
    
    const enableNotifications = document.getElementById('enable-notifications');
    if (enableNotifications) enableNotifications.checked = this.settings.enableNotifications;
    
    const darkMode = document.getElementById('dark-mode');
    if (darkMode) darkMode.checked = this.settings.darkMode;
    
    const alwaysOnTop = document.getElementById('always-on-top');
    if (alwaysOnTop) alwaysOnTop.checked = this.settings.alwaysOnTop;
    
    const ghostSizeSelect = document.getElementById('ghost-size');
    if (ghostSizeSelect) {
      ghostSizeSelect.value = this.settings.ghostSize;
    }
    
    const debugLevelSelect = document.getElementById('debug-level');
    if (debugLevelSelect) {
      debugLevelSelect.value = this.settings.debugLevel;
    }
  }

  saveSettings() {
    // UI要素から設定を取得
    this.settings.autoLoadGhost = document.getElementById('auto-load-ghost')?.checked || false;
    this.settings.enableNotifications = document.getElementById('enable-notifications')?.checked || false;
    this.settings.darkMode = document.getElementById('dark-mode')?.checked || false;
    this.settings.alwaysOnTop = document.getElementById('always-on-top')?.checked || false;
    this.settings.ghostSize = document.getElementById('ghost-size')?.value || 'medium';
    this.settings.debugLevel = document.getElementById('debug-level')?.value || 'info';

    // ローカルストレージに保存
    localStorage.setItem('mascot-nanai-settings', JSON.stringify(this.settings));

    // 設定を適用
    this.applySettings();

    this.showBalloon('設定を保存しました。');
    setTimeout(() => this.hideBalloon(), 2000);
    this.hideModal();
  }

  resetSettings() {
    this.settings = {
      autoLoadGhost: true,
      enableNotifications: true,
      darkMode: false,
      alwaysOnTop: true,
      ghostSize: 'medium',
      debugLevel: 'info'
    };

    localStorage.removeItem('mascot-nanai-settings');
    this.loadSettingsModal();
    this.applySettings();
    this.showBalloon('設定をリセットしました。');
    setTimeout(() => this.hideBalloon(), 2000);
  }

  applySettings() {
    // ダークモードの適用
    if (this.settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // ゴーストサイズの適用
    this.applyGhostSize();

    // その他の設定適用は今後実装
  }

  // ===========================================
  // デバッグモーダル
  // ===========================================

  showDebugModal() {
    this.showModal('debug-modal-content');
    this.loadSystemInfo();
  }

  setupDebugModalListeners() {
    document.getElementById('apply-log-level')?.addEventListener('click', () => {
      this.applyLogLevel();
    });
    
    document.getElementById('clear-logs')?.addEventListener('click', () => {
      this.clearLogs();
    });
    
    document.getElementById('export-logs')?.addEventListener('click', () => {
      this.exportLogs();
    });
  }

  async loadSystemInfo() {
    try {
      const osInfoEl = document.getElementById('os-info');
      const tauriVersionEl = document.getElementById('tauri-version');
      const appVersionEl = document.getElementById('app-version');
      
      if (osInfoEl) osInfoEl.textContent = 'Windows';
      if (tauriVersionEl) tauriVersionEl.textContent = '2.1.0';
      if (appVersionEl) appVersionEl.textContent = 'v1.0.0';

    } catch (error) {
      console.error('システム情報取得エラー:', error);
    }
  }

  applyLogLevel() {
    const logLevel = document.getElementById('log-level')?.value || 'debug';
    console.log(`ログレベルを ${logLevel} に設定`);
    this.addLogEntry('info', `ログレベルを ${logLevel} に変更しました`);
  }

  clearLogs() {
    const logOutput = document.getElementById('log-output');
    if (logOutput) {
      logOutput.innerHTML = '<div class="log-entry info">ログをクリアしました</div>';
    }
  }

  exportLogs() {
    const logOutput = document.getElementById('log-output');
    if (logOutput) {
      const logs = logOutput.textContent;
      const blob = new Blob([logs], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mascot-nanai-logs-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  addLogEntry(level, message) {
    const logOutput = document.getElementById('log-output');
    if (logOutput) {
      const entry = document.createElement('div');
      entry.className = `log-entry ${level}`;
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      logOutput.appendChild(entry);
      logOutput.scrollTop = logOutput.scrollHeight;
    }
  }

  showHelpModal() {
    this.showModal('help-modal-content');
  }

  // ===========================================
  // ステータス更新
  // ===========================================

  updateStatus(text, connected = null) {
    // ステータス表示を無効化 - 右上メニューに集中するため
    console.log(`Status: ${text} (Connected: ${connected})`);
  }
}

// アプリケーション開始
window.addEventListener('DOMContentLoaded', () => {
  window.mascotApp = new MascotNanaiApp();
});
