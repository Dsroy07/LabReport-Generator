import test from "node:test";
import assert from "node:assert/strict";
import { resolveKeyboard } from "../js/keyboard.js";
import { PATIENT_FIELDS, PAGE1_LAYOUT, PAGE2_LAYOUT } from "../templates/laboratory-report/template.js";
import { createDefaultSettings } from "../js/settings.js";

const settings = createDefaultSettings();

function byPath(path) {
  const fromPatient = PATIENT_FIELDS.find((field) => field.path === path);
  if (fromPatient) return fromPatient;
  const walk = (rows) => {
    for (const row of rows) {
      if (row.path === path) return row;
      if (row.items) {
        const found = row.items.find((item) => item.path === path);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(PAGE1_LAYOUT) || walk(PAGE2_LAYOUT);
}

test("patient name uses the letter keyboard, not decimal", () => {
  assert.equal(resolveKeyboard(byPath("patient.name"), settings), "letters");
});

test("age uses the decimal number keyboard", () => {
  assert.equal(resolveKeyboard(byPath("patient.age"), settings), "decimal");
});

test("numeric lab values use the decimal keyboard", () => {
  for (const path of [
    "hematology.hb",
    "hematology.wbcTotal",
    "hematology.differential.p",
    "hematology.esr",
    "blood.sugar.fasting",
    "otherTests.bloodUrea",
    "otherTests.serumCreatinine",
    "urine.physical.specificGravity"
  ]) {
    assert.equal(resolveKeyboard(byPath(path), settings), "decimal", path);
  }
});

test("names, groups, and free-text results use a full or letter keyboard", () => {
  assert.equal(resolveKeyboard(byPath("blood.group"), settings), "full");
  assert.equal(resolveKeyboard(byPath("blood.rhFactor"), settings), "full");
  assert.equal(resolveKeyboard(byPath("otherTests.hiv"), settings), "full");
  assert.equal(resolveKeyboard(byPath("otherTests.urineSugar"), settings), "full");
  assert.equal(resolveKeyboard(byPath("otherTests.raFactor"), settings), "full");
  assert.equal(resolveKeyboard(byPath("urine.physical.colour"), settings), "full");
  assert.equal(resolveKeyboard(byPath("urine.chemical.albumin"), settings), "full");
  assert.equal(resolveKeyboard(byPath("urine.microscopic.wbc"), settings), "full");
});

test("custom numeric tests use decimal; text tests use full", () => {
  const customSettings = {
    customSections: [
      {
        id: "s",
        enabled: true,
        tests: [
          { id: "sgpt", label: "SGPT", type: "numeric", enabled: true, min: 7, max: 56 },
          { id: "note", label: "Note", type: "text", enabled: true }
        ]
      }
    ]
  };
  assert.equal(resolveKeyboard({ path: "custom.sgpt", rangeKey: "custom:sgpt" }, customSettings), "decimal");
  assert.equal(resolveKeyboard({ path: "custom.note", rangeKey: "custom:note" }, customSettings), "full");
});
