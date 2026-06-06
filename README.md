
[torabo-tsuki LP](https://github.com/sekigon-gonnoc/torabo-tsuki-lp)用のZMKファームウェア

* _centralがついているuf2をトラックボールがついている方に、_peripheralを反対側に書き込んでください
* キーマップはkeymap-editorおよびzmk-studioで編集できます
* **DYA Studio**（<https://studio.dya.cormoran.works/>）に対応しています。キーマップ編集に加え、トラックボールの速度/回転/スナップやスリープ設定を**再ビルド無しで実機調整**できます（central側に接続）。詳細は [docs/BUILD_AND_DEPLOY.md](docs/BUILD_AND_DEPLOY.md#6-dya-studio-での実機調整) を参照。
* 実機上のZMK Studioキーマップを吸い出してJSONバックアップし、簡易編集できるローカルWebアプリを追加しています。詳細は [docs/KEYMAP_BACKUP_APP.md](docs/KEYMAP_BACKUP_APP.md) を参照。

## ビルド & デプロイ

ビルド（GitHub Actions）・ファームウェアの取得・書き込み手順は [docs/BUILD_AND_DEPLOY.md](docs/BUILD_AND_DEPLOY.md) を参照してください。

```bash
# 手動ビルド
gh workflow run "Build ZMK firmware" --repo Soonki/zmk-keyboard-torabo-tsuki-lp --ref master

# 最新ビルドの .uf2 を取得（PowerShell）
./scripts/fetch-firmware.ps1
```
