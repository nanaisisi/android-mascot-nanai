/**
 * SHIORI検出・管理システム
 * ゴーストディレクトリからYAYA/SATORIYA DLLを検出し、連携を実現
 */

class SHIORIManager {
    constructor() {
        this.detectedShioris = new Map();
        this.activeShiori = null;
        this.supportedTypes = {
            'yaya.dll': 'YAYA',
            'aya5.dll': 'YAYA',
            'satoriya.dll': 'SATORIYA',
            'shiori.dll': 'Generic'
        };
        this.ghostDirectory = null;
    }

    /**
     * ゴーストディレクトリからSHIORIを検出
     * @param {string} ghostPath - ゴーストディレクトリのパス
     * @returns {Promise<Array>} 検出されたSHIORIの情報
     */
    async detectSHIORIs(ghostPath) {
        console.log(`🔍 SHIORI検出開始: ${ghostPath}`);
        this.ghostDirectory = ghostPath;
        
        try {
            const detectedList = [];
            
            // ゴーストディレクトリの構造を解析
            const ghostInfo = await this.parseGhostDirectory(ghostPath);
            console.log('👻 ゴースト情報:', ghostInfo);
            
            // SHIORIファイルを検索
            const shioriFiles = await this.searchSHIORIFiles(ghostPath);
            
            for (const shioriFile of shioriFiles) {
                const shioriInfo = await this.analyzeSHIORIFile(shioriFile);
                if (shioriInfo) {
                    detectedList.push(shioriInfo);
                    this.detectedShioris.set(shioriInfo.id, shioriInfo);
                    console.log(`✅ SHIORI検出: ${shioriInfo.type} - ${shioriInfo.path}`);
                }
            }
            
            // 優先度順にソート（YAYA > SATORIYA > Generic）
            detectedList.sort((a, b) => this.getSHIORIPriority(b.type) - this.getSHIORIPriority(a.type));
            
            console.log(`🎯 ${detectedList.length}個のSHIORIを検出しました`);
            return detectedList;
            
        } catch (error) {
            console.error('❌ SHIORI検出エラー:', error);
            throw error;
        }
    }

    /**
     * ゴーストディレクトリの構造を解析
     */
    async parseGhostDirectory(ghostPath) {
        // 将来的な実装: Tauri FS APIを使用してディレクトリを読み取り
        if (typeof window.__TAURI__ !== 'undefined') {
            // const { readDir } = window.__TAURI__.fs;
            // const entries = await readDir(ghostPath, { recursive: true });
            // return this.parseDirectoryEntries(entries);
        }
        
        // 現在はモック実装
        return {
            name: 'mock_nanai',
            type: 'ghost',
            hasInstallFile: true,
            hasGhostDirectory: true,
            hasShellDirectory: true,
            structure: {
                'install.txt': true,
                'ghost/': true,
                'shell/': true
            }
        };
    }

    /**
     * SHIORIファイルを検索
     */
    async searchSHIORIFiles(ghostPath) {
        const potentialPaths = [
            `${ghostPath}/ghost/master/yaya.dll`,
            `${ghostPath}/ghost/master/aya5.dll`,
            `${ghostPath}/ghost/master/satoriya.dll`,
            `${ghostPath}/ghost/master/shiori.dll`,
            `${ghostPath}/yaya.dll`,
            `${ghostPath}/aya5.dll`,
            `${ghostPath}/satoriya.dll`,
            `${ghostPath}/shiori.dll`
        ];
        
        const foundFiles = [];
        
        for (const path of potentialPaths) {
            // 将来的な実装: Tauri FS APIでファイル存在確認
            if (typeof window.__TAURI__ !== 'undefined') {
                // const { exists } = window.__TAURI__.fs;
                // if (await exists(path)) {
                //     foundFiles.push(path);
                // }
            } else {
                // 現在はモック実装 - YAYAとSATORIYAが存在すると仮定
                if (path.includes('yaya.dll') || path.includes('aya5.dll')) {
                    foundFiles.push(path);
                }
                if (path.includes('satoriya.dll')) {
                    foundFiles.push(path);
                }
            }
        }
        
        return foundFiles;
    }

    /**
     * SHIORIファイルを解析
     */
    async analyzeSHIORIFile(filePath) {
        const fileName = filePath.split('/').pop();
        const shioriType = this.supportedTypes[fileName] || 'Unknown';
        
        if (shioriType === 'Unknown') {
            console.warn(`⚠️ 未対応のSHIORIファイル: ${fileName}`);
            return null;
        }
        
        const shioriInfo = {
            id: `${shioriType}_${Date.now()}`,
            type: shioriType,
            fileName: fileName,
            path: filePath,
            version: await this.detectSHIORIVersion(filePath, shioriType),
            capabilities: this.getSHIORICapabilities(shioriType),
            lastModified: new Date().toISOString(),
            status: 'detected'
        };
        
        return shioriInfo;
    }

    /**
     * SHIORIのバージョンを検出
     */
    async detectSHIORIVersion(filePath, shioriType) {
        // 将来的な実装: DLLファイルからバージョン情報を読み取り
        if (typeof window.__TAURI__ !== 'undefined') {
            // Tauri APIを使用してファイル情報を取得
            // const version = await invoke('get_dll_version', { path: filePath });
            // return version;
        }
        
        // 現在はモック実装
        const mockVersions = {
            'YAYA': '8.0.0',
            'SATORIYA': '1.2.3',
            'Generic': '1.0.0'
        };
        
        return mockVersions[shioriType] || '不明';
    }

    /**
     * SHIORIの機能を取得
     */
    getSHIORICapabilities(shioriType) {
        const capabilities = {
            'YAYA': {
                scripting: true,
                variables: true,
                functions: true,
                arrays: true,
                networking: true,
                fileIO: true,
                regex: true,
                multiCharacter: true,
                debugging: true
            },
            'SATORIYA': {
                scripting: true,
                variables: true,
                functions: true,
                arrays: false,
                networking: false,
                fileIO: true,
                regex: false,
                multiCharacter: true,
                debugging: false
            },
            'Generic': {
                scripting: true,
                variables: true,
                functions: false,
                arrays: false,
                networking: false,
                fileIO: false,
                regex: false,
                multiCharacter: false,
                debugging: false
            }
        };
        
        return capabilities[shioriType] || capabilities['Generic'];
    }

    /**
     * SHIORIの優先度を取得
     */
    getSHIORIPriority(shioriType) {
        const priorities = {
            'YAYA': 100,
            'SATORIYA': 80,
            'Generic': 50
        };
        
        return priorities[shioriType] || 0;
    }

    /**
     * 指定されたSHIORIを読み込み
     */
    async loadSHIORI(shioriId) {
        const shioriInfo = this.detectedShioris.get(shioriId);
        if (!shioriInfo) {
            throw new Error(`SHIORI not found: ${shioriId}`);
        }
        
        console.log(`🔄 SHIORI読み込み開始: ${shioriInfo.type}`);
        
        try {
            // SHIORIの初期化
            const shioriInstance = await this.initializeSHIORI(shioriInfo);
            
            // アクティブなSHIORIとして設定
            this.activeShiori = shioriInstance;
            shioriInfo.status = 'loaded';
            
            console.log(`✅ SHIORI読み込み完了: ${shioriInfo.type}`);
            return shioriInstance;
            
        } catch (error) {
            console.error(`❌ SHIORI読み込みエラー: ${error.message}`);
            shioriInfo.status = 'error';
            throw error;
        }
    }

    /**
     * SHIORIを初期化
     */
    async initializeSHIORI(shioriInfo) {
        const { type, path } = shioriInfo;
        
        if (type === 'YAYA') {
            return await this.initializeYAYA(shioriInfo);
        } else if (type === 'SATORIYA') {
            return await this.initializeSATORIYA(shioriInfo);
        } else {
            return await this.initializeGenericSHIORI(shioriInfo);
        }
    }

    /**
     * YAYA SHIORIを初期化
     */
    async initializeYAYA(shioriInfo) {
        console.log('🔧 YAYA SHIORI初期化中...');
        
        // 将来的な実装: Tauri経由でYAYA DLLを読み込み
        if (typeof window.__TAURI__ !== 'undefined') {
            // const result = await invoke('load_yaya_dll', { 
            //     path: shioriInfo.path,
            //     ghostPath: this.ghostDirectory 
            // });
            // return new YAYASHIORIWrapper(result);
        }
        
        // 現在はモック実装
        return new YAYASHIORIWrapper({
            type: 'YAYA',
            version: shioriInfo.version,
            path: shioriInfo.path,
            loaded: true
        });
    }

    /**
     * SATORIYA SHIORIを初期化
     */
    async initializeSATORIYA(shioriInfo) {
        console.log('🔧 SATORIYA SHIORI初期化中...');
        
        // 将来的な実装: Tauri経由でSATORIYA DLLを読み込み
        if (typeof window.__TAURI__ !== 'undefined') {
            // const result = await invoke('load_satoriya_dll', { 
            //     path: shioriInfo.path,
            //     ghostPath: this.ghostDirectory 
            // });
            // return new SATORIYASHIORIWrapper(result);
        }
        
        // 現在はモック実装
        return new SATORIYASHIORIWrapper({
            type: 'SATORIYA',
            version: shioriInfo.version,
            path: shioriInfo.path,
            loaded: true
        });
    }

    /**
     * 汎用SHIORIを初期化
     */
    async initializeGenericSHIORI(shioriInfo) {
        console.log('🔧 Generic SHIORI初期化中...');
        
        return new GenericSHIORIWrapper({
            type: 'Generic',
            version: shioriInfo.version,
            path: shioriInfo.path,
            loaded: true
        });
    }

    /**
     * SHIORIリクエストを送信
     */
    async sendRequest(request) {
        if (!this.activeShiori) {
            throw new Error('No active SHIORI loaded');
        }
        
        return await this.activeShiori.sendRequest(request);
    }

    /**
     * アクティブなSHIORIを取得
     */
    getActiveSHIORI() {
        return this.activeShiori;
    }

    /**
     * 検出されたSHIORIの一覧を取得
     */
    getDetectedSHIORIs() {
        return Array.from(this.detectedShioris.values());
    }

    /**
     * SHIORIを解放
     */
    async unloadSHIORI() {
        if (this.activeShiori) {
            await this.activeShiori.unload();
            this.activeShiori = null;
            console.log('🔄 SHIORI解放完了');
        }
    }
}

export { SHIORIManager };
