/**
 * Settings Controller - 設定管理
 */

class SettingsController {
  constructor() {
    this.settings = {
      ghostId: 'mock_nanai',
      opacity: 1.0,
      alwaysOnTop: true,
      overlayPermission: false
    };
    
    // イベントエミッター機能
    this.listeners = {};
    
    this.init();
  }

  init() {
    console.log('⚙️ Settings Controller initializing...');
    
    this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
    
    console.log('✅ Settings Controller initialized');
  }

  setupEventListeners() {
    // ゴースト選択
    const ghostSelect = document.getElementById('ghost-select');
    if (ghostSelect) {
      ghostSelect.addEventListener('change', (e) => {
        this.updateSetting('ghostId', e.target.value);
        this.emit('ghostChanged', e.target.value);
      });
    }

    // 透明度スライダー
    const opacitySlider = document.getElementById('opacity-slider');
    if (opacitySlider) {
      opacitySlider.addEventListener('input', (e) => {
        const opacity = parseFloat(e.target.value);
        this.updateSetting('opacity', opacity);
        this.emit('opacityChanged', opacity);
      });
    }

    // 常に最前面チェックボックス
    const alwaysOnTopCheckbox = document.getElementById('always-on-top');
    if (alwaysOnTopCheckbox) {
      alwaysOnTopCheckbox.addEventListener('change', (e) => {
        this.updateSetting('alwaysOnTop', e.target.checked);
        this.emit('alwaysOnTopChanged', e.target.checked);
      });
    }

    // オーバーレイ権限ボタン
    const overlayPermissionBtn = document.getElementById('overlay-permission-btn');
    if (overlayPermissionBtn) {
      overlayPermissionBtn.addEventListener('click', () => {
        this.requestOverlayPermission();
      });
    }
  }

  updateUI() {
    // ゴースト選択の更新
    const ghostSelect = document.getElementById('ghost-select');
    if (ghostSelect) {
      ghostSelect.value = this.settings.ghostId;
    }

    // 透明度スライダーの更新
    const opacitySlider = document.getElementById('opacity-slider');
    if (opacitySlider) {
      opacitySlider.value = this.settings.opacity;
    }

    // 常に最前面チェックボックスの更新
    const alwaysOnTopCheckbox = document.getElementById('always-on-top');
    if (alwaysOnTopCheckbox) {
      alwaysOnTopCheckbox.checked = this.settings.alwaysOnTop;
    }

    // オーバーレイ権限ボタンの更新
    this.updateOverlayPermissionUI();
  }

  updateOverlayPermissionUI() {
    const overlayPermissionBtn = document.getElementById('overlay-permission-btn');
    if (!overlayPermissionBtn) return;

    if (this.settings.overlayPermission) {
      overlayPermissionBtn.textContent = '✓ オーバーレイ権限が有効';
      overlayPermissionBtn.classList.add('granted');
      overlayPermissionBtn.disabled = true;
    } else {
      overlayPermissionBtn.textContent = 'オーバーレイ権限を設定';
      overlayPermissionBtn.classList.remove('granted');
      overlayPermissionBtn.disabled = false;
    }
  }

  async requestOverlayPermission() {
    console.log('📱 Requesting overlay permission...');
    
    try {
      // Tauri Android API呼び出し（実装時に追加）
      // const granted = await invoke('request_overlay_permission');
      
      // 現在はモック実装
      const granted = await this.mockRequestPermission();
      
      this.updateSetting('overlayPermission', granted);
      this.updateOverlayPermissionUI();
      
      if (granted) {
        this.showPermissionGrantedMessage();
      } else {
        this.showPermissionDeniedMessage();
      }
      
    } catch (error) {
      console.error('❌ Failed to request overlay permission:', error);
      this.showPermissionErrorMessage();
    }
  }

  async mockRequestPermission() {
    // 開発用モック：3秒後にランダムで許可/拒否
    return new Promise((resolve) => {
      setTimeout(() => {
        const granted = Math.random() > 0.3; // 70%の確率で許可
        console.log(`Mock permission result: ${granted ? 'granted' : 'denied'}`);
        resolve(granted);
      }, 1000);
    });
  }

  showPermissionGrantedMessage() {
    // バルーンメッセージで通知
    this.emit('showMessage', {
      text: 'オーバーレイ権限が有効になりました！',
      type: 'talk',
      duration: 3000
    });
  }

  showPermissionDeniedMessage() {
    this.emit('showMessage', {
      text: 'オーバーレイ権限が拒否されました。設定から手動で有効にしてください。',
      type: 'talk',
      duration: 5000
    });
  }

  showPermissionErrorMessage() {
    this.emit('showMessage', {
      text: '権限の設定中にエラーが発生しました。',
      type: 'talk',
      duration: 3000
    });
  }

  updateSetting(key, value) {
    console.log(`⚙️ Updating setting: ${key} = ${value}`);
    
    this.settings[key] = value;
    this.saveSettings();
  }

  saveSettings() {
    try {
      localStorage.setItem('mascot-settings', JSON.stringify(this.settings));
      console.log('💾 Settings saved');
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('mascot-settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsedSettings };
        console.log('📖 Settings loaded');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load settings:', error);
    }
  }

  getSettings() {
    return { ...this.settings };
  }

  updateSettings(newSettings) {
    console.log('🔄 Updating multiple settings');
    
    Object.keys(newSettings).forEach(key => {
      if (key in this.settings) {
        this.settings[key] = newSettings[key];
      }
    });
    
    this.saveSettings();
    this.updateUI();
    
    // 変更をすべて通知
    Object.keys(newSettings).forEach(key => {
      this.emitSettingChange(key, newSettings[key]);
    });
  }

  emitSettingChange(key, value) {
    switch (key) {
      case 'ghostId':
        this.emit('ghostChanged', value);
        break;
      case 'opacity':
        this.emit('opacityChanged', value);
        break;
      case 'alwaysOnTop':
        this.emit('alwaysOnTopChanged', value);
        break;
    }
  }

  resetSettings() {
    console.log('🔄 Resetting settings to defaults');
    
    const defaultSettings = {
      ghostId: 'mock_nanai',
      opacity: 1.0,
      alwaysOnTop: true,
      overlayPermission: false
    };
    
    this.updateSettings(defaultSettings);
  }

  exportSettings() {
    const data = JSON.stringify(this.settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mascot-nanai-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('📤 Settings exported');
  }

  async importSettings(file) {
    try {
      const text = await file.text();
      const importedSettings = JSON.parse(text);
      
      // バリデーション
      if (this.validateSettings(importedSettings)) {
        this.updateSettings(importedSettings);
        console.log('📥 Settings imported successfully');
        return true;
      } else {
        console.error('❌ Invalid settings file');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to import settings:', error);
      return false;
    }
  }

  validateSettings(settings) {
    const requiredKeys = ['ghostId', 'opacity', 'alwaysOnTop'];
    
    return requiredKeys.every(key => key in settings) &&
           typeof settings.opacity === 'number' &&
           settings.opacity >= 0.1 && settings.opacity <= 1.0 &&
           typeof settings.alwaysOnTop === 'boolean' &&
           typeof settings.ghostId === 'string';
  }

  // Android固有の設定
  async checkSystemSettings() {
    // システム設定の確認（Android固有）
    try {
      // const canDrawOverlays = await invoke('can_draw_overlays');
      // this.updateSetting('overlayPermission', canDrawOverlays);
      
      // モック実装
      console.log('📱 Checking system settings...');
    } catch (error) {
      console.error('❌ Failed to check system settings:', error);
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
}

export { SettingsController };
