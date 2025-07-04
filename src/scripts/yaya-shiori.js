/**
 * YAYA SHIORI ラッパークラス
 * YAYA.dllとの連携を管理
 */

class YAYASHIORIWrapper {
    constructor(config) {
        this.type = 'YAYA';
        this.version = config.version;
        this.path = config.path;
        this.loaded = config.loaded || false;
        this.variables = new Map();
        this.functions = new Map();
        this.eventHistory = [];
        
        this.initializeYAYAFunctions();
    }

    /**
     * YAYA固有機能を初期化
     */
    initializeYAYAFunctions() {
        // YAYA標準関数の定義
        this.functions.set('GET', this.getVariable.bind(this));
        this.functions.set('SET', this.setVariable.bind(this));
        this.functions.set('EVAL', this.evaluateExpression.bind(this));
        this.functions.set('FUNCTIONEX', this.callFunction.bind(this));
        this.functions.set('ARRAYSIZE', this.getArraySize.bind(this));
        this.functions.set('LOGGING', this.writeLog.bind(this));
        
        // 初期変数設定
        this.variables.set('system.version', this.version);
        this.variables.set('system.ghost.name', 'mock_nanai');
        this.variables.set('system.request.counter', 0);
        this.variables.set('username', 'ユーザー');
        this.variables.set('talking.mode', 'normal');
    }

    /**
     * SHIORIリクエストを処理
     */
    async sendRequest(request) {
        console.log('📤 YAYA Request:', request);
        
        try {
            // リクエストカウンターを増加
            const counter = this.variables.get('system.request.counter') || 0;
            this.variables.set('system.request.counter', counter + 1);
            
            // SHIORIリクエストを解析
            const parsedRequest = this.parseRequest(request);
            
            // イベントに応じてレスポンスを生成
            const response = await this.processEvent(parsedRequest);
            
            // イベント履歴に記録
            this.eventHistory.push({
                timestamp: new Date().toISOString(),
                request: parsedRequest,
                response: response
            });
            
            console.log('📥 YAYA Response:', response);
            return response;
            
        } catch (error) {
            console.error('❌ YAYA Request Error:', error);
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
     * イベントを処理
     */
    async processEvent(parsedRequest) {
        const { event, references } = parsedRequest;
        
        switch (event) {
            case 'OnBoot':
                return this.handleOnBoot(references);
            
            case 'OnFirstBoot':
                return this.handleOnFirstBoot(references);
            
            case 'OnMouseClick':
                return this.handleOnMouseClick(references);
            
            case 'OnRandom':
                return this.handleOnRandom(references);
            
            case 'OnSecondChange':
                return this.handleOnSecondChange(references);
            
            case 'OnMinuteChange':
                return this.handleOnMinuteChange(references);
            
            case 'OnClose':
                return this.handleOnClose(references);
            
            default:
                return this.handleUnknownEvent(event, references);
        }
    }

    /**
     * OnBootイベント処理
     */
    handleOnBoot(_references) {
        const messages = [
            'おかえりなさい！',
            'お疲れ様です！',
            'また会えましたね♪',
            '今日もよろしくお願いします！'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        return this.createResponse(200, {
            'Value': message,
            'Surface': '0',
            'Event': 'OnBoot'
        });
    }

    /**
     * OnFirstBootイベント処理
     */
    handleOnFirstBoot(_references) {
        return this.createResponse(200, {
            'Value': 'はじめまして！私はナナイです。よろしくお願いします♪',
            'Surface': '0',
            'Event': 'OnFirstBoot'
        });
    }

    /**
     * OnMouseClickイベント処理
     */
    handleOnMouseClick(references) {
        const x = references[0] || '0';
        const y = references[1] || '0';
        const part = references[2] || 'body';
        
        console.log(`マウスクリック: (${x}, ${y}) - ${part}`);
        
        const responses = [
            'くすぐったいです〜',
            'なでなでありがとう♪',
            'そこは敏感なところです...',
            'もっと撫でてください！',
            'うふふ、楽しいですね'
        ];
        
        const message = responses[Math.floor(Math.random() * responses.length)];
        
        return this.createResponse(200, {
            'Value': message,
            'Surface': part === 'head' ? '1' : '0',
            'Event': 'OnMouseClick'
        });
    }

    /**
     * OnRandomイベント処理
     */
    handleOnRandom(_references) {
        const randomMessages = [
            '何か面白いことないかな〜',
            'ちょっと退屈になってきました',
            '今日はいい天気ですね！',
            'お疲れではありませんか？',
            '一緒に何かしませんか？',
            'そういえば、最近どうですか？'
        ];
        
        const message = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        
        return this.createResponse(200, {
            'Value': message,
            'Surface': '0',
            'Event': 'OnRandom'
        });
    }

    /**
     * OnSecondChangeイベント処理
     */
    handleOnSecondChange(_references) {
        // 通常は何も返さない（静寂）
        return this.createResponse(204);
    }

    /**
     * OnMinuteChangeイベント処理
     */
    handleOnMinuteChange(references) {
        const minute = parseInt(references[0]) || 0;
        
        // 特定の時間にメッセージ
        if (minute === 0) {
            return this.createResponse(200, {
                'Value': '時報！正時をお知らせします。',
                'Surface': '0',
                'Event': 'OnMinuteChange'
            });
        }
        
        return this.createResponse(204);
    }

    /**
     * OnCloseイベント処理
     */
    handleOnClose(_references) {
        return this.createResponse(200, {
            'Value': 'また後でお会いしましょう！',
            'Surface': '0',
            'Event': 'OnClose'
        });
    }

    /**
     * 未知のイベント処理
     */
    handleUnknownEvent(event, references) {
        console.warn(`⚠️ 未知のイベント: ${event}`, references);
        
        return this.createResponse(200, {
            'Value': `申し訳ありません、${event}イベントはまだ対応していません。`,
            'Surface': '0',
            'Event': event
        });
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
     * 式を評価
     */
    evaluateExpression(expression) {
        try {
            // 簡易的な式評価（セキュリティ上の理由で制限）
            if (/^[\d+\-*/(). ]+$/.test(expression)) {
                return eval(expression).toString();
            } else {
                return 'Invalid expression';
            }
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }

    /**
     * 関数を呼び出し
     */
    callFunction(functionName, ...args) {
        const func = this.functions.get(functionName);
        if (func) {
            return func(...args);
        } else {
            return `Function not found: ${functionName}`;
        }
    }

    /**
     * 配列サイズを取得
     */
    getArraySize(arrayName) {
        const value = this.variables.get(arrayName);
        if (Array.isArray(value)) {
            return value.length.toString();
        } else {
            return '0';
        }
    }

    /**
     * ログを書き込み
     */
    writeLog(message) {
        console.log(`📝 YAYA Log: ${message}`);
        return 'OK';
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
            functionCount: this.functions.size,
            eventHistoryCount: this.eventHistory.length,
            lastEvent: this.eventHistory[this.eventHistory.length - 1] || null
        };
    }

    /**
     * SHIORIを解放
     */
    async unload() {
        console.log('🔄 YAYA SHIORI解放中...');
        this.variables.clear();
        this.functions.clear();
        this.eventHistory = [];
        this.loaded = false;
        console.log('✅ YAYA SHIORI解放完了');
    }
}

export { YAYASHIORIWrapper };
