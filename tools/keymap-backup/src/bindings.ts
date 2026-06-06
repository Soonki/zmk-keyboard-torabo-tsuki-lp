import type { BehaviorBinding, BehaviorDetails, KeymapLayer } from "./types";

export type BehaviorRole = "kp" | "mo" | "lt" | "mt" | "bt" | "out" | "mkp" | "trans" | "none";

export interface BehaviorDefinition {
  role: BehaviorRole;
  label: string;
  description: string;
  param1: "none" | "key" | "layer" | "number";
  param2: "none" | "key" | "layer" | "number";
  matches: RegExp[];
}

export interface ResolvedBehaviorOption extends BehaviorDefinition {
  behaviorId: number;
  displayName: string;
}

export const SUPPORTED_BEHAVIORS: BehaviorDefinition[] = [
  {
    role: "kp",
    label: "&kp",
    description: "Key press",
    param1: "key",
    param2: "none",
    matches: [/^key press$/, /^kp$/]
  },
  {
    role: "mo",
    label: "&mo",
    description: "Momentary layer",
    param1: "layer",
    param2: "none",
    matches: [/momentary/, /^mo$/]
  },
  {
    role: "lt",
    label: "&lt",
    description: "Layer tap",
    param1: "layer",
    param2: "key",
    matches: [/layer tap/, /^lt$/]
  },
  {
    role: "mt",
    label: "&mt",
    description: "Mod tap",
    param1: "number",
    param2: "key",
    matches: [/mod tap/, /^mt$/]
  },
  {
    role: "bt",
    label: "&bt",
    description: "Bluetooth command",
    param1: "number",
    param2: "number",
    matches: [/bluetooth/, /^bt$/]
  },
  {
    role: "out",
    label: "&out",
    description: "Output selection",
    param1: "number",
    param2: "none",
    matches: [/output/, /^out$/]
  },
  {
    role: "mkp",
    label: "&mkp",
    description: "Mouse button",
    param1: "number",
    param2: "none",
    matches: [/mouse.*button/, /^mkp$/]
  },
  {
    role: "trans",
    label: "&trans",
    description: "Transparent",
    param1: "none",
    param2: "none",
    matches: [/transparent/, /^trans$/]
  },
  {
    role: "none",
    label: "&none",
    description: "No action",
    param1: "none",
    param2: "none",
    matches: [/no action/, /^none$/]
  }
];

export const KEY_USAGE_OPTIONS = [
  ["A", 0x00070004],
  ["B", 0x00070005],
  ["C", 0x00070006],
  ["D", 0x00070007],
  ["E", 0x00070008],
  ["F", 0x00070009],
  ["G", 0x0007000a],
  ["H", 0x0007000b],
  ["I", 0x0007000c],
  ["J", 0x0007000d],
  ["K", 0x0007000e],
  ["L", 0x0007000f],
  ["M", 0x00070010],
  ["N", 0x00070011],
  ["O", 0x00070012],
  ["P", 0x00070013],
  ["Q", 0x00070014],
  ["R", 0x00070015],
  ["S", 0x00070016],
  ["T", 0x00070017],
  ["U", 0x00070018],
  ["V", 0x00070019],
  ["W", 0x0007001a],
  ["X", 0x0007001b],
  ["Y", 0x0007001c],
  ["Z", 0x0007001d],
  ["N1", 0x0007001e],
  ["N2", 0x0007001f],
  ["N3", 0x00070020],
  ["N4", 0x00070021],
  ["N5", 0x00070022],
  ["N6", 0x00070023],
  ["N7", 0x00070024],
  ["N8", 0x00070025],
  ["N9", 0x00070026],
  ["N0", 0x00070027],
  ["ENTER", 0x00070028],
  ["ESC", 0x00070029],
  ["BSPC", 0x0007002a],
  ["TAB", 0x0007002b],
  ["SPACE", 0x0007002c],
  ["MINUS", 0x0007002d],
  ["EQUAL", 0x0007002e],
  ["LBKT", 0x0007002f],
  ["RBKT", 0x00070030],
  ["BSLH", 0x00070031],
  ["SEMI", 0x00070033],
  ["SQT", 0x00070034],
  ["GRAVE", 0x00070035],
  ["COMMA", 0x00070036],
  ["DOT", 0x00070037],
  ["FSLH", 0x00070038],
  ["CAPS", 0x00070039],
  ["F1", 0x0007003a],
  ["F2", 0x0007003b],
  ["F3", 0x0007003c],
  ["F4", 0x0007003d],
  ["F5", 0x0007003e],
  ["F6", 0x0007003f],
  ["F7", 0x00070040],
  ["F8", 0x00070041],
  ["F9", 0x00070042],
  ["F10", 0x00070043],
  ["F11", 0x00070044],
  ["F12", 0x00070045],
  ["PSCRN", 0x00070046],
  ["SCROLLLOCK", 0x00070047],
  ["PAUSE_BREAK", 0x00070048],
  ["INS", 0x00070049],
  ["HOME", 0x0007004a],
  ["PG_UP", 0x0007004b],
  ["DEL", 0x0007004c],
  ["END", 0x0007004d],
  ["PG_DN", 0x0007004e],
  ["RIGHT", 0x0007004f],
  ["LEFT", 0x00070050],
  ["DOWN", 0x00070051],
  ["UP", 0x00070052],
  ["LCTRL", 0x000700e0],
  ["LSHFT", 0x000700e1],
  ["LALT", 0x000700e2],
  ["LGUI", 0x000700e3],
  ["RCTRL", 0x000700e4],
  ["RSHFT", 0x000700e5],
  ["RALT", 0x000700e6],
  ["RGUI", 0x000700e7]
] as const;

export const KEY_USAGE_BY_VALUE = new Map(
  KEY_USAGE_OPTIONS.map(([label, value]) => [value, label])
);

const SIMPLE_KEY_LABELS = new Map<number, string>([
  [0x0007001e, "1"],
  [0x0007001f, "2"],
  [0x00070020, "3"],
  [0x00070021, "4"],
  [0x00070022, "5"],
  [0x00070023, "6"],
  [0x00070024, "7"],
  [0x00070025, "8"],
  [0x00070026, "9"],
  [0x00070027, "0"],
  [0x00070028, "Enter"],
  [0x00070029, "Esc"],
  [0x0007002a, "Bspc"],
  [0x0007002b, "Tab"],
  [0x0007002c, "Space"],
  [0x0007002d, "-"],
  [0x0007002e, "="],
  [0x0007002f, "["],
  [0x00070030, "]"],
  [0x00070031, "\\"],
  [0x00070033, ";"],
  [0x00070034, "'"],
  [0x00070035, "`"],
  [0x00070036, ","],
  [0x00070037, "."],
  [0x00070038, "/"],
  [0x00070039, "Caps"],
  [0x00070049, "Ins"],
  [0x0007004a, "Home"],
  [0x0007004b, "PgUp"],
  [0x0007004c, "Del"],
  [0x0007004d, "End"],
  [0x0007004e, "PgDn"],
  [0x0007004f, "→"],
  [0x00070050, "←"],
  [0x00070051, "↓"],
  [0x00070052, "↑"],
  [0x000700e0, "LCtl"],
  [0x000700e1, "LSft"],
  [0x000700e2, "LAlt"],
  [0x000700e3, "LGui"],
  [0x000700e4, "RCtl"],
  [0x000700e5, "RSft"],
  [0x000700e6, "RAlt"],
  [0x000700e7, "RGui"],
  [0x0107002c, "IME"],
  [0x1007002c, "IME"],
  [0x0207001e, "!"],
  [0x0207001f, "@"],
  [0x02070020, "#"],
  [0x02070021, "$"],
  [0x02070022, "%"],
  [0x02070023, "^"],
  [0x02070024, "&"],
  [0x02070025, "*"],
  [0x02070026, "("],
  [0x02070027, ")"],
  [0x0207002d, "_"],
  [0x0207002e, "+"],
  [0x02070031, "|"],
  [0x02070033, ":"],
  [0x02070034, "\""],
  [0x02070035, "~"]
]);

const MOUSE_BUTTON_LABELS = new Map<number, string>([
  [1, "LClick"],
  [2, "RClick"],
  [4, "MClick"],
  [8, "Back"],
  [16, "Fwd"]
]);

const OUTPUT_LABELS = new Map<number, string>([
  [1, "USB"],
  [2, "BLE"]
]);

const BT_LABELS = new Map<number, string>([
  [0, "BT Clear"],
  [1, "BT Next"]
]);

export function resolveBehaviorOptions(
  behaviors: Record<string, BehaviorDetails>
): ResolvedBehaviorOption[] {
  const available: ResolvedBehaviorOption[] = [];
  for (const detail of Object.values(behaviors)) {
    if (typeof detail.id !== "number") continue;
    const definition = matchDefinition(detail.displayName ?? "");
    if (!definition) continue;
    if (available.some((option) => option.role === definition.role)) continue;
    available.push({
      ...definition,
      behaviorId: detail.id,
      displayName: detail.displayName ?? `Behavior ${detail.id}`
    });
  }

  return available.sort((a, b) => a.label.localeCompare(b.label));
}

export function resolveBindingRole(
  binding: BehaviorBinding,
  behaviors: Record<string, BehaviorDetails>
): BehaviorRole | undefined {
  const detail = behaviors[String(binding.behaviorId)];
  return matchDefinition(detail?.displayName ?? "")?.role;
}

export function isSupportedBinding(
  binding: BehaviorBinding,
  behaviors: Record<string, BehaviorDetails>
): boolean {
  return resolveBindingRole(binding, behaviors) != null;
}

export function makeBinding(
  behaviorId: number,
  option: ResolvedBehaviorOption,
  param1 = 0,
  param2 = 0
): BehaviorBinding {
  return {
    behaviorId,
    param1: option.param1 === "none" ? 0 : param1,
    param2: option.param2 === "none" ? 0 : param2
  };
}

export function formatBinding(
  binding: BehaviorBinding,
  layers: KeymapLayer[],
  behaviors: Record<string, BehaviorDetails>
): string {
  const role = resolveBindingRole(binding, behaviors);
  const detail = behaviors[String(binding.behaviorId)];
  const label = role ? `&${role}` : detail?.displayName ?? `#${binding.behaviorId}`;

  if (role === "trans" || role === "none") {
    return label;
  }
  if (role === "kp") {
    return `${label} ${formatKeyUsage(binding.param1)}`;
  }
  if (role === "mo") {
    return `${label} ${formatLayer(binding.param1, layers)}`;
  }
  if (role === "lt") {
    return `${label} ${formatLayer(binding.param1, layers)} ${formatKeyUsage(binding.param2)}`;
  }
  if (role === "mt") {
    return `${label} ${binding.param1} ${formatKeyUsage(binding.param2)}`;
  }
  if (role === "bt") {
    return `${label} ${binding.param1} ${binding.param2}`;
  }
  if (role === "out" || role === "mkp") {
    return `${label} ${binding.param1}`;
  }
  return `${label} ${binding.param1} ${binding.param2}`;
}

export function formatKeycapLabel(
  binding: BehaviorBinding,
  layers: KeymapLayer[],
  behaviors: Record<string, BehaviorDetails>
): string {
  const role = resolveBindingRole(binding, behaviors);
  const detail = behaviors[String(binding.behaviorId)];

  if (role === "trans") return "—";
  if (role === "none") return "None";
  if (role === "kp") return formatSimpleKeyUsage(binding.param1);
  if (role === "mo") return formatLayerShort(binding.param1, layers);
  if (role === "lt") {
    return `${formatLayerShort(binding.param1, layers)}/${formatSimpleKeyUsage(binding.param2)}`;
  }
  if (role === "mt") {
    return `${formatSimpleKeyUsageForDualRole(binding.param2)}/${formatSimpleKeyUsage(binding.param1)}`;
  }
  if (role === "mkp") {
    return MOUSE_BUTTON_LABELS.get(binding.param1) ?? `Mouse ${binding.param1}`;
  }
  if (role === "out") {
    return OUTPUT_LABELS.get(binding.param1) ?? `Out ${binding.param1}`;
  }
  if (role === "bt") {
    return BT_LABELS.get(binding.param1) ?? `BT ${binding.param1}`;
  }

  return detail?.displayName ?? `#${binding.behaviorId}`;
}

export function formatKeyUsage(value: number): string {
  return KEY_USAGE_BY_VALUE.get(value as (typeof KEY_USAGE_OPTIONS)[number][1]) ?? `0x${value.toString(16)}`;
}

export function optionForBehaviorId(
  behaviorId: number,
  options: ResolvedBehaviorOption[]
): ResolvedBehaviorOption | undefined {
  return options.find((option) => option.behaviorId === behaviorId);
}

function matchDefinition(displayName: string): BehaviorDefinition | undefined {
  const normalized = displayName.trim().toLowerCase().replace(/^&/, "");
  return SUPPORTED_BEHAVIORS.find((definition) =>
    definition.matches.some((pattern) => pattern.test(normalized))
  );
}

function formatLayer(value: number, layers: KeymapLayer[]): string {
  const layer = layers.find((candidate, index) => candidate.id === value || index === value);
  if (!layer) {
    return value.toString();
  }
  return layer.name ? `${layer.name} (${layer.id})` : `Layer ${layer.id}`;
}

function formatLayerShort(value: number, layers: KeymapLayer[]): string {
  const layer = layers.find((candidate, index) => candidate.id === value || index === value);
  return `L${layer?.id ?? value}`;
}

function formatSimpleKeyUsage(value: number): string {
  return SIMPLE_KEY_LABELS.get(value) ?? formatKeyUsage(value);
}

function formatSimpleKeyUsageForDualRole(value: number): string {
  if (value === 0x00070038) return "Slash";
  return formatSimpleKeyUsage(value);
}
