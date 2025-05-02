mod app;

use dioxus::prelude::*;

fn main() {
    dioxus_desktop::launch_cfg(
        app::App,
        dioxus_desktop::Config::new().with_window(
            dioxus_desktop::WindowBuilder::default()
                .with_title("Shift-JIS ファイルビューア")
                .with_inner_size(dioxus_desktop::LogicalSize::new(800, 600)),
        ),
    );
}
