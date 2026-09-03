import test from "node:test";
import assert from "node:assert/strict";
import { createPresetSection, enabledCustomSections, normalizeCustomSections } from "../js/catalog.js";
import { createDefaultSettings, normalizeSettings } from "../js/settings.js";
import { evaluateResult } from "../js/ranges.js";
import { createEmptyReport } from "../js/data-model.js";

test("new settings hide extras by default", () => {
  const settings = createDefaultSettings();
  assert.equal(settings.features.showHealthCenter, false);
  assert.equal(settings.features.showDoctorRegNo, false);
  assert.equal(settings.customSections.length, 0);
  assert.equal(enabledCustomSections(settings).length, 0);
});

test("presets are inserted disabled", () => {
  const section = createPresetSection("lft");
  assert.equal(section.enabled, false);
  assert.ok(section.tests.length >= 5);
  assert.equal(section.title, "Liver Function Tests");
});

test("disabled extra sections stay out of the enabled list", () => {
  const list = normalizeCustomSections([
    { id: "a", title: "On", enabled: true, tests: [{ id: "t1", label: "A", min: 1, max: 2 }] },
    { id: "b", title: "Off", enabled: false, tests: [{ id: "t2", label: "B", min: 1, max: 2 }] }
  ]);
  assert.equal(enabledCustomSections({ customSections: list }).length, 1);
});

test("custom numeric results bold only when enabled and out of range", () => {
  const sections = [
    {
      id: "sec",
      title: "LFT",
      enabled: true,
      tests: [{ id: "sgpt", label: "SGPT", unit: "U/L", type: "numeric", enabled: true, min: 7, max: 56 }]
    }
  ];
  assert.equal(evaluateResult("90", "custom:sgpt", "Male", {}, sections).outOfRange, true);
  assert.equal(evaluateResult("30", "custom:sgpt", "Male", {}, sections).outOfRange, false);
  sections[0].tests[0].enabled = false;
  assert.equal(evaluateResult("90", "custom:sgpt", "Male", {}, sections).outOfRange, false);
});

test("v1 stored settings migrate without losing doctors", () => {
  const migrated = normalizeSettings({
    doctor1: { name: "Dr. A", qualification: "MBBS" },
    laboratoryName: "City Clinic"
  });
  assert.equal(migrated.version, 2);
  assert.equal(migrated.doctor1.registrationNo, "");
  assert.equal(migrated.features.showHealthCenter, false);
  assert.equal(migrated.laboratoryName, "City Clinic");
});

test("empty report includes custom map and extra patient keys", () => {
  const report = createEmptyReport();
  assert.deepEqual(report.custom, {});
  assert.equal(report.patient.opdNo, "");
  assert.equal(report.patient.remarks, "");
});
