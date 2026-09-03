import { deepClone } from "./utils.js";
import { DEFAULT_REFERENCE_RANGES } from "./ranges.js";
import { loadStoredSettings, saveStoredSettings } from "./storage.js";
import { normalizeCustomSections } from "./catalog.js";

export function createDefaultFeatures() {
  return {
    showHealthCenter: false,
    showDoctorRegNo: false,
    showOpdNo: false,
    showReferringDoctor: false,
    showSampleDate: false,
    showRemarks: false
  };
}

export function createDefaultSettings() {
  return {
    version: 2,
    doctor1: {
      name: "Dr. RAM JETHMALANI",
      qualification: "M.S. (Ortho)",
      registrationNo: ""
    },
    doctor2: {
      name: "Dr. (Mrs.) SWAPNA JETHMALANI",
      qualification: "M.D. (Ob. & Gyn.)",
      registrationNo: ""
    },
    laboratoryName: "",
    reportTitle: "LABORATORY REPORT",
    address: "",
    phone: "",
    email: "",
    logo: null,
    features: createDefaultFeatures(),
    customSections: [],
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

function mergeFeatures(stored) {
  return { ...createDefaultFeatures(), ...(stored && typeof stored === "object" ? stored : {}) };
}

export function normalizeSettings(input) {
  const defaults = createDefaultSettings();
  const source = input && typeof input === "object" ? input : {};
  return {
    version: 2,
    doctor1: {
      name: source.doctor1?.name ?? defaults.doctor1.name,
      qualification: source.doctor1?.qualification ?? defaults.doctor1.qualification,
      registrationNo: source.doctor1?.registrationNo ?? ""
    },
    doctor2: {
      name: source.doctor2?.name ?? defaults.doctor2.name,
      qualification: source.doctor2?.qualification ?? defaults.doctor2.qualification,
      registrationNo: source.doctor2?.registrationNo ?? ""
    },
    laboratoryName: source.laboratoryName ?? defaults.laboratoryName,
    reportTitle: source.reportTitle || defaults.reportTitle,
    address: source.address ?? defaults.address,
    phone: source.phone ?? defaults.phone,
    email: source.email ?? defaults.email,
    logo: source.logo ?? null,
    features: mergeFeatures(source.features),
    customSections: normalizeCustomSections(source.customSections),
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
