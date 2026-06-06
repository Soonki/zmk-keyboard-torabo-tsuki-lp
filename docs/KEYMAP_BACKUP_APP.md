# Keymap Backup + Simple Editor

`tools/keymap-backup` is a small browser app for backing up and editing the
runtime keymap stored on a torabo-tsuki LP running this firmware.

## What It Does

- Connects to the central side over USB with Chrome or Edge Web Serial.
- Uses the ZMK Studio serial transport settings from
  `@zmkfirmware/zmk-studio-ts-client` (`12500` baud).
- Reads the current ZMK Studio keymap from the device.
- Downloads a JSON backup containing layers, raw bindings, layout metadata,
  behavior metadata, and a checksum.
- Displays layer tabs and the torabo-tsuki LP S/M/L physical layouts using the
  shield `physical_layout_*` coordinates and `position_map_1` key-position map.
- Edits one key binding at a time for common behaviors: `&kp`, `&mo`, `&lt`,
  `&mt`, `&bt`, `&out`, `&mkp`, `&trans`, and `&none`.
- Renames layers.
- Saves successful edits through ZMK Studio RPC.
- Downloads a pre-write backup automatically before the first change in a
  session.

The app edits the live device through ZMK Studio RPC. It does not rewrite
`config/keymap.keymap`.

## Run Locally

Requires Node.js `20.19.0` or newer in the Node 20 line, or Node.js
`22.12.0` or newer.

```powershell
cd tools/keymap-backup
npm install
npm run dev
```

Open the URL printed by Vite in Chrome or Edge, connect the central side over
USB, then press `Connect USB`.

## Backup Format

Backups are named like:

```text
torabo-tsuki-lp-keymap-YYYYMMDD-HHmmss.json
```

Before the first edit in a session, the app also downloads:

```text
torabo-tsuki-lp-prewrite-YYYYMMDD-HHmmss.json
```

The JSON schema version is `1`. The keymap data preserves each raw binding as:

```json
{
  "behaviorId": 12,
  "param1": 458756,
  "param2": 0
}
```

Unsupported or custom bindings are shown raw and are preserved in backups unless
you explicitly replace them with a supported behavior.

## Limits

Version 1 does not handle DYA trackball/sleep settings, combo or macro creation,
full ZMK Studio parity, `.keymap` generation, or whole-keymap restore.
