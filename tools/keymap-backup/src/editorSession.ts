import { createBackupDocument } from "./backup";
import type {
  AppContext,
  BackupDocument,
  BehaviorBinding,
  DeviceSnapshot,
  UndoAction
} from "./types";

export interface KeymapWriter {
  setLayerBinding(layerId: number, keyPosition: number, binding: BehaviorBinding): Promise<void>;
  setLayerName(layerId: number, name: string): Promise<void>;
}

export interface WriteResult {
  backup?: BackupDocument;
}

export interface KeymapEditorSessionOptions {
  onPreWriteBackup?: (backup: BackupDocument) => void | Promise<void>;
}

export class KeymapEditorSession {
  readonly undoStack: UndoAction[] = [];
  private preWriteBackupCreated = false;

  constructor(
    public snapshot: DeviceSnapshot,
    private readonly writer: KeymapWriter,
    private readonly context: AppContext,
    private readonly options: KeymapEditorSessionOptions = {}
  ) {}

  exportBackup(label = "keymap"): { filenameLabel: string; backup: BackupDocument } {
    return {
      filenameLabel: label,
      backup: createBackupDocument(this.snapshot, this.context)
    };
  }

  async setBinding(
    layerIndex: number,
    keyPosition: number,
    binding: BehaviorBinding
  ): Promise<WriteResult> {
    const layer = this.snapshot.keymap.layers[layerIndex];
    if (!layer) {
      throw new Error(`Layer index ${layerIndex} does not exist.`);
    }
    if (!layer.bindings[keyPosition]) {
      throw new Error(`Key position ${keyPosition} does not exist on layer ${layerIndex}.`);
    }
    const oldBinding = clone(layer.bindings[keyPosition]);
    const backup = await this.ensurePreWriteBackup();
    await this.writer.setLayerBinding(layer.id, keyPosition, binding);
    layer.bindings[keyPosition] = clone(binding);
    this.undoStack.push({
      label: `Undo key ${keyPosition} on layer ${layerIndex}`,
      run: async () => {
        await this.writer.setLayerBinding(layer.id, keyPosition, oldBinding);
        layer.bindings[keyPosition] = clone(oldBinding);
      }
    });
    return { backup };
  }

  async setLayerName(layerIndex: number, name: string): Promise<WriteResult> {
    const layer = this.snapshot.keymap.layers[layerIndex];
    if (!layer) {
      throw new Error(`Layer index ${layerIndex} does not exist.`);
    }
    const oldName = layer.name ?? "";
    const backup = await this.ensurePreWriteBackup();
    await this.writer.setLayerName(layer.id, name);
    layer.name = name;
    this.undoStack.push({
      label: `Undo layer ${layerIndex} name`,
      run: async () => {
        await this.writer.setLayerName(layer.id, oldName);
        layer.name = oldName;
      }
    });
    return { backup };
  }

  async undoLast(): Promise<void> {
    const action = this.undoStack[this.undoStack.length - 1];
    if (!action) {
      return;
    }
    await action.run();
    this.undoStack.pop();
  }

  get hasUndo(): boolean {
    return this.undoStack.length > 0;
  }

  private async ensurePreWriteBackup(): Promise<BackupDocument | undefined> {
    if (this.preWriteBackupCreated) {
      return undefined;
    }
    this.preWriteBackupCreated = true;
    const backup = createBackupDocument(this.snapshot, this.context);
    await this.options.onPreWriteBackup?.(backup);
    return backup;
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
