#!/usr/bin/env pwsh
<#
.SYNOPSIS
    最新の成功した ZMK ビルドから .uf2 ファームウェアを取得する。
.DESCRIPTION
    GitHub Actions の最新成功 run（または -RunId 指定の run）から
    firmware アーティファクトを ./firmware に展開する。
    gh CLI が認証済みであることが前提。
.EXAMPLE
    ./scripts/fetch-firmware.ps1
.EXAMPLE
    ./scripts/fetch-firmware.ps1 -RunId 26286631981
#>
param(
    [string]$Repo = "Soonki/zmk-keyboard-torabo-tsuki-lp",
    [string]$RunId,
    [string]$OutDir = "firmware"
)

$ErrorActionPreference = "Stop"

# gh の存在確認
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "gh (GitHub CLI) が見つかりません。https://cli.github.com/ からインストールしてください。"
}

if (-not $RunId) {
    Write-Host "最新の成功ビルドを検索中..." -ForegroundColor Cyan
    $RunId = gh run list --repo $Repo --workflow "Build ZMK firmware" `
        --status success --limit 1 --json databaseId --jq ".[0].databaseId"
    if (-not $RunId) { throw "成功したビルドが見つかりませんでした。先にビルドを実行してください。" }
}

Write-Host "Run #$RunId から firmware を取得します -> $OutDir/" -ForegroundColor Cyan

if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
gh run download $RunId --repo $Repo -D $OutDir

Write-Host ""
Write-Host "=== 取得した .uf2 ===" -ForegroundColor Green
Get-ChildItem -Path $OutDir -Recurse -Filter *.uf2 | ForEach-Object { Write-Host "  $($_.FullName)" }

Write-Host ""
Write-Host "書き込み先の対応は docs/BUILD_AND_DEPLOY.md の「3. どの .uf2 をどちらに書き込むか」を参照。" -ForegroundColor Yellow
