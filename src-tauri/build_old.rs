use std::path::Path;

fn main() {
    // Tauri build
    tauri_build::build();

    // YAYA C++コードのビルド
    build_yaya_shiori();

    // SATORIYA C++コードのビルド
    build_satoriya_shiori();
}

fn build_yaya_shiori() {
    let yaya_dir = Path::new("../src/cpp/yaya-shiori");

    if !yaya_dir.exists() {
        println!(
            "cargo:warning=YAYA shiori source not found at {:?}",
            yaya_dir
        );
        return;
    }

    println!("cargo:rerun-if-changed=../src/cpp/yaya-shiori");

    let mut build = cc::Build::new();

    // C++標準とコンパイラ設定
    build
        .cpp(true)
        .std("c++17")
        .flag_if_supported("-std=c++17")
        .define("UNICODE", None)
        .define("_UNICODE", None);

    // Windowsでの設定
    #[cfg(target_os = "windows")]
    {
        build
            .define("WIN32", None)
            .define("_WINDOWS", None)
            .define("_USRDLL", None)
            .define("AYA_EXPORTS", None)
            .flag("/EHsc"); // C++例外処理を有効化
    }

    // メインのYAYAソースファイルを追加
    let yaya_sources = [
        "aya5.cpp",
        "ayavm.cpp",
        "aya_profile.cpp",
        "basis.cpp",
        "ccct.cpp",
        "comment.cpp",
        "crc32.c",
        "dir_enum.cpp",
        "file.cpp",
        "file1.cpp",
        "function.cpp",
        "globalvariable.cpp",
        "lib.cpp",
        "lib1.cpp",
        "localvariable.cpp",
        "log.cpp",
        "logexcode.cpp",
        "manifest.cpp",
        "md5c.c",
        "messages.cpp",
        "misc.cpp",
        "mt19937ar.cpp",
        "parser0.cpp",
        "parser1.cpp",
        "selecter.cpp",
        "sha1.c",
        "stdafx.cpp",
        "sysfunc.cpp",
        "value.cpp",
        "valuesub.cpp",
        "variable.cpp",
        "wsex.cpp",
    ];

    // Rust統合インターフェイスファイルを追加
    let cpp_interface_dir = Path::new("../src/cpp");
    build.file(cpp_interface_dir.join("yaya_rust_interface.cpp"));
    build.include(cpp_interface_dir);

    // インクルードディレクトリ
    build.include(yaya_dir);

    // ソースファイルを追加
    for source in &yaya_sources {
        let source_path = yaya_dir.join(source);
        if source_path.exists() {
            build.file(source_path);
        } else {
            println!(
                "cargo:warning=YAYA source file not found: {:?}",
                source_path
            );
        }
    }

    // POSIX環境用の設定
    #[cfg(not(target_os = "windows"))]
    {
        build.file(yaya_dir.join("posix_utils.cpp"));
    }

    // ビルド実行
    build.compile("yaya_shiori");

    println!("cargo:rustc-link-lib=static=yaya_shiori");
}

fn build_satoriya_shiori() {
    let satoriya_dir = Path::new("../src/cpp/satoriya-shiori/satoriya");

    if !satoriya_dir.exists() {
        println!(
            "cargo:warning=SATORIYA shiori source not found at {:?}",
            satoriya_dir
        );
        return;
    }

    println!("cargo:rerun-if-changed=../src/cpp/satoriya-shiori");

    // SATORIYA のビルド設定（簡易版）
    // 詳細な実装は後で追加
    println!("cargo:warning=SATORIYA shiori build is not yet implemented");
}
