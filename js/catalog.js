export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createEmptyTest() {
  return {
    id: newId("t"),
    label: "New test",
    unit: "",
    type: "numeric",
    enabled: true,
    min: null,
    max: null,
    display: "",
    male: null,
    female: null
  };
}

export function createEmptySection() {
  return {
    id: newId("sec"),
    title: "New section",
    enabled: false,
    startOnNewPage: true,
    tests: [createEmptyTest()]
  };
}

function test(label, unit, min, max, extra = {}) {
  return {
    id: newId("t"),
    label,
    unit,
    type: extra.type || "numeric",
    enabled: true,
    min,
    max,
    display: extra.display || "",
    male: extra.male || null,
    female: extra.female || null
  };
}

export const SECTION_PRESETS = {
  lft: {
    id: "lft",
    title: "Liver Function Tests",
    tests: () => [
      test("Bilirubin (Total)", "mg%", 0.2, 1.2),
      test("Bilirubin (Direct)", "mg%", 0, 0.3),
      test("SGOT (AST)", "U/L", 5, 40),
      test("SGPT (ALT)", "U/L", 7, 56),
      test("Alkaline Phosphatase", "U/L", 44, 147),
      test("Total Protein", "g%", 6.0, 8.3),
      test("Albumin", "g%", 3.5, 5.0)
    ]
  },
  lipid: {
    id: "lipid",
    title: "Lipid Profile",
    tests: () => [
      test("Cholesterol", "mg%", 0, 200),
      test("HDL", "mg%", 40, 60),
      test("LDL", "mg%", 0, 100),
      test("Triglycerides", "mg%", 0, 150)
    ]
  },
  thyroid: {
    id: "thyroid",
    title: "Thyroid Profile",
    tests: () => [
      test("T3", "ng/ml", 0.8, 2.0),
      test("T4", "ug/dl", 4.5, 12.0),
      test("TSH", "uIU/ml", 0.4, 4.0)
    ]
  }
};

export function createPresetSection(presetKey) {
  const preset = SECTION_PRESETS[presetKey];
  if (!preset) return createEmptySection();
  return {
    id: newId("sec"),
    title: preset.title,
    enabled: false,
    startOnNewPage: true,
    tests: preset.tests()
  };
}

export function findCustomTest(sections, testId) {
  for (const section of sections || []) {
    const found = (section.tests || []).find((item) => item.id === testId);
    if (found) return found;
  }
  return null;
}

export function enabledCustomSections(settings) {
  return (settings?.customSections || []).filter((section) => section.enabled);
}

export function enabledTests(section) {
  return (section?.tests || []).filter((item) => item.enabled !== false);
}

export function normalizeCustomSections(list) {
  if (!Array.isArray(list)) return [];
  return list.map((section) => ({
    id: section.id || newId("sec"),
    title: section.title || "Untitled section",
    enabled: Boolean(section.enabled),
    startOnNewPage: section.startOnNewPage !== false,
    tests: Array.isArray(section.tests)
      ? section.tests.map((item) => ({
          id: item.id || newId("t"),
          label: item.label || "Untitled test",
          unit: item.unit || "",
          type: item.type === "text" ? "text" : "numeric",
          enabled: item.enabled !== false,
          min: item.min == null || item.min === "" ? null : Number(item.min),
          max: item.max == null || item.max === "" ? null : Number(item.max),
          display: item.display || "",
          male: item.male && typeof item.male === "object" ? item.male : null,
          female: item.female && typeof item.female === "object" ? item.female : null
        }))
      : []
  }));
}
