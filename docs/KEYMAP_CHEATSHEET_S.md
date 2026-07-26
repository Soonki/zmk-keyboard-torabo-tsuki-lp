# torabo-tsuki LP — Sサイズ キーマップ チートシート

対象: `config/keymap.keymap`（コンボ式マウス操作）を **Sサイズ物理レイアウト**（`physical_layout_s`）で使用した場合の各キー割り当て。

> Sサイズは L から **数字行・最外列・中央のLCLK/RCLK専用キー** を省いた配列です（`torabo_tsuki_lp_layouts.dtsi` の `position_map_1` でレイアウト間のキー対応を吸収）。
> 凡例: `—` = 透過（`&trans`、下位レイヤーのキーが効く） / `tap/hold` = タップとホールドで別動作。

---

## Layer 0 — ベース（通常入力）

```
 Q     W     E     R     T    │    Y     U     I     O     P
 A     S     D     F     G    │    H     J     K     L     ;
 Z     X     C     V     B  Codex│ Ent   N     M     ,     .     /※
        LCtl  LGui  LAlt  BSpc  L2/Spc  IME/LSft │ IME/L2  L3/Ent  BSpc  RAlt  RGui  RCtl
```

- `/※` = `&mt RIGHT_SHIFT FSLH`（タップ=`/`、ホールド=右Shift）
- `Codex` = `&mo 1`（ホールド中だけCodexレイヤー）
- `L2/Spc` = `&lt 2 SPACE`（タップ=Space、ホールド=Layer 2）
- `L3/Ent` = `&lt 3 ENTER`（タップ=Enter、ホールド=Layer 3）
- 左 `IME/LSft` = `&mt LSHFT LC(SPACE)`（タップ=`左Ctrl+Space`、ホールド=左Shift）
- 右 `IME/L2` = `&lt 2 RC(SPACE)`（タップ=`右Ctrl+Space`、ホールド=Layer 2）

> **IME切替**: 左右いずれかの内側親指 `IME` をタップ。OS側で `Ctrl+Space` を入力言語切替に設定して使用します。

---

## マウス操作コンボ（オートマウスなし）

| 動作 | コンボ |
|---|---|
| 左クリック | `J` + `K` |
| 右クリック | `K` + `L` |
| スクロール | `L` + `;` を一度タップしてからトラックボールを動かす |
| ブラウザで戻る（MB4） | `H` + `J` |
| ブラウザで進む（MB5） | `,` + `.` |

- トラックボール移動だけではレイヤーは切り替わりません。
- 各コンボは直前125ms以内に通常キー入力があると発動しないため、タイピング中の誤爆を抑えます。
- 左クリックコンボを押したままボールを動かすと、ドラッグや範囲選択ができます。
- スクロール中に左クリックコンボを押すと、スクロールを解除してから左クリックします。
- スクロールは次の通常キー入力で解除されます。時間による自動解除はありません。解除時に押した通常キーもそのまま入力されます。

### Layer 1 — Codex（左手最内側 `Codex` ホールド中）

```
 —       —        —        —          —     │  Review   Terminal  Browser  Files    Commands
 —       —        —        —          —     │  Back     Prev      Next     Stop     Approve
 —       —        —        —          —     — │  Find     New       Model    Recent−  Recent＋  Shortcuts
        —        —        —        —       —       —     │    —       Send     Dictate   —        —        —
```

- `Review` = レビューパネルを開く（`Ctrl+Shift+G`）
- `Terminal` / `Browser` / `Files` = ターミナル、ブラウザ、ファイルツリーを開く
- `Commands` = コマンドメニュー（`Ctrl+K`）
- `Back` = 画面を戻る、`Prev` / `Next` = 前後のチャット
- `Stop` = 実行停止／承認拒否（`Esc`）、`Approve` = 承認（`Enter`）
- `Find` = 現在のチャット内検索、`New` = 新規チャット、`Model` = モデル選択
- `Recent−` / `Recent＋` = 最近使ったチャットを前後移動
- `Shortcuts` = Codexショートカット一覧（`Ctrl+/`）
- 右親指の `Send` = Enter、`Dictate` = 音声入力開始（`Ctrl+Shift+D`）
- マウス操作コンボはLayer 1を対象外にしています。

---

## Layer 2 — 記号・数字（左親指 `L2/Spc` ホールド中）

```
 !     @     #     $     %    │    ^     &     *     (     )
 1     2     3     4     5    │    {     -     =     }     :
 6     7     8     9     0    —  │  —     _     +     [     ]     \
        —     —     —     —     —     —   │   —    Tab   Del    —     —     —
```

- 上段=Shift付き数字記号、ホーム段=数字1-5＋括弧/記号、下段=数字6-0＋記号。
- **BTクリア コンボ**: Layer 2 で **F + G を同時押し**（`&bt BT_CLR`）。

---

## Layer 3 — ファンクション・ナビ（右親指 `L3/Ent` ホールド中）

```
 F1    F2    F3    F4    F5   │   Home  PgUp  PgDn  End   Esc
 F6    F7    F8    F9    F10  │    ←     ↓     ↑     →    Tab
 F11   F12   USB   BLE  BT→  —  │  —     '     "     `     ~     |
        —     —     —    Del   Tab    —   │   —     —     —     —     —     —
```

- `USB`=`&out OUT_USB`、`BLE`=`&out OUT_BLE`、`BT→`=`&bt BT_NXT`（出力切替・BT次へ）。
- 右手側=矢印キー（H/J/K/L位置に ←↓↑→）とカーソル移動（Home/PgUp/PgDn/End）。

---

## Layer 4 — ワンショットスクロール（`L` + `;` コンボで起動）

```
 —     —     —     —     —    │    —     —     —     —     —
 —     —     —     —     —    │    —     —     —     —     —
 —     —     —     —     —     —  │  —     —     —     —     —     —
        —     —     —     —     —     —   │   —     —     —     —     —     —
```

- 全キー透過。**役割はキー入力ではなく「トラックボール移動をスクロールに変換」**（`zip_xy_scaler 1 6` で1/6減速 → `zip_xy_to_scroll_mapper`）。
- ボール上下=縦スクロール、左右=横スクロール。
- ZMK Studio に古い runtime keymap が残っている場合は、`settings_reset` を一度書き込んでから通常ファームウェアを書き込むと、このソース側の Layer 1 / 4 が反映されます。

---

## 操作フロー早見

| やりたいこと | 操作 |
|---|---|
| IMEを切り替える | 左右いずれかの親指 `IME` をタップ |
| マウス移動 | トラックボールを動かす |
| 左クリック | `J` + `K` |
| 右クリック | `K` + `L` |
| ブラウザ戻る | `H` + `J` |
| ブラウザ進む | `,` + `.` |
| ドラッグ/範囲選択 | `J` + `K` を押したままボール移動 |
| **スクロール** | **`L` + `;` を一度タップしてからボール移動**（次の通常キーで解除、時間制限なし） |
| 記号・数字 | 左親指 `L2/Spc` をホールド |
| F キー・矢印 | 右親指 `L3/Ent` をホールド |
| Codex操作 | 左手最内側 `Codex` をホールドしながら右手キー |
| Bluetooth切断 | Layer 2 で `F`+`G` 同時押し |

---

> 注: この表は L 基準で書かれた `config/keymap.keymap` を `position_map_1` 経由で S 物理配置へ変換したものです。キーマップを編集したら本ファイルも更新してください。
