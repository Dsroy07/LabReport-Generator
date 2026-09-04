import { TEMPLATE_META } from "./layout.js";

export { TEMPLATE_META };

export const PATIENT_FIELDS = [
  { path: "patient.name", label: "Patient Name", required: true, type: "text", autocomplete: "name", keyboard: "letters" },
  { path: "patient.age", label: "Age", type: "text", hint: "Years", keyboard: "decimal" },
  { path: "patient.sex", label: "Sex", type: "select", options: ["", "Male", "Female", "Other"], hint: "Used for reference ranges; not printed on the PDF" },
  { path: "patient.date", label: "Report Date", required: true, type: "date" }
];

export const PAGE1_LAYOUT = [
  { kind: "field", path: "hematology.hb", label: "Hb", unit: "gm%", rangeKey: "hb" },
  { kind: "field", path: "hematology.wbcTotal", label: "W.B.C. Total", unit: "Cells / cmm", rangeKey: "wbcTotal" },
  {
    kind: "differential",
    label: "Differential Count",
    unit: "%",
    items: [
      { path: "hematology.differential.p", label: "P", rangeKey: "diffP" },
      { path: "hematology.differential.l", label: "L", rangeKey: "diffL" },
      { path: "hematology.differential.m", label: "M", rangeKey: "diffM" },
      { path: "hematology.differential.b", label: "B", rangeKey: "diffB" },
      { path: "hematology.differential.e", label: "E", rangeKey: "diffE" }
    ]
  },
  {
    kind: "field",
    path: "hematology.esr",
    label: "E.S.R.",
    unit: "mm/hr",
    rangeKey: "esr"
  },
  { kind: "field", path: "blood.group", label: "Blood Group", unit: "", rangeKey: null, list: "blood-group" },
  { kind: "field", path: "blood.rhFactor", label: "Rh Factor", unit: "", rangeKey: null, list: "rh-factor" },
  {
    kind: "group",
    label: "Blood Sugar",
    unit: "mg%",
    items: [
      { path: "blood.sugar.fasting", label: "a) Fasting", rangeKey: "sugarFasting" },
      { path: "blood.sugar.postPrandial", label: "b) Post prandial", rangeKey: "sugarPostPrandial" },
      { path: "blood.sugar.random", label: "c) Random", rangeKey: "sugarRandom" }
    ]
  },
  { kind: "field", path: "otherTests.urineSugar", label: "Urine Sugar", unit: "", rangeKey: "urineSugar" },
  { kind: "field", path: "otherTests.bloodUrea", label: "Blood Urea", unit: "mg%", rangeKey: "bloodUrea" },
  { kind: "field", path: "otherTests.bleedingTime", label: "Bleeding Time", unit: "seconds", rangeKey: "bleedingTime" },
  { kind: "field", path: "otherTests.clottingTime", label: "Clotting Time", unit: "seconds", rangeKey: "clottingTime" },
  { kind: "field", path: "otherTests.raFactor", label: "RA Factor Test", unit: "mg%", rangeKey: "raFactor" },
  { kind: "field", path: "otherTests.serumUricAcid", label: "Serum Uric Acid", unit: "mg%", rangeKey: "serumUricAcid" },
  { kind: "field", path: "otherTests.serumCreatinine", label: "Serum Creatinine", unit: "mg%", rangeKey: "serumCreatinine" },
  { kind: "field", path: "otherTests.hiv", label: "HIV Test", unit: "", rangeKey: "hiv", list: "serology" },
  { kind: "field", path: "otherTests.hbsag", label: "HBsAg Test", unit: "", rangeKey: "hbsag", list: "serology" }
];

export const PAGE2_LAYOUT = [
  { kind: "heading", label: "URINE EXAMINATION", level: 1 },
  { kind: "heading", label: "PHYSICAL EXAMINATION", level: 2 },
  { kind: "field", n: "1)", path: "urine.physical.colour", label: "Colour", rangeKey: "urineColour", list: "urine-colour" },
  { kind: "field", n: "2)", path: "urine.physical.acidity", label: "Acidity", rangeKey: "urineAcidity" },
  { kind: "field", n: "3)", path: "urine.physical.specificGravity", label: "Specific gravity", rangeKey: "specificGravity" },
  { kind: "heading", label: "CHEMICAL EXAMINATION", level: 2 },
  { kind: "field", n: "1)", path: "urine.chemical.albumin", label: "Albumin", rangeKey: "albumin" },
  { kind: "field", n: "2)", path: "urine.chemical.sugar", label: "Sugar", rangeKey: "urineChemSugar" },
  { kind: "field", n: "3)", path: "urine.chemical.bileSalts", label: "Bile Salts", rangeKey: "bileSalts" },
  { kind: "field", n: "4)", path: "urine.chemical.bilePigments", label: "Bile Pigments", rangeKey: "bilePigments" },
  { kind: "field", n: "5)", path: "urine.chemical.ketoneBodies", label: "Ketone Bodies", rangeKey: "ketoneBodies" },
  { kind: "heading", label: "MICROSCOPIC EXAMINATION", level: 2 },
  {
    kind: "cells",
    n: "1)",
    label: "Cells -",
    items: [
      { path: "urine.microscopic.wbc", label: "W.B.C.", rangeKey: "microWbc" },
      { path: "urine.microscopic.rbc", label: "R.B.C.", rangeKey: "microRbc" },
      { path: "urine.microscopic.epithelialCells", label: "Epithelial cells", rangeKey: "epithelialCells" }
    ]
  },
  { kind: "field", n: "2)", path: "urine.microscopic.casts", label: "Casts", rangeKey: "casts" },
  { kind: "field", n: "3)", path: "urine.microscopic.crystals", label: "Crystals", rangeKey: "crystals" },
  { kind: "field", n: "4)", path: "urine.microscopic.miscellaneous", label: "Miscellaneous", rangeKey: "miscellaneous" },
  { kind: "field", n: "5)", path: "urine.microscopic.parasites", label: "Parasites", rangeKey: "parasites" }
];

export const DATALISTS = {
  "blood-group": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "rh-factor": ["Positive", "Negative", "+", "-"],
  serology: ["Non-Reactive", "Reactive", "Negative", "Positive"],
  "urine-colour": ["Pale Yellow", "Yellow", "Dark Yellow", "Straw"]
};

export const FORM_SECTIONS = [
  { id: "patient", title: "Patient Information", fields: PATIENT_FIELDS },
  { id: "hematology", title: "Hematology", layout: PAGE1_LAYOUT.slice(0, 4) },
  { id: "blood", title: "Blood Examination", layout: PAGE1_LAYOUT.slice(4, 7) },
  { id: "other", title: "Other Laboratory Tests", layout: PAGE1_LAYOUT.slice(7) },
  { id: "urine", title: "Urine Examination", layout: PAGE2_LAYOUT.filter((row) => row.kind !== "heading" || row.level === 2) }
];
