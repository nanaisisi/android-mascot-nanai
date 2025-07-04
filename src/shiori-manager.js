/**
 * SHIORI Manager JavaScript Interface
 * 
 * RustのSHIORIマネージャーとの連携を行うJavaScriptヘルパー
 */

// Tauriのinvokeを使用してRust関数を呼び出し
const { invoke } = globalThis.__TAURI__.core;

/**
 * SHIORIマネージャークラス
 */
class ShioriManager {
    constructor() {
        this.isInitialized = false;
        this.currentGhost = null;
        this.ghosts = [];
    }

    /**
     * ゴーストディレクトリをスキャン
     * @param {string} ghostDir - スキャンするディレクトリパス
     * @returns {Promise<Array>} 検出されたゴースト情報の配列
     */
    async scanGhostDirectory(ghostDir) {
        try {
            this.ghosts = await invoke('scan_ghost_directory', { ghostDir });
            console.log(`🔍 検出されたゴースト: ${this.ghosts.length}個`);
            return this.ghosts;
        } catch (error) {
            console.error('❌ ゴーストディレクトリスキャンエラー:', error);
            throw error;
        }
    }

    /**
     * ゴーストを読み込み
     * @param {string} ghostName - 読み込むゴースト名
     * @returns {Promise<string>} 成功メッセージ
     */
    async loadGhost(ghostName) {
        try {
            const result = await invoke('load_ghost', { ghostName });
            this.currentGhost = ghostName;
            this.isInitialized = true;
            console.log(`👻 ゴースト読み込み成功: ${ghostName}`);
            return result;
        } catch (error) {
            console.error('❌ ゴースト読み込みエラー:', error);
            throw error;
        }
    }

    /**
     * SHIORIリクエストを送信
     * @param {string} request - SHIORI/3.0形式のリクエスト文字列
     * @returns {Promise<string>} SHIORIからのレスポンス
     */
    async sendRequest(request) {
        try {
            const response = await invoke('send_shiori_request', { request });
            console.log('📤 SHIORI Request:', request);
            console.log('📥 SHIORI Response:', response);
            return response;
        } catch (error) {
            console.error('❌ SHIORIリクエストエラー:', error);
            throw error;
        }
    }

    /**
     * SHIORIイベントを送信
     * @param {string} event - イベント名
     * @param {Array<string>} references - リファレンス配列
     * @returns {Promise<string>} SHIORIからのレスポンス
     */
    async sendEvent(event, references = []) {
        try {
            const response = await invoke('send_shiori_event', { event, references });
            console.log(`📢 イベント送信: ${event}`, references);
            console.log('📥 SHIORI Response:', response);
            return response;
        } catch (error) {
            console.error('❌ SHIORIイベントエラー:', error);
            throw error;
        }
    }

    /**
     * マウスクリックイベントを送信
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} button - ボタン名 ('left', 'right', 'middle')
     * @returns {Promise<string>} SHIORIからのレスポンス
     */
    async onMouseClick(x, y, button = 'left') {
        try {
            const response = await invoke('on_mouse_click', { x, y, button });
            console.log(`🖱️ マウスクリック: (${x}, ${y}) ${button}`);
            return response;
        } catch (error) {
            console.error('❌ マウスクリックイベントエラー:', error);
            throw error;
        }
    }

    /**
     * 秒数変化イベントを送信
     * @returns {Promise<string>} SHIORIからのレスポンス
     */
    async onSecondChange() {
        try {
            const response = await invoke('on_second_change');
            return response;
        } catch (error) {
            console.error('❌ 秒数変化イベントエラー:', error);
            throw error;
        }
    }

    /**
     * 現在のゴースト情報を取得
     * @returns {Promise<Object|null>} 現在のゴースト情報
     */
    async getCurrentGhost() {
        try {
            const ghost = await invoke('get_current_ghost');
            this.currentGhost = ghost?.name || null;
            return ghost;
        } catch (error) {
            console.error('❌ 現在のゴースト取得エラー:', error);
            throw error;
        }
    }

    /**
     * すべてのゴースト情報を取得
     * @returns {Promise<Array>} すべてのゴースト情報の配列
     */
    async getAllGhosts() {
        try {
            this.ghosts = await invoke('get_all_ghosts');
            return this.ghosts;
        } catch (error) {
            console.error('❌ ゴースト一覧取得エラー:', error);
            throw error;
        }
    }

    /**
     * SHIORIの状態を取得
     * @returns {Promise<boolean>} SHIORIが読み込まれているかどうか
     */
    async getShioriStatus() {
        try {
            const isLoaded = await invoke('get_shiori_status');
            this.isInitialized = isLoaded;
            return isLoaded;
        } catch (error) {
            console.error('❌ SHIORI状態取得エラー:', error);
            throw error;
        }
    }

    /**
     * 現在のゴーストを終了
     * @returns {Promise<string>} 成功メッセージ
     */
    async unloadCurrentGhost() {
        try {
            const result = await invoke('unload_current_ghost');
            this.currentGhost = null;
            this.isInitialized = false;
            console.log('👻 ゴースト終了完了');
            return result;
        } catch (error) {
            console.error('❌ ゴースト終了エラー:', error);
            throw error;
        }
    }

    // ===========================================
    // 便利メソッド
    // ===========================================

    /**
     * 簡単なトーク送信
     * @param {string} message - 送信するメッセージ
     * @returns {Promise<string>} レスポンス
     */
    sendTalk(message = '') {
        return this.sendEvent('OnTalk', [message]);
    }

    /**
     * ゴーストの起動イベント
     * @returns {Promise<string>} レスポンス
     */
    bootGhost() {
        return this.sendEvent('OnBoot');
    }

    /**
     * ゴーストの終了イベント
     * @returns {Promise<string>} レスポンス
     */
    closeGhost() {
        return this.sendEvent('OnClose');
    }

    /**
     * 現在の状態を取得
     * @returns {Object} 現在の状態情報
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            currentGhost: this.currentGhost,
            ghostCount: this.ghosts.length,
            ghosts: this.ghosts
        };
    }

    /**
     * SHIORIの種類による分類
     * @returns {Object} 種類別のゴースト数
     */
    getGhostsByType() {
        const typeCount = {
            YAYA: 0,
            SATORIYA: 0,
            Unknown: 0
        };

        this.ghosts.forEach(ghost => {
            if (ghost.shiori_type === 'YAYA') {
                typeCount.YAYA++;
            } else if (ghost.shiori_type === 'SATORIYA') {
                typeCount.SATORIYA++;
            } else {
                typeCount.Unknown++;
            }
        });

        return typeCount;
    }

    /**
     * ゴースト検索
     * @param {string} query - 検索クエリ
     * @returns {Array} マッチするゴースト
     */
    searchGhosts(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.ghosts.filter(ghost =>
            ghost.name.toLowerCase().includes(lowercaseQuery) ||
            (ghost.description && ghost.description.toLowerCase().includes(lowercaseQuery)) ||
            (ghost.craftman && ghost.craftman.toLowerCase().includes(lowercaseQuery))
        );
    }

    /**
     * 定期的な秒数変化イベントを開始
     * @param {number} interval - 間隔（ミリ秒）
     */
    startSecondChangeTimer(interval = 1000) {
        if (this.secondChangeTimer) {
            clearInterval(this.secondChangeTimer);
        }

        this.secondChangeTimer = setInterval(async () => {
            if (this.isInitialized) {
                try {
                    await this.onSecondChange();
                } catch (error) {
                    console.warn('⚠️ 秒数変化イベント送信に失敗:', error);
                }
            }
        }, interval);

        console.log(`⏰ 秒数変化タイマー開始 (${interval}ms間隔)`);
    }

    /**
     * 秒数変化タイマーを停止
     */
    stopSecondChangeTimer() {
        if (this.secondChangeTimer) {
            clearInterval(this.secondChangeTimer);
            this.secondChangeTimer = null;
            console.log('⏰ 秒数変化タイマー停止');
        }
    }
}

// グローバルにShioriManagerインスタンスを作成
window.shioriManager = new ShioriManager();

// デバッグ用の便利関数をグローバルに追加
window.debugShiori = {
    /**
     * デバッグ用ゴーストスキャン
     */
    async scanDefault() {
        try {
            // デフォルトのゴーストディレクトリをスキャン
            const result = await window.shioriManager.scanGhostDirectory('./assets/ghost');
            console.log('デバッグスキャン結果:', result);
            return result;
        } catch (error) {
            console.error('デバッグスキャンエラー:', error);
        }
    },

    /**
     * テスト用のイベント送信
     */
    async testEvents() {
        const manager = window.shioriManager;
        
        if (!manager.isInitialized) {
            console.warn('⚠️ SHIORIが初期化されていません');
            return;
        }

        try {
            console.log('🧪 テストイベント開始');
            
            // 基本的なイベントをテスト
            await manager.sendEvent('OnTalk', ['テストメッセージ']);
            await manager.onMouseClick(100, 150, 'left');
            await manager.sendEvent('OnAITalk');
            
            console.log('✅ テストイベント完了');
        } catch (error) {
            console.error('❌ テストイベントエラー:', error);
        }
    },

    /**
     * 状態表示
     */
    showStatus() {
        const status = window.shioriManager.getStatus();
        console.table(status);
        
        const typeCount = window.shioriManager.getGhostsByType();
        console.log('ゴースト種類別統計:', typeCount);
    }
};

console.log('🎭 SHIORI Manager JavaScript Interface 読み込み完了');
console.log('使用方法:');
console.log('  window.shioriManager - SHIORIマネージャー');
console.log('  window.debugShiori - デバッグ用ヘルパー');

export { ShioriManager };
