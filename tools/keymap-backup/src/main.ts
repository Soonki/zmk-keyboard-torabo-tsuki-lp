import { create_rpc_connection, type RpcConnection } from "@zmkfirmware/zmk-studio-ts-client";
import "./styles.css";
import {
  formatBinding,
  formatKeycapLabel,
  isSupportedBinding,
  KEY_USAGE_OPTIONS,
  makeBinding,
  optionForBehaviorId,
  resolveBindingRole,
  resolveBehaviorOptions
} from "./bindings";
import { validateKeymapShape } from "./backup";
import { downloadBackup } from "./download";
import { KeymapEditorSession } from "./editorSession";
import {
  bindingIndexForPhysicalKey,
  isKeyboardLayoutSize,
  KEYBOARD_LAYOUT_SIZES,
  physicalLayoutForSize
} from "./physicalLayout";
import { SerialRpcTransport } from "./serialTransport";
import { readDeviceSnapshot, setLayerBinding, setLayerName } from "./studioRpc";
import type {
  AppContext,
  BehaviorBinding,
  DeviceSnapshot,
  KeyboardLayoutSize,
  PhysicalKeyboardLayout
} from "./types";

const APP_VERSION = "0.1.0";
const REPOSITORY = "Soonki/zmk-keyboard-torabo-tsuki-lp";
const KEYBOARD = "torabo-tsuki LP";
const KEYBOARD_SIZE_STORAGE_KEY = "torabo-tsuki-keymap-backup.keyboardLayoutSize";

let conn: RpcConnection | undefined;
let transport: SerialRpcTransport | undefined;
let session: KeymapEditorSession | undefined;
let selectedLayerIndex = 0;
let selectedKeyPosition: number | undefined;
let draftBinding: BehaviorBinding | undefined;
let keyboardLayoutSize: KeyboardLayoutSize = loadKeyboardLayoutSize();
let activeKeyboardLayoutSize: KeyboardLayoutSize | undefined;
let statusMessage = "Connect the central side over USB.";
let errorMessage = "";
let busy = false;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing app root.");
}
const appRoot = app;

render();

function appContext(): AppContext {
  return {
    appVersion: APP_VERSION,
    userAgent: navigator.userAgent,
    repository: REPOSITORY,
    keyboard: KEYBOARD,
    transport: "web-serial"
  };
}

function render(): void {
  const supported = SerialRpcTransport.isSupported();
  const snapshot = session?.snapshot;
  const physicalLayout = physicalLayoutForSize(keyboardLayoutSize);
  const expectedBindingCount = snapshot?.keymap.layers[0]?.bindings.length;
  const shapeErrors = snapshot && expectedBindingCount
    ? validateKeymapShape(snapshot.keymap, expectedBindingCount)
    : snapshot
      ? validateKeymapShape(snapshot.keymap)
      : [];
  const selectedLayer = snapshot?.keymap.layers[selectedLayerIndex];
  const selectedBinding =
    selectedLayer && selectedKeyPosition != null
      ? selectedLayer.bindings[selectedKeyPosition]
      : undefined;
  draftBinding ??= selectedBinding ? { ...selectedBinding } : undefined;
  const behaviorOptions = snapshot ? resolveBehaviorOptions(snapshot.behaviors) : [];

  appRoot.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">${KEYBOARD}</p>
          <h1>Keymap Backup + Simple Editor</h1>
        </div>
        <div class="status ${errorMessage ? "status-error" : ""}">
          ${escapeHtml(errorMessage || statusMessage)}
        </div>
      </header>

      <section class="toolbar" aria-label="Connection and backup controls">
        <button id="connect" class="primary" ${busy || !supported ? "disabled" : ""}>
          ${conn ? "Reconnect" : "Connect USB"}
        </button>
        <button id="refresh" ${busy || !conn ? "disabled" : ""}>Refresh</button>
        <button id="export" ${busy || !session ? "disabled" : ""}>Download backup</button>
        <button id="undo" ${busy || !session?.hasUndo ? "disabled" : ""}>Undo last change</button>
        ${renderKeyboardSizeControl()}
        <span class="support">${supported ? "Web Serial available" : "Use Chrome or Edge for Web Serial"}</span>
      </section>

      ${
        snapshot
          ? renderSummary(
              snapshot.keymap.layers.length,
              physicalLayout.keys.length,
              activeKeyboardLayoutSize,
              shapeErrors
            )
          : renderEmpty()
      }

      ${
        snapshot
          ? `
        <section class="workspace">
          <div class="keymap-panel">
            ${renderLayerTabs()}
            ${renderLayerNameEditor()}
            ${renderKeyboardGrid(physicalLayout, selectedLayer?.bindings ?? [])}
          </div>
          <aside class="editor-panel">
            ${renderEditor(selectedBinding, behaviorOptions)}
          </aside>
        </section>
      `
          : ""
      }
    </main>
  `;

  bindEvents();
}

function renderSummary(
  layerCount: number,
  visibleKeyCount: number,
  activeSize: KeyboardLayoutSize | undefined,
  errors: string[]
): string {
  const issueList = errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("");
  return `
    <section class="summary">
      <div>
        <span class="metric">${layerCount}</span>
        <span class="label">layers</span>
      </div>
      <div>
        <span class="metric">${visibleKeyCount}</span>
        <span class="label">${keyboardLayoutSize.toUpperCase()} visible keys</span>
      </div>
      <div>
        <span class="metric">${activeSize ? activeSize.toUpperCase() : "?"}</span>
        <span class="label">active layout</span>
      </div>
      <div>
        <span class="metric">${session ? Object.keys(session.snapshot.behaviors).length : 0}</span>
        <span class="label">behaviors</span>
      </div>
      ${errors.length ? `<ul class="shape-errors">${issueList}</ul>` : "<p>Ready to inspect, back up, and edit.</p>"}
    </section>
  `;
}

function renderEmpty(): string {
  return `
    <section class="empty">
      <h2>No keyboard connected</h2>
      <p>Connect the central side over USB. The first write in a session downloads a pre-write backup before changing the device.</p>
    </section>
  `;
}

function renderLayerTabs(): string {
  if (!session) return "";
  return `
    <div class="tabs" role="tablist" aria-label="Layers">
      ${session.snapshot.keymap.layers
        .map((layer, index) => {
          const name = layer.name || `Layer ${index}`;
          return `<button class="tab ${index === selectedLayerIndex ? "active" : ""}" data-layer="${index}">${escapeHtml(name)}</button>`;
        })
        .join("")}
    </div>
  `;
}

function renderLayerNameEditor(): string {
  const layer = session?.snapshot.keymap.layers[selectedLayerIndex];
  if (!layer) return "";
  return `
    <form class="layer-name" id="layer-name-form">
      <label for="layer-name">Layer name</label>
      <input id="layer-name" name="layer-name" value="${escapeAttribute(layer.name || "")}" maxlength="20" />
      <button type="submit" ${busy ? "disabled" : ""}>Save name</button>
    </form>
  `;
}

function renderKeyboardSizeControl(): string {
  return `
    <div class="segmented" role="group" aria-label="Keyboard physical layout size">
      ${KEYBOARD_LAYOUT_SIZES.map(
        (size) => `
          <button
            type="button"
            class="segment ${keyboardLayoutSize === size.id ? "active" : ""}"
            data-keyboard-size="${size.id}"
            aria-pressed="${keyboardLayoutSize === size.id}"
            title="${size.title}"
          >${size.label}</button>
        `
      ).join("")}
    </div>
  `;
}

function renderKeyboardGrid(
  layout: PhysicalKeyboardLayout,
  bindings: BehaviorBinding[]
): string {
  return `
    <div class="keyboard-wrap">
      <div
        class="keyboard layout-${layout.size}"
        style="--layout-width:${layout.width}; --layout-height:${layout.height};"
      >
        ${layout.keys
          .map((key) => {
            const bindingIndex = bindingIndexForPhysicalKey(
              key,
              bindings.length,
              layout,
              activeKeyboardLayoutSize
            );
            const editable = bindingIndex >= 0 && bindingIndex < bindings.length;
            const binding = editable ? bindings[bindingIndex] : undefined;
            const label = binding
              ? formatBinding(
                  binding,
                  session?.snapshot.keymap.layers ?? [],
                  session?.snapshot.behaviors ?? {}
                )
              : "Missing";
            const keycapLabel = binding
              ? formatKeycapLabel(
                  binding,
                  session?.snapshot.keymap.layers ?? [],
                  session?.snapshot.behaviors ?? {}
                )
              : "Missing";
            const role = binding
              ? resolveBindingRole(binding, session?.snapshot.behaviors ?? {}) ?? "custom"
              : "missing";
            return `
              <button
                class="key key-${role} ${selectedKeyPosition === bindingIndex ? "selected" : ""} ${editable ? "" : "missing"}"
                style="${physicalKeyStyle(key, layout)}"
                ${editable ? `data-key-position="${bindingIndex}"` : "disabled"}
                aria-label="${editable ? `Position ${bindingIndex}: ${escapeAttribute(label)}` : "No binding in active layout"}"
                title="${editable ? `Position ${bindingIndex}: ${escapeAttribute(label)}` : "No binding in active layout"}"
              >
                <span>${escapeHtml(shortKeycapLabel(keycapLabel))}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderEditor(
  binding: BehaviorBinding | undefined,
  behaviorOptions = resolveBehaviorOptions(session?.snapshot.behaviors ?? {})
): string {
  if (!session) return "";
  if (!binding || selectedKeyPosition == null || !draftBinding) {
    return `
      <h2>Key editor</h2>
      <p class="muted">Select a key to inspect or change its binding.</p>
    `;
  }

  const option =
    optionForBehaviorId(draftBinding.behaviorId, behaviorOptions) ?? behaviorOptions[0];
  const raw = JSON.stringify(binding);
  const supported = isSupportedBinding(binding, session.snapshot.behaviors);
  const availableBehaviorOptions = behaviorOptions.map(
    (behavior) =>
      `<option value="${behavior.behaviorId}" ${behavior.behaviorId === draftBinding?.behaviorId ? "selected" : ""}>${behavior.label} - ${escapeHtml(behavior.displayName)}</option>`
  ).join("");

  return `
    <h2>Key ${selectedKeyPosition}</h2>
    <p class="current">${escapeHtml(formatBinding(binding, session.snapshot.keymap.layers, session.snapshot.behaviors))}</p>
    ${supported ? "" : `<p class="warning">This binding is not edited directly. Pick a supported behavior to replace it, or leave it unchanged.</p>`}
    ${
      behaviorOptions.length === 0
        ? `<p class="warning">No editable behavior metadata was returned by the device. Backup and viewing still work.</p>`
        : `<form id="binding-form" class="binding-form">
      <label for="behavior">Behavior</label>
      <select id="behavior" name="behavior">${availableBehaviorOptions}</select>
      ${renderParamControl("param1", option?.param1 ?? "number", draftBinding.param1)}
      ${renderParamControl("param2", option?.param2 ?? "number", draftBinding.param2)}
      <div class="actions">
        <button type="submit" class="primary" ${busy ? "disabled" : ""}>Save key</button>
        <button type="button" id="cancel-edit">Cancel</button>
      </div>
    </form>`
    }
    <details>
      <summary>Raw binding</summary>
      <pre>${escapeHtml(raw)}</pre>
    </details>
  `;
}

function renderParamControl(
  name: "param1" | "param2",
  kind: "none" | "key" | "layer" | "number",
  value: number
): string {
  if (kind === "none") {
    return `<input type="hidden" name="${name}" value="0" />`;
  }
  if (kind === "key") {
    const options = KEY_USAGE_OPTIONS.map(
      ([label, usage]) =>
        `<option value="${usage}" ${usage === value ? "selected" : ""}>${label}</option>`
    ).join("");
    return `
      <label for="${name}">${name === "param1" ? "Key" : "Tap key"}</label>
      <select id="${name}" name="${name}">
        ${options}
      </select>
    `;
  }
  if (kind === "layer") {
    const options = (session?.snapshot.keymap.layers ?? [])
      .map(
        (layer, index) =>
          `<option value="${layer.id}" ${layer.id === value || index === value ? "selected" : ""}>${escapeHtml(layer.name || `Layer ${index}`)} (${layer.id})</option>`
      )
      .join("");
    return `
      <label for="${name}">Layer</label>
      <select id="${name}" name="${name}">
        ${options}
      </select>
    `;
  }
  return `
    <label for="${name}">${name}</label>
    <input id="${name}" name="${name}" type="number" step="1" value="${value}" />
  `;
}

function bindEvents(): void {
  document.querySelector<HTMLButtonElement>("#connect")?.addEventListener("click", connect);
  document.querySelector<HTMLButtonElement>("#refresh")?.addEventListener("click", refresh);
  document.querySelector<HTMLButtonElement>("#export")?.addEventListener("click", () => {
    if (!session) return;
    downloadBackup(session.exportBackup().backup);
  });
  document.querySelector<HTMLButtonElement>("#undo")?.addEventListener("click", undoLast);
  document.querySelectorAll<HTMLButtonElement>("[data-keyboard-size]").forEach((button) => {
    button.addEventListener("click", () => {
      const size = button.dataset.keyboardSize;
      if (!isKeyboardLayoutSize(size)) return;
      keyboardLayoutSize = size;
      saveKeyboardLayoutSize(size);
      render();
    });
  });
  document.querySelectorAll<HTMLButtonElement>("[data-layer]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedLayerIndex = Number(button.dataset.layer);
      selectedKeyPosition = undefined;
      draftBinding = undefined;
      render();
    });
  });
  document.querySelectorAll<HTMLButtonElement>("[data-key-position]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedKeyPosition = Number(button.dataset.keyPosition);
      const binding = session?.snapshot.keymap.layers[selectedLayerIndex]?.bindings[selectedKeyPosition];
      draftBinding = binding ? { ...binding } : undefined;
      render();
    });
  });
  document.querySelector<HTMLFormElement>("#binding-form")?.addEventListener("submit", saveBinding);
  document.querySelector<HTMLSelectElement>("#behavior")?.addEventListener("change", (event) => {
    const behaviorId = Number((event.target as HTMLSelectElement).value);
    const option = optionForBehaviorId(
      behaviorId,
      resolveBehaviorOptions(session?.snapshot.behaviors ?? {})
    );
    if (!option) return;
    draftBinding = makeBinding(
      behaviorId,
      option,
      draftBinding?.param1 ?? 0,
      draftBinding?.param2 ?? 0
    );
    render();
  });
  document.querySelector<HTMLButtonElement>("#cancel-edit")?.addEventListener("click", () => {
    const binding =
      selectedKeyPosition == null
        ? undefined
        : session?.snapshot.keymap.layers[selectedLayerIndex]?.bindings[selectedKeyPosition];
    draftBinding = binding ? { ...binding } : undefined;
    render();
  });
  document.querySelector<HTMLFormElement>("#layer-name-form")?.addEventListener("submit", saveLayerName);
}

async function connect(): Promise<void> {
  await runBusy("Connecting...", async () => {
    transport = await SerialRpcTransport.request();
    conn = create_rpc_connection(transport as never);
    await loadSnapshot();
    statusMessage = `Connected to ${transport.label}.`;
  });
}

async function refresh(): Promise<void> {
  await runBusy("Refreshing keymap...", loadSnapshot);
}

async function loadSnapshot(): Promise<void> {
  if (!conn) {
    throw new Error("Not connected.");
  }
  const snapshot = await readDeviceSnapshot(conn, transport?.label ?? conn.label);
  const activeLayoutSize = inferKeyboardLayoutSize(snapshot);
  if (activeLayoutSize) {
    activeKeyboardLayoutSize = activeLayoutSize;
    keyboardLayoutSize = activeLayoutSize;
    saveKeyboardLayoutSize(activeLayoutSize);
  }
  session = new KeymapEditorSession(
    snapshot,
    {
      setLayerBinding: async (layerId, keyPosition, binding) => {
        if (!conn) throw new Error("Not connected.");
        await setLayerBinding(conn, layerId, keyPosition, binding);
      },
      setLayerName: async (layerId, name) => {
        if (!conn) throw new Error("Not connected.");
        await setLayerName(conn, layerId, name);
      }
    },
    appContext(),
    {
      onPreWriteBackup: (backup) => {
        downloadBackup(backup, "prewrite");
      }
    }
  );
  selectedLayerIndex = 0;
  selectedKeyPosition = undefined;
  draftBinding = undefined;
}

async function saveBinding(event: Event): Promise<void> {
  event.preventDefault();
  if (!session || selectedKeyPosition == null) return;
  const form = new FormData(event.target as HTMLFormElement);
  const behaviorId = Number(form.get("behavior") ?? 0);
  const option = optionForBehaviorId(
    behaviorId,
    resolveBehaviorOptions(session.snapshot.behaviors)
  );
  if (!option) {
    throw new Error("Selected behavior is not available.");
  }
  const binding = makeBinding(
    behaviorId,
    option,
    Number(form.get("param1") ?? 0),
    Number(form.get("param2") ?? 0)
  );

  await runBusy("Saving key binding...", async () => {
    await session!.setBinding(selectedLayerIndex, selectedKeyPosition!, binding);
    draftBinding = { ...binding };
    statusMessage = `Saved key ${selectedKeyPosition} on layer ${selectedLayerIndex}.`;
  });
}

async function saveLayerName(event: Event): Promise<void> {
  event.preventDefault();
  if (!session) return;
  const form = new FormData(event.target as HTMLFormElement);
  const name = String(form.get("layer-name") ?? "").trim();

  await runBusy("Saving layer name...", async () => {
    await session!.setLayerName(selectedLayerIndex, name);
    statusMessage = `Saved layer ${selectedLayerIndex} name.`;
  });
}

async function undoLast(): Promise<void> {
  if (!session) return;
  await runBusy("Undoing last change...", async () => {
    await session!.undoLast();
    statusMessage = "Undid the last change.";
  });
}

async function runBusy(message: string, action: () => Promise<void>): Promise<void> {
  busy = true;
  errorMessage = "";
  statusMessage = message;
  render();
  try {
    await action();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
  } finally {
    busy = false;
    render();
  }
}

function shortKeycapLabel(label: string): string {
  if (label.length <= 12) return label;
  return `${label.slice(0, 11)}...`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function physicalKeyStyle(
  key: PhysicalKeyboardLayout["keys"][number],
  layout: PhysicalKeyboardLayout
): string {
  const originX = key.rx === 0 && key.ry === 0 ? 50 : ((key.rx - key.x) / key.w) * 100;
  const originY = key.rx === 0 && key.ry === 0 ? 50 : ((key.ry - key.y) / key.h) * 100;
  return [
    `left:${(key.x / layout.width) * 100}%`,
    `top:${(key.y / layout.height) * 100}%`,
    `width:${(key.w / layout.width) * 100}%`,
    `height:${(key.h / layout.height) * 100}%`,
    `transform:rotate(${key.rotation}deg)`,
    `transform-origin:${originX}% ${originY}%`
  ].join(";");
}

function loadKeyboardLayoutSize(): KeyboardLayoutSize {
  try {
    const stored = localStorage.getItem(KEYBOARD_SIZE_STORAGE_KEY);
    return isKeyboardLayoutSize(stored) ? stored : "l";
  } catch {
    return "l";
  }
}

function saveKeyboardLayoutSize(size: KeyboardLayoutSize): void {
  try {
    localStorage.setItem(KEYBOARD_SIZE_STORAGE_KEY, size);
  } catch {
    // The current session can still use the selected size.
  }
}

function inferKeyboardLayoutSize(snapshot: DeviceSnapshot): KeyboardLayoutSize | undefined {
  const activePhysicalLayout = snapshot.physicalLayouts?.layouts[
    snapshot.physicalLayouts.activeLayoutIndex
  ] as { name?: unknown; keys?: unknown[] } | undefined;
  const layoutName = String(activePhysicalLayout?.name ?? "").toLowerCase();
  if (layoutName.includes("s layout") || layoutName === "s") return "s";
  if (layoutName.includes("m layout") || layoutName === "m") return "m";
  if (layoutName.includes("l layout") || layoutName === "l") return "l";

  const activeKeyCount = Array.isArray(activePhysicalLayout?.keys)
    ? activePhysicalLayout.keys.length
    : snapshot.keymap.layers[0]?.bindings.length;
  if (activeKeyCount === 44) return "s";
  if (activeKeyCount === 52) return "m";
  if (activeKeyCount === 66) return "l";
  return undefined;
}
