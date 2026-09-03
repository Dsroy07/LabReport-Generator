import { createEmptyReport, normalizeReport } from "./data-model.js";
import { loadSettings } from "./settings.js";
import { deepClone } from "./utils.js";

const listeners = new Set();

export const appState = {
  report: createEmptyReport(),
  settings: loadSettings(),
  ui: {
    previewVisible: true,
    status: "",
    dirty: false
  }
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) fn(appState);
}

export function getState() {
  return appState;
}

export function setReport(report, options = {}) {
  appState.report = normalizeReport(report);
  if (options.dirty !== false) appState.ui.dirty = true;
  emit();
}

export function patchReport(mutator) {
  const next = deepClone(appState.report);
  mutator(next);
  setReport(next);
}

export function resetReport() {
  appState.report = createEmptyReport();
  appState.ui.dirty = false;
  emit();
}

export function setSettings(settings) {
  appState.settings = settings;
  emit();
}

export function setStatus(message) {
  appState.ui.status = message || "";
  emit();
}

export function markClean() {
  appState.ui.dirty = false;
}
