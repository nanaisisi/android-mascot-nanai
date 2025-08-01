/*
 * YAYA SHIORI Rust Integration Implementation
 * 
 * YAYAのC++コードをRustから呼び出すためのC言語インターフェイス実装
 */

#include "yaya_rust_interface.h"

#include <cstring>
#include <cstdlib>

// YAYAの初期化状態管理
static bool g_yaya_initialized = false;
static char g_ghost_directory[512] = {0};

// C言語インターフェイス実装（スタブ版）

extern "C" {

int yaya_initialize() {
    if (g_yaya_initialized) {
        return 1; // 既に初期化済み
    }
    
    // YAYA初期化処理のスタブ
    g_yaya_initialized = true;
    return 1;
}

int yaya_finalize() {
    if (!g_yaya_initialized) {
        return 1;
    }
    
    // YAYA終了処理のスタブ
    g_yaya_initialized = false;
    return 1;
}

int yaya_set_directory(const char* dir_path) {
    if (!dir_path) {
        return 0;
    }
    
    strncpy(g_ghost_directory, dir_path, sizeof(g_ghost_directory) - 1);
    g_ghost_directory[sizeof(g_ghost_directory) - 1] = '\0';
    return 1;
}

int yaya_set_encoding(int encoding_type) {
    // エンコーディング設定のスタブ
    (void)encoding_type; // 未使用パラメータ警告を回避
    return 1;
}

int yaya_load(HANDLE_TYPE h, LONG length) {
    if (!g_yaya_initialized) {
        return 0;
    }
    
    // YAYAロード処理のスタブ
    (void)h; // 未使用パラメータ
    (void)length; // 未使用パラメータ
    return 1;
}

int yaya_unload() {
    if (!g_yaya_initialized) {
        return 0;
    }
    
    // YAYAアンロード処理のスタブ
    return 1;
}

char* yaya_request(HANDLE_TYPE h, LONG* length) {
    if (!g_yaya_initialized || length == nullptr) {
        return nullptr;
    }
    
    // YAYAリクエスト処理のスタブ - テスト用レスポンス
    (void)h; // 未使用パラメータ
    
    const char* test_response = "SHIORI/3.0 200 OK\r\n\r\n\\h\\s[0]Hello from YAYA stub!\\e";
    size_t response_len = strlen(test_response);
    
    char* result = static_cast<char*>(malloc(response_len + 1));
    if (result) {
        strcpy(result, test_response);
        *length = static_cast<LONG>(response_len);
        return result;
    }
    
    return nullptr;
}

void yaya_free_string(char* str) {
    if (str) {
        free(str);
    }
}

} // extern "C"
