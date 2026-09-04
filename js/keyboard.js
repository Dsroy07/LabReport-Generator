import { DEFAULT_REFERENCE_RANGES } from "./ranges.js";
import { findCustomTest } from "./catalog.js";

const LETTER_PATHS = new Set(["patient.name", "patient.referringDoctor"]);
const DECIMAL_PATHS = new Set(["patient.age"]);
const FULL_PATHS = new Set(["patient.opdNo", "patient.remarks"]);

function displayLooksMixed(def) {
  const blob = `${def?.display || ""} ${def?.unit || ""} ${def?.label || ""}`.toLowerCase();
  return /nil|negative|positive|hpf|acidic|reactive|pale|yellow/.test(blob);
}

export function resolveKeyboard(field, settings) {
  if (!field || field.type === "date" || field.type === "select") return null;
  if (field.keyboard) return field.keyboard;

  const path = field.path || "";
  if (LETTER_PATHS.has(path)) return "letters";
  if (DECIMAL_PATHS.has(path)) return "decimal";
  if (FULL_PATHS.has(path)) return "full";
  if (field.list) return "full";

  if (field.rangeKey && String(field.rangeKey).startsWith("custom:")) {
    const test = findCustomTest(settings?.customSections, String(field.rangeKey).slice(7));
    if (!test) return "full";
    return test.type === "numeric" ? "decimal" : "full";
  }

  if (field.rangeKey && DEFAULT_REFERENCE_RANGES[field.rangeKey]) {
    const def = DEFAULT_REFERENCE_RANGES[field.rangeKey];
    if (def.type === "qualitative" || displayLooksMixed(def)) return "full";
    if (def.type === "numeric") return "decimal";
  }

  return "full";
}

export function keyboardAttributeString(kind) {
  if (kind === "letters") {
    return 'inputmode="text" autocapitalize="words" spellcheck="false" enterkeyhint="next"';
  }
  if (kind === "numeric") {
    return 'inputmode="numeric" autocapitalize="off" spellcheck="false" enterkeyhint="next"';
  }
  if (kind === "decimal") {
    return 'inputmode="decimal" autocapitalize="off" spellcheck="false" enterkeyhint="next"';
  }
  if (kind === "full") {
    return 'inputmode="text" autocapitalize="words" spellcheck="false" enterkeyhint="next"';
  }
  return "";
}
