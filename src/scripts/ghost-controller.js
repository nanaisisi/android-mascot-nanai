/**
 * Ghost Controller - ゴースト表示・制御
 */

class GhostController {
  constructor() {
    this.ghostElement = null;
    this.ghostImage = null;
    this.position = { x: 50, y: 50 }; // パーセンテージ
    this.isDragging = false;
    this.isVisible = true;
    this.currentGhost = 'mock_nanai';
    this.opacity = 1;
    this.animationState = 'idle';
    
    // イベントエミッター機能
    this.listeners = {};
    
    this.init();
  }

  init() {
    console.log('👻 Ghost Controller initializing...');
    
    this.ghostElement = document.getElementById('ghost-character');
    this.ghostImage = document.getElementById('ghost-image');
    
    if (!this.ghostElement || !this.ghostImage) {
      console.error('❌ Ghost elements not found');
      return;
    }

    this.setupEventListeners();
    this.loadSavedPosition();
    this.startIdleAnimation();
    
    console.log('✅ Ghost Controller initialized');
  }

  setupEventListeners() {
    // タッチ・マウスイベント
    this.setupDragEvents();
    
    // ゴーストクリック
    this.ghostElement.addEventListener('click', (e) => {
      if (!this.isDragging) {
        this.onGhostClick(e);
      }
    });

    // 画面リサイズ対応
    globalThis.addEventListener('resize', () => {
      this.adjustPosition();
    });
  }

  setupDragEvents() {
    let startPos = { x: 0, y: 0 };
    let initialPos = { x: 0, y: 0 };

    // マウスイベント
    this.ghostElement.addEventListener('mousedown', (e) => {
      this.startDrag(e, { x: e.clientX, y: e.clientY });
    });

    // タッチイベント
    this.ghostElement.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.startDrag(e, { x: touch.clientX, y: touch.clientY });
    });

    // 移動イベント
    const handleMove = (clientPos) => {
      if (!this.isDragging) return;

      const deltaX = clientPos.x - startPos.x;
      const deltaY = clientPos.y - startPos.y;

      const newX = initialPos.x + deltaX;
      const newY = initialPos.y + deltaY;

      // 画面外に出ないよう制限
      const rect = this.ghostElement.getBoundingClientRect();
      const maxX = globalThis.innerWidth - rect.width;
      const maxY = globalThis.innerHeight - rect.height;

      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));

      this.setAbsolutePosition(clampedX, clampedY);
    };

    document.addEventListener('mousemove', (e) => {
      handleMove({ x: e.clientX, y: e.clientY });
    });

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMove({ x: touch.clientX, y: touch.clientY });
      }
    });

    // 終了イベント
    const handleEnd = () => {
      if (this.isDragging) {
        this.endDrag();
      }
    };

    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    // ドラッグ開始関数
    const startDrag = (startPosition) => {
      startPos = startPosition;
      const rect = this.ghostElement.getBoundingClientRect();
      initialPos = { x: rect.left, y: rect.top };
    };

    this.startDrag = (e, clientPos) => {
      console.log('🤏 Starting drag');
      this.isDragging = true;
      this.ghostElement.classList.add('dragging');
      this.stopAnimations();
      startDrag(clientPos);
    };
  }

  endDrag() {
    console.log('✋ Ending drag');
    this.isDragging = false;
    this.ghostElement.classList.remove('dragging');
    
    // 位置をパーセンテージに変換して保存
    this.saveCurrentPosition();
    
    // アニメーション再開
    this.startIdleAnimation();
    
    // イベント発火
    this.emit('positionChanged', this.position);
  }

  setAbsolutePosition(x, y) {
    this.ghostElement.style.left = `${x}px`;
    this.ghostElement.style.top = `${y}px`;
    this.ghostElement.style.transform = 'none';
  }

  saveCurrentPosition() {
    const rect = this.ghostElement.getBoundingClientRect();
    this.position = {
      x: (rect.left / globalThis.innerWidth) * 100,
      y: (rect.top / globalThis.innerHeight) * 100
    };
    
    // ローカルストレージに保存
    localStorage.setItem('ghost-position', JSON.stringify(this.position));
  }

  loadSavedPosition() {
    try {
      const saved = localStorage.getItem('ghost-position');
      if (saved) {
        this.position = JSON.parse(saved);
        this.applyPosition();
      }
    } catch (error) {
      console.warn('⚠️ Failed to load saved position:', error);
    }
  }

  applyPosition() {
    const x = (this.position.x / 100) * globalThis.innerWidth;
    const y = (this.position.y / 100) * globalThis.innerHeight;
    
    // 画面外チェック
    const rect = this.ghostElement.getBoundingClientRect();
    const maxX = globalThis.innerWidth - rect.width;
    const maxY = globalThis.innerHeight - rect.height;
    
    const clampedX = Math.max(0, Math.min(x, maxX));
    const clampedY = Math.max(0, Math.min(y, maxY));
    
    this.setAbsolutePosition(clampedX, clampedY);
  }

  adjustPosition() {
    // 画面サイズ変更時の位置調整
    this.applyPosition();
  }

  onGhostClick(e) {
    console.log('👆 Ghost clicked');
    this.playClickAnimation();
    this.emit('talk', this.getRandomMessage());
  }

  getRandomMessages() {
    return [
      'こんにちは〜♪',
      'なにか用？',
      'お疲れさま！',
      'いい天気ですね〜',
      'お茶でも飲みませんか？',
      'がんばって〜！',
      '今日はどうでしたか？',
      'なにか面白いことありました？'
    ];
  }

  getRandomMessage() {
    const messages = this.getRandomMessages();
    return messages[Math.floor(Math.random() * messages.length)];
  }

  randomTalk() {
    this.emit('talk', this.getRandomMessage());
  }

  // アニメーション制御
  startIdleAnimation() {
    this.stopAnimations();
    this.animationState = 'idle';
    this.ghostElement.classList.add('idle');
  }

  playClickAnimation() {
    this.stopAnimations();
    this.animationState = 'talking';
    this.ghostElement.classList.add('talking');
    
    setTimeout(() => {
      this.startIdleAnimation();
    }, 600);
  }

  playAppearAnimation() {
    this.stopAnimations();
    this.animationState = 'appearing';
    this.ghostElement.classList.add('appearing');
    
    setTimeout(() => {
      this.startIdleAnimation();
    }, 800);
  }

  stopAnimations() {
    this.ghostElement.classList.remove('idle', 'talking', 'appearing', 'disappearing');
  }

  // 表示制御
  setOpacity(opacity) {
    this.opacity = opacity;
    this.ghostElement.style.setProperty('--ghost-opacity', opacity);
    this.ghostElement.classList.toggle('transparent', opacity < 1);
  }

  show() {
    this.isVisible = true;
    this.ghostElement.style.display = 'block';
    this.playAppearAnimation();
  }

  hide() {
    this.isVisible = false;
    this.ghostElement.classList.add('disappearing');
    
    setTimeout(() => {
      this.ghostElement.style.display = 'none';
      this.stopAnimations();
    }, 500);
  }

  pause() {
    this.stopAnimations();
  }

  resume() {
    if (this.isVisible) {
      this.startIdleAnimation();
    }
  }

  // ゴースト変更
  async changeGhost(ghostId) {
    console.log(`🔄 Changing ghost to: ${ghostId}`);
    
    this.currentGhost = ghostId;
    
    // 新しい画像を読み込み
    const newImageSrc = `assets/ghost/${ghostId}/ghost/surface0.png`;
    
    try {
      await this.loadImage(newImageSrc);
      this.ghostImage.src = newImageSrc;
      this.playAppearAnimation();
      
      console.log('✅ Ghost changed successfully');
    } catch (error) {
      console.error('❌ Failed to change ghost:', error);
    }
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
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

export { GhostController };
