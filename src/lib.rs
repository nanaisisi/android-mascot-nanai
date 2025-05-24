use encoding_rs::SHIFT_JIS;
use std::fs::File;
use std::io::{self, Read};
use std::path::Path;

/// ShiftJISエンコードのファイルを開き、UTF-8に変換して文字列として返す
pub fn open_shift_jis_file(path: &str) -> Result<String, io::Error> {
    let path = Path::new(path);
    let mut file = File::open(path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;

    // Shift-JISからUTF-8に変換
    let (cow, _encoding_used, had_errors) = SHIFT_JIS.decode(&buffer);
    if had_errors {
        println!("Warning: Some characters couldn't be decoded properly");
    }

    Ok(cow.into_owned())
}

// mascot_nanai_uiとして外部から呼び出せるようにpubで公開
pub use crate::open_shift_jis_file;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_open_shift_jis_file() {
        // このテストはサンプルファイルが存在する場合のみ実行される
        if let Ok(content) = open_shift_jis_file("sample/readme.txt") {
            assert!(!content.is_empty());
            println!("Content: {}", content);
        }
    }
}
