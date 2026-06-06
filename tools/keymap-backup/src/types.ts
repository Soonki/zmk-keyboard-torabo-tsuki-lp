export interface BehaviorBinding {
  behaviorId: number;
  param1: number;
  param2: number;
}

export interface KeymapLayer {
  id: number;
  index?: number;
  name?: string;
  bindings: BehaviorBinding[];
}

export interface RuntimeKeymap {
  layers: KeymapLayer[];
  availableLayers?: number;
}

export interface PhysicalLayouts {
  layouts: unknown[];
  activeLayoutIndex: number;
}

export interface BehaviorDetails {
  id?: number;
  displayName?: string;
  metadata?: unknown;
  [key: string]: unknown;
}

export interface DeviceSnapshot {
  connectionLabel: string;
  keymap: RuntimeKeymap;
  physicalLayouts?: PhysicalLayouts;
  behaviors: Record<string, BehaviorDetails>;
}

export interface AppContext {
  appVersion: string;
  userAgent: string;
  repository: string;
  keyboard: string;
  transport: string;
}

export interface BackupDocument {
  schemaVersion: 1;
  exportedAt: string;
  app: {
    name: string;
    version: string;
  };
  source: {
    repository: string;
    keyboard: string;
    transport: string;
  };
  device: {
    label: string;
    userAgent: string;
  };
  physicalLayouts?: PhysicalLayouts;
  activePhysicalLayoutIndex?: number;
  keymap: RuntimeKeymap;
  behaviors: Record<string, BehaviorDetails>;
  checksum: string;
}

export interface LayoutKey {
  row: number;
  col: number;
  x: number;
  y: number;
}

export type KeyboardLayoutSize = "s" | "m" | "l";

export interface PhysicalLayoutKey {
  physicalIndex: number;
  keyPosition: number;
  w: number;
  h: number;
  x: number;
  y: number;
  rotation: number;
  rx: number;
  ry: number;
}

export interface PhysicalKeyboardLayout {
  size: KeyboardLayoutSize;
  label: string;
  width: number;
  height: number;
  keys: PhysicalLayoutKey[];
}

export interface InfoJson {
  id: string;
  name: string;
  layouts: Record<string, { layout: LayoutKey[] }>;
  sensors: unknown[];
}

export interface UndoAction {
  label: string;
  run: () => Promise<void>;
}
