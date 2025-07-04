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
            .define("_CRT_SECURE_NO_WARNINGS", None)
            .flag("/EHsc"); // C++例外処理を有効化
    }

    // Linuxでの設定
    #[cfg(target_os = "linux")]
    {
        build.define("POSIX", None);
    }

    let cpp_interface_dir = Path::new("../src/cpp");
    let yaya_dir = Path::new("../src/cpp/yaya-shiori");

    // YAYAディレクトリをインクルードパスに追加
    if yaya_dir.exists() {
        build.include(yaya_dir);
    }
    build.include(cpp_interface_dir);

    // Rust統合インターフェイスファイル
    build.file(cpp_interface_dir.join("yaya_rust_interface.cpp"));

    // YAYAの基本ファイルを段階的に追加
    if yaya_dir.exists() {
        // 基本的なユーティリティファイル
        let basic_files = [
            "globalvariable.cpp",
            "basis.cpp",
            "misc.cpp",
            "crc32.c",
            "md5c.c",
            "value.cpp",
            "valuesub.cpp",
            "variable.cpp",
        ];

        for file in basic_files.iter() {
            let file_path = yaya_dir.join(file);
            if file_path.exists() {
                println!("cargo:rerun-if-changed={}", file_path.display());
                build.file(file_path);
            }
        }
    }

    // ビルド実行
    build.compile("yaya_shiori_stub");

    println!("cargo:rustc-link-lib=static=yaya_shiori_stub");
}
