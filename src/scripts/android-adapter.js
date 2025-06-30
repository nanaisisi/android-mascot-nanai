/**
 * Android Adapter - Android固有機能の処理
 */

class AndroidAdapter {
  constructor() {
    this.isAndroid = false;
    this.isTauri = false;
    this.hasOverlayPermission = false;
    
    // イベントエミッター機能
    this.listeners = {};
    
    this.detectEnvironment();
  }

  detectEnvironment() {
    // Android環境の検出
    this.isAndroid = /Android/i.test(navigator.userAgent);
    
    // Tauri環境の検出
    this.isTauri = globalThis.__TAURI__ !== undefined;
    
    console.log(`📱 Environment detected: Android=${this.isAndroid}, Tauri=${this.isTauri}`);
  }

  async init() {
    console.log('🤖 Android Adapter initializing...');
    
    if (this.isTauri) {
      await this.initTauriFeatures();
    }
    
    this.setupEventListeners();
    await this.checkPermissions();
    
    console.log('✅ Android Adapter initialized');
  }

  async initTauriFeatures() {
    try {
      // Tauriのimport（実際の実装時に有効化）
      // const { invoke } = await import('@tauri-apps/api/tauri');
      // const { listen } = await import('@tauri-apps/api/event');
      // const { appWindow } = await import('@tauri-apps/api/window');
      
      console.log('📦 Tauri features initialized');
    } catch (error) {
      console.warn('⚠️ Tauri features not available:', error);
    }
  }

  setupEventListeners() {
    // Android バックボタン処理
    if (this.isAndroid) {
      document.addEventListener('backbutton', (e) => {
        e.preventDefault();
        this.emit('backPressed');
      }, false);
    }

    // キーボードショートカット（開発・デバッグ用）
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.emit('backPressed');
      }
    });

    // 画面の向き変更
    globalThis.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.emit('orientationChanged', globalThis.orientation);
      }, 100);
    });

    // アプリのフォーカス状態
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.emit('appPaused');
      } else {
        this.emit('appResumed');
      }
    });

    // ネットワーク状態変更
    globalThis.addEventListener('online', () => {
      this.emit('networkChanged', true);
    });

    globalThis.addEventListener('offline', () => {
      this.emit('networkChanged', false);
    });
  }

  async checkPermissions() {
    console.log('🔍 Checking Android permissions...');
    
    try {
      if (this.isTauri && this.isAndroid) {
        // 実際の実装時に有効化
        // this.hasOverlayPermission = await invoke('check_overlay_permission');
        
        // モック実装
        this.hasOverlayPermission = Math.random() > 0.5;
      }
      
      console.log(`🛡️ Overlay permission: ${this.hasOverlayPermission}`);
    } catch (error) {
      console.error('❌ Failed to check permissions:', error);
    }
  }

  async requestOverlayPermission() {
    console.log('📱 Requesting overlay permission...');
    
    try {
      if (this.isTauri && this.isAndroid) {
        // 実際の実装時に有効化
        // const granted = await invoke('request_overlay_permission');
        
        // モック実装
        const granted = await this.mockPermissionRequest();
        
        this.hasOverlayPermission = granted;
        return granted;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to request overlay permission:', error);
      return false;
    }
  }

  async mockPermissionRequest() {
    // 開発用モック：ユーザーに確認ダイアログを表示
    return new Promise((resolve) => {
      setTimeout(() => {
        const granted = confirm(
          'オーバーレイ権限を許可しますか？\n' +
          '（実際のAndroidアプリでは設定画面が表示されます）'
        );
        resolve(granted);
      }, 500);
    });
  }

  async enableSystemOverlay() {
    console.log('🖼️ Enabling system overlay...');
    
    if (!this.hasOverlayPermission) {
      const granted = await this.requestOverlayPermission();
      if (!granted) {
        throw new Error('Overlay permission required');
      }
    }

    try {
      if (this.isTauri && this.isAndroid) {
        // 実際の実装時に有効化
        // await invoke('enable_system_overlay');
        console.log('✅ System overlay enabled (mock)');
      }
    } catch (error) {
      console.error('❌ Failed to enable system overlay:', error);
      throw error;
    }
  }

  async disableSystemOverlay() {
    console.log('🚫 Disabling system overlay...');
    
    try {
      if (this.isTauri && this.isAndroid) {
        // 実際の実装時に有効化
        // await invoke('disable_system_overlay');
        console.log('✅ System overlay disabled (mock)');
      }
    } catch (error) {
      console.error('❌ Failed to disable system overlay:', error);
    }
  }

  async minimizeApp() {
    console.log('📱 Minimizing app...');
    
    try {
      if (this.isTauri) {
        // 実際の実装時に有効化
        // const { appWindow } = await import('@tauri-apps/api/window');
        // await appWindow.minimize();
        console.log('✅ App minimized (mock)');
      } else {
        // Web環境では何もしない
        console.log('⚠️ Cannot minimize in web environment');
      }
    } catch (error) {
      console.error('❌ Failed to minimize app:', error);
    }
  }

  async setAlwaysOnTop(enabled) {
    console.log(`🔝 Setting always on top: ${enabled}`);
    
    try {
      if (this.isTauri) {
        // 実際の実装時に有効化
        // const { appWindow } = await import('@tauri-apps/api/window');
        // await appWindow.setAlwaysOnTop(enabled);
        console.log(`✅ Always on top set to ${enabled} (mock)`);
      }
    } catch (error) {
      console.error('❌ Failed to set always on top:', error);
    }
  }

  async getDeviceInfo() {
    try {
      if (this.isTauri && this.isAndroid) {
        // 実際の実装時に有効化
        // return await invoke('get_device_info');
        
        // モック実装
        return {
          model: 'Mock Android Device',
          version: '13',
          api_level: 33,
          screen_width: globalThis.innerWidth,
          screen_height: globalThis.innerHeight,
          density: globalThis.devicePixelRatio || 1
        };
      }
      
      return {
        model: 'Web Browser',
        version: navigator.userAgent,
        screen_width: globalThis.innerWidth,
        screen_height: globalThis.innerHeight,
        density: globalThis.devicePixelRatio || 1
      };
    } catch (error) {
      console.error('❌ Failed to get device info:', error);
      return null;
    }
  }

  async showAndroidToast(message, duration = 'short') {
    console.log(`🍞 Showing toast: ${message}`);
    
    try {
      if (this.isTauri && this.isAndroid) {
        // 実際の実装時に有効化
        // await invoke('show_toast', { message, duration });
        console.log(`✅ Toast shown: ${message} (mock)`);
      } else {
        // Web環境では簡易通知を表示
        this.showWebNotification(message);
      }
    } catch (error) {
      console.error('❌ Failed to show toast:', error);
    }
  }

  showWebNotification(message) {
    // Web環境用の簡易通知
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  // バイブレーション
  async vibrate(pattern = [100]) {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
        console.log('📳 Vibration triggered');
      } else if (this.isTauri && this.isAndroid) {
        // 実際の実装時に有効化
        // await invoke('vibrate', { pattern });
        console.log('📳 Android vibration triggered (mock)');
      }
    } catch (error) {
      console.error('❌ Failed to vibrate:', error);
    }
  }

  // 画面の明度を保持
  async keepScreenOn(enabled) {
    console.log(`💡 Keep screen on: ${enabled}`);
    
    try {
      if (this.isTauri && this.isAndroid) {
        // 実際の実装時に有効化
        // await invoke('keep_screen_on', { enabled });
        console.log(`✅ Screen on setting: ${enabled} (mock)`);
      } else {
        // Web環境ではWake Lock APIを使用
        if ('wakeLock' in navigator) {
          if (enabled) {
            await navigator.wakeLock.request('screen');
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to control screen wake:', error);
    }
  }

  // イベントエミッター機能
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // 環境情報の取得
  getEnvironmentInfo() {
    return {
      isAndroid: this.isAndroid,
      isTauri: this.isTauri,
      hasOverlayPermission: this.hasOverlayPermission,
      userAgent: navigator.userAgent,
      viewport: {
        width: globalThis.innerWidth,
        height: globalThis.innerHeight
      }
    };
  }
}

export { AndroidAdapter };
