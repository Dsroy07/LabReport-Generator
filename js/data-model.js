import { todayISO, trimValue, deepClone, isBlank } from "./utils.js";

export function createEmptyReport() {
  return {
    patient: {
      name: "",
      age: "",
      sex: "",
      date: todayISO()
    },
    hematology: {
      hb: "",
      wbcTotal: "",
      differential: {
        p: "",
        l: "",
        m: "",
        b: "",
        e: ""
      },
      esr: ""
    },
    blood: {
      group: "",
      rhFactor: "",
      sugar: {
        fasting: "",
        postPrandial: "",
        random: ""
      }
    },
    otherTests: {
      urineSugar: "",
      bloodUrea: "",
      bleedingTime: "",
      clottingTime: "",
      raFactor: "",
      serumUricAcid: "",
      serumCreatinine: "",
      hiv: "",
      hbsag: ""
    },
    urine: {
      physical: {
        colour: "",
        acidity: "",
        specificGravity: ""
      },
      chemical: {
        albumin: "",
        sugar: "",
        bileSalts: "",
        bilePigments: "",
        ketoneBodies: ""
      },
      microscopic: {
        wbc: "",
        rbc: "",
        epithelialCells: "",
        casts: "",
        crystals: "",
        miscellaneous: "",
        parasites: ""
      }
    }
  };
}

export function normalizeValue(value) {
  if (value == null) return "";
  const trimmed = String(value).trim();
  if (trimmed === "undefined" || trimmed === "null" || trimmed === "NaN") return "";
  return trimmed.replace(/\s+/g, " ");
}

function normalizeTree(node) {
  if (node == null) return "";
  if (typeof node !== "object") return normalizeValue(node);
  const out = Array.isArray(node) ? [] : {};
  for (const [key, value] of Object.entries(node)) {
    out[key] = normalizeTree(value);
  }
  return out;
}

export function normalizeReport(report) {
  const source = report && typeof report === "object" ? report : createEmptyReport();
  const merged = deepClone(createEmptyReport());
  mergeDefined(merged, source);
  const normalized = normalizeTree(merged);
  if (isBlank(normalized.patient.date)) normalized.patient.date = todayISO();
  return normalized;
}

function mergeDefined(target, source) {
  if (!source || typeof source !== "object") return;
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value) && target[key] && typeof target[key] === "object") {
      mergeDefined(target[key], value);
    } else if (value !== undefined) {
      target[key] = value;
    }
  }
}

export function serializeReport(report) {
  return JSON.stringify(normalizeReport(report));
}

export function deserializeReport(json) {
  if (!json) return createEmptyReport();
  const parsed = typeof json === "string" ? JSON.parse(json) : json;
  return normalizeReport(parsed);
}

export function reportHasUnsavedWork(report) {
  const normalized = normalizeReport(report);
  const date = trimValue(normalized.patient.date);
  const today = todayISO();
  const clone = deepClone(normalized);
  clone.patient.date = "";
  const empty = createEmptyReport();
  empty.patient.date = "";
  return JSON.stringify(clone) !== JSON.stringify(empty) || (date && date !== today);
}
