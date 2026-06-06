import { backupFilename } from "./backup";
import type { BackupDocument } from "./types";

export function downloadBackup(backup: BackupDocument, label = "keymap"): void {
  const blob = new Blob([JSON.stringify(backup, null, 2) + "\n"], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = backupFilename(new Date(backup.exportedAt), label);
  anchor.click();
  URL.revokeObjectURL(url);
}
