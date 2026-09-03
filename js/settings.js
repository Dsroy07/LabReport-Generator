import { deepClone } from "./utils.js";
import { DEFAULT_REFERENCE_RANGES } from "./ranges.js";
import { loadStoredSettings, saveStoredSettings } from "./storage.js";

export function createDefaultSettings() {
  return {
    version: 1,
    doctor1: {
      name: "Dr. RAM JETHMALANI",
      qualification: "M.S. (Ortho)"
    },
    doctor2: {
      name: "Dr. (Mrs.) SWAPNA JETHMALANI",
      qualification: "M.D. (Ob. & Gyn.)"
    },
    laboratoryName: "",
    reportTitle: "LABORATORY REPORT",
    address: "",
    phone: "",
    email: "",
    logo: null,
    referenceRanges: deepClone(DEFAULT_REFERENCE_RANGES)
  };
}

function mergeRanges(stored) {
  const merged = deepClone(DEFAULT_REFERENCE_RANGES);
  if (!stored || typeof stored !== "object") return merged;
  for (const [key, value] of Object.entries(stored)) {
    if (!merged[key] || !value || typeof value !== "object") continue;
    merged[key] = { ...merged[key], ...value };
    if (value.male) merged[key].male = { ...(merged[key].male || {}), ...value.male };
    if (value.female) merged[key].female = { ...(merged[key].female || {}), ...value.female };
  }
  return merged;
}

export function normalizeSettings(input) {
  const defaults = createDefaultSettings();
  const source = input && typeof input === "object" ? input : {};
  return {
    version: 1,
    doctor1: {
      name: source.doctor1?.name ?? defaults.doctor1.name,
      qualification: source.doctor1?.qualification ?? defaults.doctor1.qualification
    },
    doctor2: {
      name: source.doctor2?.name ?? defaults.doctor2.name,
      qualification: source.doctor2?.qualification ?? defaults.doctor2.qualification
    },
    laboratoryName: source.laboratoryName ?? defaults.laboratoryName,
    reportTitle: source.reportTitle || defaults.reportTitle,
    address: source.address ?? defaults.address,
    phone: source.phone ?? defaults.phone,
    email: source.email ?? defaults.email,
    logo: source.logo ?? null,
    referenceRanges: mergeRanges(source.referenceRanges)
  };
}

export function loadSettings() {
  return normalizeSettings(loadStoredSettings());
}

export function saveSettings(settings) {
  const normalized = normalizeSettings(settings);
  saveStoredSettings(normalized);
  return normalized;
}
