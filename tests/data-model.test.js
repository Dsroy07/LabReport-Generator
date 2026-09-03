import test from "node:test";
import assert from "node:assert/strict";
import { createEmptyReport, normalizeReport, normalizeValue } from "../js/data-model.js";

test("empty report has today's date and blank results", () => {
  const report = createEmptyReport();
  assert.equal(report.patient.name, "");
  assert.equal(report.hematology.hb, "");
  assert.equal(report.urine.microscopic.wbc, "");
  assert.match(report.patient.date, /^\d{4}-\d{2}-\d{2}$/);
});

test("normalize trims clinically meaningless whitespace only", () => {
  assert.equal(normalizeValue("   Nil   "), "Nil");
  assert.equal(normalizeValue("2-3 / HPF"), "2-3 / HPF");
  assert.equal(normalizeValue("undefined"), "");
  assert.equal(normalizeValue("null"), "");
});

test("partial reports keep entered values and fill missing keys", () => {
  const normalized = normalizeReport({
    patient: { name: "  Asha  " },
    hematology: { hb: "10.2" }
  });
  assert.equal(normalized.patient.name, "Asha");
  assert.equal(normalized.hematology.hb, "10.2");
  assert.equal(normalized.otherTests.hiv, "");
  assert.equal(normalized.urine.physical.colour, "");
});
