import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateResult,
  formatRangeText,
  isOutOfRange,
  parseLabNumber,
  resolveRange
} from "../js/ranges.js";

test("parseLabNumber reads decimals, commas, and spans", () => {
  assert.deepEqual(parseLabNumber("12.5").kind, "number");
  assert.equal(parseLabNumber("12.5").value, 12.5);
  assert.equal(parseLabNumber("8,200").value, 8200);
  assert.equal(parseLabNumber("2-3 / HPF").kind, "span");
  assert.equal(parseLabNumber("2-3 / HPF").min, 2);
  assert.equal(parseLabNumber("2-3 / HPF").max, 3);
  assert.equal(parseLabNumber("Nil").kind, "text");
  assert.equal(parseLabNumber("").kind, "empty");
});

test("values below or above the range are out of range", () => {
  const hbMale = resolveRange("hb", "Male");
  assert.equal(isOutOfRange("10.2", hbMale), true);
  assert.equal(isOutOfRange("18.1", hbMale), true);
  assert.equal(isOutOfRange("13.2", hbMale), false);
  assert.equal(isOutOfRange("", hbMale), false);
  assert.equal(isOutOfRange("Nil", hbMale), false);
});

test("WBC above range is out of range", () => {
  const wbc = resolveRange("wbcTotal");
  assert.equal(isOutOfRange("15000", wbc), true);
  assert.equal(isOutOfRange("8,200", wbc), false);
  assert.equal(isOutOfRange("7800", wbc), false);
});

test("microscopy spans use the numeric interval", () => {
  const wbc = resolveRange("microWbc");
  assert.equal(isOutOfRange("2-3 / HPF", wbc), false);
  assert.equal(isOutOfRange("8-10 / HPF", wbc), true);
});

test("sex-specific Hb ranges", () => {
  const male = evaluateResult("12.0", "hb", "Male");
  const female = evaluateResult("12.0", "hb", "Female");
  assert.equal(male.outOfRange, true);
  assert.equal(female.outOfRange, false);
  assert.match(male.rangeText, /13\.0/);
  assert.match(female.rangeText, /12\.0/);
});

test("range text is printed even when the result is blank", () => {
  const blank = evaluateResult("", "bloodUrea", "");
  assert.equal(blank.outOfRange, false);
  assert.equal(blank.rangeText, "15 – 40");
});

test("qualitative fields show a reference and are not auto-bolded", () => {
  const hiv = evaluateResult("Reactive", "hiv", "");
  assert.equal(hiv.outOfRange, false);
  assert.equal(hiv.rangeText, "Non-Reactive");
});

test("bleeding time in minutes is compared in seconds", () => {
  const bt = resolveRange("bleedingTime");
  assert.equal(isOutOfRange("180", bt), false);
  assert.equal(isOutOfRange("2 min", bt), false);
  assert.equal(isOutOfRange("20 min", bt), true);
});

test("custom display text is used when provided", () => {
  const ra = resolveRange("raFactor");
  assert.equal(formatRangeText(ra), "Negative / <= 20");
  assert.equal(isOutOfRange("40", ra), true);
  assert.equal(isOutOfRange("Negative", ra), false);
});
