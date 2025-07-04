/*
 * YAYA SHIORI Rust Integration Interface
 * 
 * C++のYAYAコードをRustから呼び出すためのC言語インターフェイス
 * extern "C"で定義し、name manglingを回避
 */

#ifndef YAYA_RUST_INTERFACE_H
#define YAYA_RUST_INTERFACE_H

#ifdef __cplusplus
extern "C" {
#endif

// 基本型定義
typedef void* HANDLE_TYPE;
typedef long LONG;
typedef char* LPSTR;
typedef const char* LPCSTR;

// YAYA初期化・終了関数
int yaya_initialize();
int yaya_finalize();
int yaya_set_directory(const char* dir_path);
int yaya_set_encoding(int encoding_type);

// SHIORI/3.0標準関数
int yaya_load(HANDLE_TYPE h, LONG length);
int yaya_unload();
char* yaya_request(HANDLE_TYPE h, LONG* length);

// YAYA情報取得関数
const char* yaya_get_version();
const char* yaya_get_name();

// メモリ管理
void yaya_free_string(char* str);

#ifdef __cplusplus
}
#endif

#endif // YAYA_RUST_INTERFACE_H
