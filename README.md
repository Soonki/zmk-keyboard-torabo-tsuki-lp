
[torabo-tsuki LP](https://github.com/sekigon-gonnoc/torabo-tsuki-lp)用のZMKファームウェア

* _centralがついているuf2をトラックボールがついている方に、_peripheralを反対側に書き込んでください
* キーマップはkeymap-editorおよびzmk-studioで編集できます

## ビルド & デプロイ

ビルド（GitHub Actions）・ファームウェアの取得・書き込み手順は [docs/BUILD_AND_DEPLOY.md](docs/BUILD_AND_DEPLOY.md) を参照してください。

```bash
# 手動ビルド
gh workflow run "Build ZMK firmware" --repo Soonki/zmk-keyboard-torabo-tsuki-lp --ref master

# 最新ビルドの .uf2 を取得（PowerShell）
./scripts/fetch-firmware.ps1
```