use std::path::Path;

fn main() {
    // Tauri build
    tauri_build::build();

    // YAYA C++統合スタブのビルド
    build_yaya_shiori_stub();
}

fn build_yaya_shiori_stub() {
    println!("cargo:rerun-if-changed=../src/cpp");

    let mut build = cc::Build::new();

    // C++標準とコンパイラ設定
    build.cpp(true).std("c++17").flag_if_supported("-std=c++17");

    // Windowsでの設定
    #[cfg(target_os = "windows")]
    {
        build
            .define("WIN32", None)
            .define("_WINDOWS", None)
            .flag("/EHsc"); // C++例外処理を有効化
    }

    // Rust統合インターフェイスファイルのみをビルド（スタブ版）
    let cpp_interface_dir = Path::new("../src/cpp");
    build.file(cpp_interface_dir.join("yaya_rust_interface.cpp"));
    build.include(cpp_interface_dir);

    // YAYAディレクトリをインクルードパスに追加（ヘッダー参照用）
    let yaya_dir = Path::new("../src/cpp/yaya-shiori");
    if yaya_dir.exists() {
        build.include(yaya_dir);
    }

    // ビルド実行
    build.compile("yaya_shiori_stub");

    println!("cargo:rustc-link-lib=static=yaya_shiori_stub");
}
