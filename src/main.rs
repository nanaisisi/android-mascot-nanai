mod app;

use app::App;
use rust_i18n::i18n;
use sys_locale;

// 翻訳リソースの設定
i18n!("locales");

fn main() {
    // システム言語の検出
    let system_locale = sys_locale::get_locale().unwrap_or_else(|| "en".to_string());

    // 言語コードの抽出（例: "ja-JP" -> "ja"）
    let lang_code = system_locale.split('-').next().unwrap_or("en");

    // 言語の設定
    rust_i18n::set_locale(lang_code);

    // アプリの起動
    launch(App);
}
