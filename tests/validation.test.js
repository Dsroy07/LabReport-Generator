import test from "node:test";
import assert from "node:assert/strict";
import { createEmptyReport } from "../js/data-model.js";
import { validateReport } from "../js/validation.js";

test("empty patient name is rejected", () => {
  const report = createEmptyReport();
  report.patient.name = "";
  const result = validateReport(report);
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].field, "patient.name");
});

test("invalid date is rejected", () => {
  const report = createEmptyReport();
  report.patient.name = "Rahul Sharma";
  report.patient.date = "2026-13-40";
  const result = validateReport(report);
  assert.equal(result.ok, false);
  assert.equal(result.errors.some((item) => item.field === "patient.date"), true);
});

test("negative age is rejected", () => {
  const report = createEmptyReport();
  report.patient.name = "Rahul Sharma";
  report.patient.age = "-4";
  const result = validateReport(report);
  assert.equal(result.ok, false);
});

test("laboratory results may be blank", () => {
  const report = createEmptyReport();
  report.patient.name = "Rahul Sharma";
  const result = validateReport(report);
  assert.equal(result.ok, true);
});
