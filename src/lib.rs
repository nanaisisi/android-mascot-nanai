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

/// さくらスクリプトの簡易パーサと実行（内部コマンド）
pub fn execute_sakura_script(script: &str, mut callback: impl FnMut(SakuraCommand)) {
    // 例: "\0\s[0]こんにちは\e" → [SakuraCommand::Surface(0), SakuraCommand::Text("こんにちは"), SakuraCommand::End]
    let mut chars = script.chars().peekable();
    let mut buffer = String::new();
    while let Some(c) = chars.next() {
        if c == '\\' {
            // コマンド開始
            if !buffer.is_empty() {
                callback(SakuraCommand::Text(buffer.clone()));
                buffer.clear();
            }
            match chars.next() {
                Some('0') => callback(SakuraCommand::Target(0)),
                Some('1') => callback(SakuraCommand::Target(1)),
                Some('s') => {
                    if chars.next() == Some('[') {
                        let mut num = String::new();
                        while let Some(&nc) = chars.peek() {
                            if nc == ']' { chars.next(); break; }
                            num.push(nc); chars.next();
                        }
                        if let Ok(n) = num.parse() {
                            callback(SakuraCommand::Surface(n));
                        }
                    }
                },
                Some('e') => callback(SakuraCommand::End),
                Some(_) | None => {},
            }
        } else {
            buffer.push(c);
        }
    }
    if !buffer.is_empty() {
        callback(SakuraCommand::Text(buffer));
    }
}

/// さくらスクリプトの内部コマンド列挙
#[derive(Debug, Clone)]
pub enum SakuraCommand {
    Target(u8),      // \0, \1 など
    Surface(u32),    // \s[0] など
    Text(String),    // 通常テキスト
    End,             // \e
}

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
