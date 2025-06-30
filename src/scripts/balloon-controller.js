/**
 * Balloon Controller - メッセージ・台詞表示
 */

class BalloonController {
  constructor() {
    this.balloonContainer = null;
    this.activeBalloons = new Map();
    this.ghostPosition = { x: 50, y: 50 }; // パーセンテージ
    this.balloonCounter = 0;
    
    // イベントエミッター機能
    this.listeners = {};
    
    this.init();
  }

  init() {
    console.log('💬 Balloon Controller initializing...');
    
    this.balloonContainer = document.getElementById('balloon-view');
    
    if (!this.balloonContainer) {
      console.error('❌ Balloon container not found');
      return;
    }

    console.log('✅ Balloon Controller initialized');
  }

  updateGhostPosition(position) {
    this.ghostPosition = position;
    
    // アクティブなバルーンの位置を更新
    this.activeBalloons.forEach(balloon => {
      this.positionBalloon(balloon.element, balloon.options);
    });
  }

  showMessage(text, options = {}) {
    console.log('💬 Showing message:', text);
    
    const balloonId = this.generateBalloonId();
    const balloonOptions = {
      type: 'talk',
      duration: 5000,
      choices: [],
      position: 'auto',
      dismissible: true,
      ...options
    };

    const balloonElement = this.createBalloonElement(balloonId, text, balloonOptions);
    this.balloonContainer.appendChild(balloonElement);
    
    // アクティブバルーンとして登録
    this.activeBalloons.set(balloonId, {
      element: balloonElement,
      options: balloonOptions,
      text: text
    });

    // 位置を設定
    this.positionBalloon(balloonElement, balloonOptions);
    
    // アニメーション表示
    setTimeout(() => {
      balloonElement.classList.add('visible');
      balloonElement.classList.add('appearing');
    }, 10);

    // 自動消去設定
    if (balloonOptions.duration > 0) {
      setTimeout(() => {
        this.hideBalloon(balloonId);
      }, balloonOptions.duration);
    }

    return balloonId;
  }

  createBalloonElement(balloonId, text, options) {
    const balloon = document.createElement('div');
    balloon.className = `balloon type-${options.type}`;
    balloon.id = `balloon-${balloonId}`;
    
    // 自動消去タイマー表示
    if (options.duration > 0) {
      balloon.classList.add('auto-dismiss');
      balloon.style.setProperty('--dismiss-time', `${options.duration}ms`);
    }

    // テキスト内容
    const textElement = document.createElement('p');
    textElement.className = 'balloon-text';
    textElement.textContent = text;
    balloon.appendChild(textElement);

    // 選択肢ボタン
    if (options.choices && options.choices.length > 0) {
      const choicesContainer = document.createElement('div');
      choicesContainer.className = 'balloon-choices';
      
      options.choices.forEach((choice, index) => {
        const choiceBtn = document.createElement('button');
        choiceBtn.className = 'balloon-choice';
        choiceBtn.textContent = choice;
        choiceBtn.addEventListener('click', () => {
          this.onChoiceSelected(balloonId, index, choice);
        });
        choicesContainer.appendChild(choiceBtn);
      });
      
      balloon.appendChild(choicesContainer);
    }

    // クリックで消去（dismissibleの場合）
    if (options.dismissible) {
      balloon.addEventListener('click', (e) => {
        // 選択肢ボタンのクリックでは消去しない
        if (!e.target.classList.contains('balloon-choice')) {
          this.hideBalloon(balloonId);
        }
      });
    }

    return balloon;
  }

  positionBalloon(balloonElement, options) {
    const viewportWidth = globalThis.innerWidth;
    const viewportHeight = globalThis.innerHeight;
    
    // ゴーストの絶対位置を計算
    const ghostX = (this.ghostPosition.x / 100) * viewportWidth;
    const ghostY = (this.ghostPosition.y / 100) * viewportHeight;
    
    // バルーンのサイズを取得
    const balloonRect = balloonElement.getBoundingClientRect();
    const balloonWidth = balloonRect.width || 300; // デフォルト幅
    const balloonHeight = balloonRect.height || 100; // デフォルト高
    
    let balloonX, balloonY, tailClass;

    if (options.position === 'auto') {
      // 自動位置決定
      const positions = this.calculateOptimalPosition(ghostX, ghostY, balloonWidth, balloonHeight, viewportWidth, viewportHeight);
      balloonX = positions.x;
      balloonY = positions.y;
      tailClass = positions.tail;
    } else {
      // 手動位置指定
      const pos = this.calculateManualPosition(ghostX, ghostY, balloonWidth, balloonHeight, options.position);
      balloonX = pos.x;
      balloonY = pos.y;
      tailClass = pos.tail;
    }

    // 画面外に出ないよう調整
    balloonX = Math.max(10, Math.min(balloonX, viewportWidth - balloonWidth - 10));
    balloonY = Math.max(10, Math.min(balloonY, viewportHeight - balloonHeight - 10));

    // 位置を適用
    balloonElement.style.left = `${balloonX}px`;
    balloonElement.style.top = `${balloonY}px`;
    
    // 尻尾の方向を設定
    balloonElement.className = balloonElement.className.replace(/tail-\w+/g, '');
    balloonElement.classList.add(tailClass);
  }

  calculateOptimalPosition(ghostX, ghostY, balloonWidth, balloonHeight, viewportWidth, viewportHeight) {
    // ゴーストの周囲の空間を評価して最適な位置を決定
    const positions = [
      // 上
      {
        x: ghostX - balloonWidth / 2,
        y: ghostY - balloonHeight - 20,
        tail: 'tail-bottom',
        space: ghostY - balloonHeight - 20
      },
      // 下
      {
        x: ghostX - balloonWidth / 2,
        y: ghostY + 50,
        tail: 'tail-top',
        space: viewportHeight - (ghostY + 50 + balloonHeight)
      },
      // 左
      {
        x: ghostX - balloonWidth - 20,
        y: ghostY - balloonHeight / 2,
        tail: 'tail-right',
        space: ghostX - balloonWidth - 20
      },
      // 右
      {
        x: ghostX + 50,
        y: ghostY - balloonHeight / 2,
        tail: 'tail-left',
        space: viewportWidth - (ghostX + 50 + balloonWidth)
      }
    ];

    // 最も空間に余裕がある位置を選択
    const validPositions = positions.filter(pos => pos.space > 0);
    
    if (validPositions.length > 0) {
      return validPositions.reduce((best, current) => 
        current.space > best.space ? current : best
      );
    }

    // どの位置も適さない場合は右上に表示
    return {
      x: Math.max(10, ghostX + 50),
      y: Math.max(10, ghostY - balloonHeight),
      tail: 'tail-left'
    };
  }

  calculateManualPosition(ghostX, ghostY, balloonWidth, balloonHeight, position) {
    switch (position) {
      case 'top':
        return {
          x: ghostX - balloonWidth / 2,
          y: ghostY - balloonHeight - 20,
          tail: 'tail-bottom'
        };
      case 'bottom':
        return {
          x: ghostX - balloonWidth / 2,
          y: ghostY + 50,
          tail: 'tail-top'
        };
      case 'left':
        return {
          x: ghostX - balloonWidth - 20,
          y: ghostY - balloonHeight / 2,
          tail: 'tail-right'
        };
      case 'right':
        return {
          x: ghostX + 50,
          y: ghostY - balloonHeight / 2,
          tail: 'tail-left'
        };
      default:
        return this.calculateOptimalPosition(ghostX, ghostY, balloonWidth, balloonHeight, globalThis.innerWidth, globalThis.innerHeight);
    }
  }

  hideBalloon(balloonId) {
    const balloon = this.activeBalloons.get(balloonId);
    if (!balloon) return;

    console.log('🫧 Hiding balloon:', balloonId);

    const balloonElement = balloon.element;
    balloonElement.classList.add('disappearing');
    balloonElement.classList.remove('visible');

    setTimeout(() => {
      if (balloonElement.parentNode) {
        balloonElement.parentNode.removeChild(balloonElement);
      }
      this.activeBalloons.delete(balloonId);
    }, 300);

    this.emit('balloonHidden', { balloonId, balloon });
  }

  hideAllBalloons() {
    console.log('🫧 Hiding all balloons');
    
    this.activeBalloons.forEach((balloon, balloonId) => {
      this.hideBalloon(balloonId);
    });
  }

  onChoiceSelected(balloonId, choiceIndex, choiceText) {
    console.log(`✅ Choice selected: ${choiceText} (${choiceIndex})`);
    
    this.emit('choiceSelected', {
      balloonId,
      choiceIndex,
      choiceText
    });

    // バルーンを非表示
    this.hideBalloon(balloonId);
  }

  generateBalloonId() {
    return `balloon_${Date.now()}_${++this.balloonCounter}`;
  }

  // 便利メソッド
  showTalk(text, duration = 5000) {
    return this.showMessage(text, { type: 'talk', duration });
  }

  showThink(text, duration = 4000) {
    return this.showMessage(text, { type: 'think', duration });
  }

  showShout(text, duration = 3000) {
    return this.showMessage(text, { type: 'shout', duration });
  }

  showWhisper(text, duration = 6000) {
    return this.showMessage(text, { type: 'whisper', duration });
  }

  showChoices(text, choices, options = {}) {
    return this.showMessage(text, {
      ...options,
      choices,
      duration: 0, // 手動で閉じるまで表示
      dismissible: false
    });
  }

  // 一時的な通知メッセージ
  showNotification(text, type = 'talk') {
    return this.showMessage(text, {
      type,
      duration: 2000,
      position: 'top'
    });
  }

  // 長時間表示のヘルプメッセージ
  showHelp(text) {
    return this.showMessage(text, {
      type: 'talk',
      duration: 10000,
      dismissible: true
    });
  }

  // バルーンの状態管理
  getActiveBalloons() {
    return Array.from(this.activeBalloons.values());
  }

  hasActiveBalloons() {
    return this.activeBalloons.size > 0;
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

export { BalloonController };
