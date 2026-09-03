const SETTINGS_KEY = "labReportSettings";
const DRAFT_KEY = "labReportDraft";

function canUseStorage() {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function readJson(key, fallback = null) {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  if (!canUseStorage()) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadStoredSettings() {
  return readJson(SETTINGS_KEY, null);
}

export function saveStoredSettings(settings) {
  return writeJson(SETTINGS_KEY, settings);
}

export function loadDraft() {
  return readJson(DRAFT_KEY, null);
}

export function saveDraft(report) {
  return writeJson(DRAFT_KEY, {
    savedAt: new Date().toISOString(),
    report
  });
}

export function clearDraft() {
  removeKey(DRAFT_KEY);
}
