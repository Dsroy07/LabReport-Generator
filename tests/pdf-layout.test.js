import test from "node:test";
import assert from "node:assert/strict";
import { PDF_LAYOUT, TEMPLATE_META } from "../templates/laboratory-report/layout.js";
import { buildPdfFilename } from "../js/pdf-generator.js";
import { sanitizeFilename } from "../js/utils.js";

test("template is a two-page A4 portrait report", () => {
  assert.equal(TEMPLATE_META.pages, 2);
  assert.equal(TEMPLATE_META.pageSize, "A4");
  assert.equal(TEMPLATE_META.orientation, "portrait");
  assert.equal(PDF_LAYOUT.pageWidth, 210);
  assert.equal(PDF_LAYOUT.pageHeight, 297);
});

test("filename is sanitized", () => {
  const name = buildPdfFilename({
    patient: { name: "Rahul Sharma", date: "2026-09-03" }
  });
  assert.equal(name, "Laboratory_Report_Rahul_Sharma_2026-09-03.pdf");
  assert.equal(sanitizeFilename('Asha / Rao:*?'), "Asha_Rao");
});
