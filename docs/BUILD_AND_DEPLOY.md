# ビルド & デプロイガイド（torabo-tsuki LP / ZMK）

このリポジトリは [torabo-tsuki LP](https://github.com/sekigon-gonnoc/torabo-tsuki-lp) 用の ZMK ファームウェア設定（user-config）です。
ファームウェアは **GitHub Actions（クラウドビルド）** で生成し、生成された `.uf2` をキーボードに書き込みます。

---

## 0. リポジトリ構成（このフォークのセットアップ）

| remote | 用途 | URL |
|--------|------|-----|
| `origin` | 自分のフォーク（ビルドを回す場所） | `git@github.com:Soonki/zmk-keyboard-torabo-tsuki-lp.git` |
| `upstream` | 本家（更新の取り込み元） | `https://github.com/sekigon-gonnoc/zmk-keyboard-torabo-tsuki-lp.git` |

本家の更新を取り込む場合:

```bash
git fetch upstream
git merge upstream/master      # または git rebase upstream/master
git push origin master
```

---

## 1. ビルドの起動方法

ビルドワークフロー（`.github/workflows/build.yml`）は **push / pull_request / 手動（workflow_dispatch）** に対応しています。

> ⚠️ **fork の注意**: GitHub の仕様で、**fork したリポジトリでは push/PR による自動ビルドがデフォルトで無効**です（`workflow_dispatch` による手動ビルドは動作します）。
> push で自動ビルドしたい場合は、**一度だけ**下記の有効化が必要です（[2.5 push自動ビルドの有効化](#25-push-自動ビルドの有効化一度だけ) 参照）。

### A. 手動ビルド（推奨・確実）

```bash
gh workflow run "Build ZMK firmware" --repo Soonki/zmk-keyboard-torabo-tsuki-lp --ref master
```

### B. push で自動ビルド（事前に 2.5 の有効化が必要）

キーマップや設定を変更して push するとビルドが走ります。

```bash
git add -A
git commit -m "keymap: 〇〇を変更"
git push origin master
```

### ビルド状況の確認

```bash
gh run list  --repo Soonki/zmk-keyboard-torabo-tsuki-lp --limit 5
gh run watch <RUN_ID> --repo Soonki/zmk-keyboard-torabo-tsuki-lp   # 完了まで監視
```

---

### 2.5 push 自動ビルドの有効化（一度だけ）

fork では push 自動ビルドが無効なため、以下を **一度だけ** 実施すると有効になります（ブラウザ操作）。

1. <https://github.com/Soonki/zmk-keyboard-torabo-tsuki-lp/actions> を開く。
2. 「**Workflows aren't being run on this forked repository**」というバナーが出るので
   「**I understand my workflows, go ahead and enable them**」ボタンを押す。
3. 以降、`git push origin master` で自動的にビルドが走るようになる。

> これを行わなくても、手動ビルド（[1-A](#a-手動ビルド推奨確実)）でいつでもビルドできます。

---

## 2. 成果物（.uf2）のダウンロード

最新の成功ビルドから `firmware` アーティファクトをまとめて取得します。

```bash
# 最新の成功 run の成果物を ./firmware に展開
gh run download --repo Soonki/zmk-keyboard-torabo-tsuki-lp -n firmware -D firmware
```

run を指定する場合:

```bash
gh run download <RUN_ID> --repo Soonki/zmk-keyboard-torabo-tsuki-lp -D firmware
```

> GitHub の Web UI からでもダウンロード可: リポジトリ → Actions → 対象の run → 下部 "Artifacts"。

`firmware/` 以下に各ターゲットの `.uf2` が展開されます（`.gitignore` 済みなのでコミットされません）。

---

## 3. どの .uf2 をどちらに書き込むか

`build.yaml` で定義しているビルドターゲットと書き込み先の対応です。

> 原則: **トラックボール／トラックパッドが付いている側 = `central`**、**反対側 = `peripheral`** を書き込みます。

### 構成パターン別 一覧

| 構成 | 左手側 | 右手側 |
|------|--------|--------|
| **トラックボールが左** | `torabo_tsuki_lp_left_central` | `torabo_tsuki_lp_right_peripheral` |
| **トラックボールが右** | `torabo_tsuki_lp_left_peripheral` | `torabo_tsuki_lp_right_central` |
| **両側ボール（ダブルボール）** | `torabo_tsuki_lp_double_ball_left_peripheral` | `torabo_tsuki_lp_double_ball_right_central` |

> `central` 側が USB / BLE のホスト役（PC と接続する側）、`peripheral` 側は `central` と BLE で接続します。
> 左右で central/peripheral を二重に書き込まないよう注意してください。

### settings_reset

ペアリング情報や設定が壊れた・左右が繋がらない等のときに使用します。
`settings_reset-bmp_boost-zmk.uf2` を **両側それぞれに書き込む** と、保存設定が初期化されます。
その後、通常のファームウェアを書き直してください。

---

## 4. キーボードへの書き込み（フラッシュ）

1. キーボードを USB でPCに接続する。
2. **ブートローダーモード**に入る（リセットボタンをダブルタップ等。機種の手順に従う）。
3. `XXXX BOOT` のような **USB ドライブ**として認識される。
4. 目的の `.uf2` ファイルをそのドライブに **ドラッグ&ドロップ（コピー）** する。
5. 書き込みが完了すると自動で再起動し、ドライブが消える。

左右両方に対して、上記をそれぞれ実施します（central 側 → peripheral 側）。

---

## 5. キーマップの編集

このファームウェアは **ZMK Studio** と **keymap-editor** に対応しています（`CONFIG_ZMK_STUDIO=y`）。

- **ZMK Studio**: <https://zmk.studio/> から、ビルド済みファームウェアを書き込んだキーボードを USB 接続してリアルタイム編集。
- **keymap-editor**: <https://nickcoutsos.github.io/keymap-editor/> で `config/keymap.keymap` を GUI 編集。
- 直接編集する場合は `config/keymap.keymap` および `boards/shields/torabo_tsuki_lp/torabo_tsuki_lp.keymap` を編集 → push でビルド。

---

## 補足: ローカルビルド（任意）

通常は GitHub Actions で十分ですが、オフラインで高速に回したい場合は west + Zephyr SDK でローカルビルドも可能です（WSL / Docker 推奨）。必要になったら別途セットアップします。
