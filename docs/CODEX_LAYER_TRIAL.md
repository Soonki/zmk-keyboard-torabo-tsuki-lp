# Codex Layer 試用ガイド

## 結論

現在のファームウェアはDYA Studioのruntime keymap編集に対応しているため、単純なレイヤーキーとキー割り当てはUF2を書き込まずに試せます。

- 接続先: <https://studio.dya.cormoran.works/>
- 接続方法: central側をUSB接続し、ChromeまたはEdgeからWeb Serialで接続
- 対象レイヤー: Layer 1
- 起動キー: S配列の左手最内側Spaceを「Momentary Layer 1」へ変更

変更前に、DYA Studioまたはローカルのkeymap backupアプリで現在のruntime keymapをバックアップしてください。

## 試用配置

| 物理キー | Codex操作 | Windowsショートカット |
|---|---|---|
| `Y` | レビューを開く | `Ctrl+Shift+G` |
| `U` | ターミナルを開く | `Ctrl+Grave` |
| `I` | ブラウザを開く | `Ctrl+T` |
| `O` | ファイルツリー | `Ctrl+Shift+E` |
| `P` | コマンドメニュー | `Ctrl+K` |
| `H` | 戻る | `Ctrl+[` |
| `J` | 前のチャット | `Ctrl+Shift+[` |
| `K` | 次のチャット | `Ctrl+Shift+]` |
| `L` | 停止／拒否 | `Esc` |
| `;` | 承認 | `Enter` |
| 右側 `Enter` | チャット内検索 | `Ctrl+F` |
| `N` | 新規チャット | `Ctrl+N` |
| `M` | モデル選択 | `Ctrl+Shift+M` |
| `,` | 前の最近使ったチャット | `Ctrl+Shift+Tab` |
| `.` | 次の最近使ったチャット | `Ctrl+Tab` |
| `/` | ショートカット一覧 | `Ctrl+/` |
| 右親指 `Enter/L3` | 送信 | `Enter` |
| 右親指 `Bspc` | 音声入力開始 | `Ctrl+Shift+D` |

## ファームウェアなしで試す場合の制限

DYA Studioで変更できるのはruntime keymapです。コンボ定義、コンボを有効にするレイヤー、新しいマクロの定義は変更できません。

そのため、現在書き込まれているファームウェアのマウスコンボはLayer 1でも有効なままです。試用中は `H+J`、`J+K`、`K+L`、`,+.` を同時押ししないでください。旧ファームウェアでは `L+;` のSticky Scrollコンボが残っている場合もあります。

リポジトリ側の `config/keymap.keymap` では、恒久版としてマウスコンボからLayer 1を除外し、スクロールを `;` の140msホールド中だけ有効にしています。この分離を有効にするには、次回生成したファームウェアの書き込みが必要です。

ZMK Studioで一度runtime keymapを保存すると、あとからファームウェアを書き込んだだけではソース側の新しいキー配置へ切り替わらない場合があります。恒久版を書き込んだ後は、ZMK Studioの「Restore Stock Settings」でファームウェア内の配置を読み直してください。

## 元に戻す

- 左手最内側キーを `Space` に戻す
- Layer 1の変更キーをすべて `Transparent` に戻す

DYA Studioの変更は実機設定へ保存されますが、リポジトリのソースには自動反映されません。
