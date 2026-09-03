import { isBlank, trimValue } from "./utils.js";
import { findCustomTest } from "./catalog.js";

export const DEFAULT_REFERENCE_RANGES = {
  hb: {
    label: "Hb",
    unit: "gm%",
    type: "numeric",
    decimals: 1,
    min: 12.0,
    max: 17.0,
    male: { min: 13.0, max: 17.0 },
    female: { min: 12.0, max: 15.0 }
  },
  wbcTotal: {
    label: "W.B.C. Total",
    unit: "Cells / cmm",
    type: "numeric",
    decimals: 0,
    min: 4000,
    max: 11000
  },
  diffP: {
    label: "P",
    unit: "%",
    type: "numeric",
    decimals: 0,
    min: 40,
    max: 75
  },
  diffL: {
    label: "L",
    unit: "%",
    type: "numeric",
    decimals: 0,
    min: 20,
    max: 45
  },
  diffM: {
    label: "M",
    unit: "%",
    type: "numeric",
    decimals: 0,
    min: 2,
    max: 10
  },
  diffB: {
    label: "B",
    unit: "%",
    type: "numeric",
    decimals: 0,
    min: 0,
    max: 1
  },
  diffE: {
    label: "E",
    unit: "%",
    type: "numeric",
    decimals: 0,
    min: 1,
    max: 6
  },
  esr: {
    label: "E.S.R.",
    unit: "mm/hr",
    type: "numeric",
    decimals: 0,
    min: 0,
    max: 20,
    male: { min: 0, max: 15 },
    female: { min: 0, max: 20 }
  },
  sugarFasting: {
    label: "Fasting",
    unit: "mg%",
    type: "numeric",
    decimals: 0,
    min: 70,
    max: 110
  },
  sugarPostPrandial: {
    label: "Post prandial",
    unit: "mg%",
    type: "numeric",
    decimals: 0,
    min: 70,
    max: 140
  },
  sugarRandom: {
    label: "Random",
    unit: "mg%",
    type: "numeric",
    decimals: 0,
    min: 70,
    max: 140
  },
  urineSugar: {
    label: "Urine Sugar",
    unit: "",
    type: "qualitative",
    display: "Nil"
  },
  bloodUrea: {
    label: "Blood Urea",
    unit: "mg%",
    type: "numeric",
    decimals: 0,
    min: 15,
    max: 40
  },
  bleedingTime: {
    label: "Bleeding Time",
    unit: "seconds",
    type: "numeric",
    decimals: 0,
    min: 120,
    max: 420
  },
  clottingTime: {
    label: "Clotting Time",
    unit: "seconds",
    type: "numeric",
    decimals: 0,
    min: 240,
    max: 600
  },
  raFactor: {
    label: "RA Factor Test",
    unit: "mg%",
    type: "numeric",
    decimals: 1,
    min: 0,
    max: 20,
    display: "Negative / <= 20"
  },
  serumUricAcid: {
    label: "Serum Uric Acid",
    unit: "mg%",
    type: "numeric",
    decimals: 1,
    min: 2.6,
    max: 7.2,
    male: { min: 3.5, max: 7.2 },
    female: { min: 2.6, max: 6.0 }
  },
  serumCreatinine: {
    label: "Serum Creatinine",
    unit: "mg%",
    type: "numeric",
    decimals: 1,
    min: 0.6,
    max: 1.3,
    male: { min: 0.7, max: 1.3 },
    female: { min: 0.6, max: 1.1 }
  },
  hiv: {
    label: "HIV Test",
    unit: "",
    type: "qualitative",
    display: "Non-Reactive"
  },
  hbsag: {
    label: "HBsAg Test",
    unit: "",
    type: "qualitative",
    display: "Non-Reactive"
  },
  urineColour: {
    label: "Colour",
    unit: "",
    type: "qualitative",
    display: "Pale Yellow"
  },
  urineAcidity: {
    label: "Acidity",
    unit: "",
    type: "numeric",
    decimals: 1,
    min: 4.6,
    max: 8.0,
    display: "Acidic / 4.6 - 8.0"
  },
  specificGravity: {
    label: "Specific gravity",
    unit: "",
    type: "numeric",
    decimals: 3,
    min: 1.005,
    max: 1.03
  },
  albumin: {
    label: "Albumin",
    unit: "",
    type: "qualitative",
    display: "Nil"
  },
  urineChemSugar: {
    label: "Sugar",
    unit: "",
    type: "qualitative",
    display: "Nil"
  },
  bileSalts: {
    label: "Bile Salts",
    unit: "",
    type: "qualitative",
    display: "Nil"
  },
  bilePigments: {
    label: "Bile Pigments",
    unit: "",
    type: "qualitative",
    display: "Nil"
  },
  ketoneBodies: {
    label: "Ketone Bodies",
    unit: "",
    type: "qualitative",
    display: "Nil"
  },
  microWbc: {
    label: "W.B.C.",
    unit: "",
    type: "numeric",
    decimals: 0,
    min: 0,
    max: 5,
    display: "0 - 5 / HPF"
  },
  microRbc: {
    label: "R.B.C.",
    unit: "",
    type: "numeric",
    decimals: 0,
    min: 0,
    max: 2,
    display: "0 - 2 / HPF"
  },
  epithelialCells: {
    label: "Epithelial cells",
    unit: "",
    type: "qualitative",
    display: "Few / Nil"
  },
  casts: {
    label: "Casts",
    unit: "",
    type: "qualitative",
    display: "Nil"
  },
  crystals: {
    label: "Crystals",
    unit: "",
    type: "qualitative",
    display: "Nil"
  },
  miscellaneous: {
    label: "Miscellaneous",
    unit: "",
    type: "qualitative",
    display: "Nil"
  },
  parasites: {
    label: "Parasites",
    unit: "",
    type: "qualitative",
    display: "Nil"
  }
};

const EPS = 1e-9;

export function parseLabNumber(raw) {
  const text = trimValue(raw);
  if (!text) return { kind: "empty" };

  const span = text.match(/^(-?\d+(?:\.\d+)?)\s*[-–to]+\s*(-?\d+(?:\.\d+)?)/i);
  if (span) {
    return {
      kind: "span",
      min: Number(span[1]),
      max: Number(span[2])
    };
  }

  const compact = text.replace(/,/g, "");
  const single = compact.match(/^-?\d+(?:\.\d+)?/);
  if (!single) return { kind: "text", value: text };

  const remainder = compact.slice(single[0].length);
  const looksLikeId = /[a-z]{4,}/i.test(remainder) && !/(gm|mg|mm|hr|min|sec|hpf|lpf|cmm|cells|%|\/)/i.test(remainder);
  if (looksLikeId) return { kind: "text", value: text };

  return {
    kind: "number",
    value: Number(single[0]),
    unitHint: remainder
  };
}

function toCanonicalNumber(value, unitHint, range) {
  if (value == null || Number.isNaN(value)) return null;
  const hint = String(unitHint || "").toLowerCase();
  const unit = String(range?.unit || "").toLowerCase();
  if (unit.includes("sec") && /\bmin/.test(hint)) return value * 60;
  return value;
}

export function resolveRange(rangeKey, sex, overrides) {
  if (!rangeKey) return null;
  const base = DEFAULT_REFERENCE_RANGES[rangeKey];
  if (!base && !(overrides && overrides[rangeKey])) return null;
  const merged = {
    ...(base || {}),
    ...((overrides && overrides[rangeKey]) || {}),
    key: rangeKey
  };
  if (merged.enabled === false) return { ...merged, active: false };

  const sexKey = String(sex || "").trim().toLowerCase();
  let min = merged.min;
  let max = merged.max;
  if (sexKey === "male" && merged.male) {
    min = merged.male.min;
    max = merged.male.max;
  } else if (sexKey === "female" && merged.female) {
    min = merged.female.min;
    max = merged.female.max;
  }

  return {
    ...merged,
    min: min == null || min === "" ? null : Number(min),
    max: max == null || max === "" ? null : Number(max),
    active: true
  };
}

export function formatNumberForRange(value, decimals) {
  if (value == null || Number.isNaN(Number(value))) return "";
  const n = Number(value);
  if (decimals == null) {
    if (Math.abs(n - Math.round(n)) < EPS) return String(Math.round(n));
    return String(n);
  }
  return n.toFixed(decimals);
}

export function formatRangeText(range) {
  if (!range || range.active === false) return "";
  if (range.display) return range.display;
  if (range.type === "qualitative") return range.reference || "";

  const decimals = range.decimals;
  const hasMin = range.min != null && !Number.isNaN(range.min);
  const hasMax = range.max != null && !Number.isNaN(range.max);
  if (hasMin && hasMax) {
    return `${formatNumberForRange(range.min, decimals)} – ${formatNumberForRange(range.max, decimals)}`;
  }
  if (hasMax && !hasMin) return `≤ ${formatNumberForRange(range.max, decimals)}`;
  if (hasMin && !hasMax) return `≥ ${formatNumberForRange(range.min, decimals)}`;
  return range.reference || "";
}

function belowMin(value, min) {
  return min != null && !Number.isNaN(min) && value < min - EPS;
}

function aboveMax(value, max) {
  return max != null && !Number.isNaN(max) && value > max + EPS;
}

export function isOutOfRange(rawValue, range) {
  if (!range || range.active === false) return false;
  if (range.type === "qualitative") return false;
  if (isBlank(rawValue)) return false;

  const parsed = parseLabNumber(rawValue);
  if (parsed.kind === "empty" || parsed.kind === "text") return false;

  if (parsed.kind === "span") {
    const lo = toCanonicalNumber(parsed.min, rawValue, range);
    const hi = toCanonicalNumber(parsed.max, rawValue, range);
    return belowMin(lo, range.min) || aboveMax(hi, range.max);
  }

  const canonical = toCanonicalNumber(parsed.value, parsed.unitHint || rawValue, range);
  if (canonical == null) return false;
  return belowMin(canonical, range.min) || aboveMax(canonical, range.max);
}

export function customTestToRange(test, sex) {
  if (!test) return null;
  return resolveRange(
    "custom",
    sex,
    {
      custom: {
        label: test.label,
        unit: test.unit || "",
        type: test.type === "text" ? "qualitative" : "numeric",
        min: test.min,
        max: test.max,
        display: test.display || "",
        male: test.male,
        female: test.female
      }
    }
  );
}

export function evaluateResult(rawValue, rangeKey, sex, overrides, customSections) {
  if (rangeKey && String(rangeKey).startsWith("custom:")) {
    const test = findCustomTest(customSections, String(rangeKey).slice(7));
    if (!test || test.enabled === false) {
      return { range: null, rangeText: "", unit: "", outOfRange: false };
    }
    const range = customTestToRange(test, sex);
    return {
      range,
      rangeText: formatRangeText(range),
      unit: range?.unit || test.unit || "",
      outOfRange: isOutOfRange(rawValue, range)
    };
  }
  const range = resolveRange(rangeKey, sex, overrides);
  if (!range) {
    return {
      range: null,
      rangeText: "",
      unit: "",
      outOfRange: false
    };
  }
  return {
    range,
    rangeText: formatRangeText(range),
    unit: range.unit || "",
    outOfRange: isOutOfRange(rawValue, range)
  };
}

export function listConfigurableRanges() {
  return Object.entries(DEFAULT_REFERENCE_RANGES).map(([key, def]) => ({
    key,
    ...def
  }));
}
