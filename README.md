> **AI関与について**: このドキュメントはGitHub
> Copilotの支援により作成されました。キャラクター設定・仕様はオーナーユーザーとAIの協議により決定されています。

# 概要

Android向けの互換環境です。デスクトップ環境での動作確認を行って開発しています。

# 呼び出し実装

呼び出し実装は未完了です。
DLLの代わりに、内部的に呼び出して処理したらいいかなと。

「なし」

# 実装

Androidでdllを代替するために<br> src内にcppディレクトリを配置、<br>
内部に各shiori。<br> 内部的に呼び出して使用<br>

# Tauri + Vanilla

This template should help get you started developing with Tauri in vanilla HTML,
CSS and Javascript.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) +
  [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) +
  [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

# How build

cargo tauri dev

cargo tauri android build -d -t aarch64

# ライセンス

## 本ソフトウェア

デュアルライセンスからライセンスを選択してご使用ください。

Licensed under either of

Apache License, Version 2.0, (LICENSE-APACHE or
https://www.apache.org/licenses/LICENSE-2.0) MIT license (LICENSE-MIT or
https://opensource.org/licenses/MIT) at your option.

## [SATORI-SHIORI](https://github.com/ukatech/satoriya-shiori)

BSD 2-Clause License

Copyright (c) 2001-2005, Kusigahama Yagi. Copyright (c) 2006-, SEIBIHAN. All
rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

## [YAYA-SHIORI](https://github.com/YAYA-shiori/yaya-shiori)

修正BSDライセンス

Copyright (c) 2007-, 整備班 All rights reserved. http://ms.shillest.net/

ソースコード形式かバイナリ形式か、変更するかしないかを問わず、以下の条件を満たす場合に限り、再頒布および使用が許可されます。

・ソースコードを再頒布する場合、上記の著作権表示、本条件一覧、および下記免責条項を含めること。
・バイナリ形式で再頒布する場合、頒布物に付属のドキュメント等の資料に、上記の著作権表示、本条件一覧、および下記免責条項を含めること。
・書面による特別の許可なしに、本ソフトウェアから派生した製品の宣伝または販売促進に、「整備班」の名前または貢献者の名前を使用してはならない。

本ソフトウェアは、著作権者および貢献者によって「現状のまま」提供されており、明示黙示を問わず、商業的な使用可能性、および特定の目的に対する適合性に関する暗黙の保証も含め、またそれに限定されない、いかなる保証もありません。著作権者も貢献者も、事由のいかんを問わず、
損害発生の原因いかんを問わず、かつ責任の根拠が契約であるか厳格責任であるか（過失その他の）不法行為であるかを問わず、仮にそのような損害が発生する可能性を知らされていたとしても、本ソフトウェアの使用によって発生した（代替品または代用サービスの調達、使用の喪失、データの喪失、利益の喪失、業務の中断も含め、またそれに限定されない）直接損害、間接損害、偶発的な損害、特別損害、懲罰的損害、または結果損害について、一切責任を負わないものとします。
