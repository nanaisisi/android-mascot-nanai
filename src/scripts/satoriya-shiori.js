/**
 * SATORIYA SHIORI ラッパークラス
 * SATORIYA.dllとの連携を管理
 */

class SATORIYASHIORIWrapper {
    constructor(config) {
        this.type = 'SATORIYA';
        this.version = config.version;
        this.path = config.path;
        this.loaded = config.loaded || false;
        this.variables = new Map();
        this.responses = new Map();
        this.eventHistory = [];
        
        this.initializeSATORIYAResponses();
    }

    /**
     * SATORIYA固有の応答パターンを初期化
     */
    initializeSATORIYAResponses() {
        // SATORIYAスタイルの応答パターン
        this.responses.set('OnBoot', [
            'おかえりなさい。',
            '今日もお疲れ様です。',
            'お帰りをお待ちしていました。'
        ]);
        
        this.responses.set('OnFirstBoot', [
            'はじめまして。私はナナイと申します。',
            'よろしくお願いいたします。'
        ]);
        
        this.responses.set('OnMouseClick', [
            'はい？',
            'どうされましたか？',
            '何かご用でしょうか？',
            'お疲れではありませんか？'
        ]);
        
        this.responses.set('OnRandom', [
            '...',
            '今日はいい天気ですね。',
            '何か飲み物はいかがですか？',
            'お仕事の調子はいかがですか？',
            'たまには休憩も大切ですよ。'
        ]);
        
        // 初期変数設定
        this.variables.set('system.version', this.version);
        this.variables.set('system.ghost.name', 'mock_nanai');
        this.variables.set('system.request.counter', 0);
        this.variables.set('username', 'ユーザー');
    }

    /**
     * SHIORIリクエストを処理
     */
    async sendRequest(request) {
        console.log('📤 SATORIYA Request:', request);
        
        try {
            // リクエストカウンターを増加
            const counter = this.variables.get('system.request.counter') || 0;
            this.variables.set('system.request.counter', counter + 1);
            
            // SHIORIリクエストを解析
            const parsedRequest = this.parseRequest(request);
            
            // イベントに応じてレスポンスを生成
            const response = this.processEvent(parsedRequest);
            
            // イベント履歴に記録
            this.eventHistory.push({
                timestamp: new Date().toISOString(),
                request: parsedRequest,
                response: response
            });
            
            console.log('📥 SATORIYA Response:', response);
            return response;
            
        } catch (error) {
            console.error('❌ SATORIYA Request Error:', error);
            return this.createErrorResponse(error.message);
        }
    }

    /**
     * SHIORIリクエストを解析
     */
    parseRequest(request) {
        const lines = request.trim().split('\n');
        const parsed = {
            method: '',
            version: '',
            event: '',
            references: [],
            headers: {}
        };

        // 最初の行からメソッドとバージョンを取得
        if (lines[0]) {
            const [method, version] = lines[0].split(' ');
            parsed.method = method;
            parsed.version = version;
        }

        // ヘッダーを解析
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes(':')) {
                const [key, value] = line.split(':', 2);
                const trimmedKey = key.trim();
                const trimmedValue = value.trim();
                
                if (trimmedKey === 'ID') {
                    parsed.event = trimmedValue;
                } else if (trimmedKey.startsWith('Reference')) {
                    const refIndex = parseInt(trimmedKey.replace('Reference', '')) || 0;
                    parsed.references[refIndex] = trimmedValue;
                } else {
                    parsed.headers[trimmedKey] = trimmedValue;
                }
            }
        }

        return parsed;
    }

    /**
     * イベントを処理（SATORIYAスタイル）
     */
    processEvent(parsedRequest) {
        const { event } = parsedRequest;
        
        // SATORIYAスタイルの応答選択
        const responses = this.responses.get(event);
        if (responses && responses.length > 0) {
            const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
            
            return this.createResponse(200, {
                'Value': selectedResponse,
                'Surface': this.getSurfaceForEvent(event),
                'Event': event
            });
        }
        
        // デフォルト応答
        return this.createResponse(200, {
            'Value': '...',
            'Surface': '0',
            'Event': event
        });
    }

    /**
     * イベントに応じたサーフェス番号を取得
     */
    getSurfaceForEvent(event) {
        const surfaceMap = {
            'OnBoot': '0',
            'OnFirstBoot': '1',
            'OnMouseClick': '2',
            'OnRandom': '0',
            'OnClose': '3'
        };
        
        return surfaceMap[event] || '0';
    }

    /**
     * レスポンスを作成
     */
    createResponse(statusCode, headers = {}) {
        let response = `SHIORI/3.0 ${statusCode}\r\n`;
        
        for (const [key, value] of Object.entries(headers)) {
            response += `${key}: ${value}\r\n`;
        }
        
        response += '\r\n';
        return response;
    }

    /**
     * エラーレスポンスを作成
     */
    createErrorResponse(errorMessage) {
        return this.createResponse(500, {
            'Error': errorMessage
        });
    }

    /**
     * 応答パターンを追加
     */
    addResponse(event, response) {
        if (!this.responses.has(event)) {
            this.responses.set(event, []);
        }
        this.responses.get(event).push(response);
    }

    /**
     * 応答パターンを削除
     */
    removeResponse(event, response) {
        if (this.responses.has(event)) {
            const responses = this.responses.get(event);
            const index = responses.indexOf(response);
            if (index > -1) {
                responses.splice(index, 1);
            }
        }
    }

    /**
     * 変数を取得
     */
    getVariable(name) {
        return this.variables.get(name) || '';
    }

    /**
     * 変数を設定
     */
    setVariable(name, value) {
        this.variables.set(name, value);
        return value;
    }

    /**
     * すべての応答パターンを取得
     */
    getAllResponses() {
        const result = {};
        for (const [event, responses] of this.responses.entries()) {
            result[event] = [...responses];
        }
        return result;
    }

    /**
     * 特定イベントの応答パターンを取得
     */
    getResponsesForEvent(event) {
        return this.responses.get(event) || [];
    }

    /**
     * 応答統計を取得
     */
    getResponseStats() {
        const stats = {};
        for (const [event, responses] of this.responses.entries()) {
            stats[event] = {
                count: responses.length,
                examples: responses.slice(0, 3) // 最初の3つを例として
            };
        }
        return stats;
    }

    /**
     * デバッグ情報を取得
     */
    getDebugInfo() {
        return {
            type: this.type,
            version: this.version,
            loaded: this.loaded,
            variableCount: this.variables.size,
            responsePatternCount: this.responses.size,
            eventHistoryCount: this.eventHistory.length,
            lastEvent: this.eventHistory[this.eventHistory.length - 1] || null,
            responseStats: this.getResponseStats()
        };
    }

    /**
     * SHIORIを解放
     */
    unload() {
        console.log('🔄 SATORIYA SHIORI解放中...');
        this.variables.clear();
        this.responses.clear();
        this.eventHistory = [];
        this.loaded = false;
        console.log('✅ SATORIYA SHIORI解放完了');
    }
}

export { SATORIYASHIORIWrapper };
