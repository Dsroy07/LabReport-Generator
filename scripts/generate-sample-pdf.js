import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";
import { generateReportPDF, buildPdfFilename } from "../js/pdf-generator.js";
import { createDefaultSettings } from "../js/settings.js";
import { demoReport, outOfRangeDemoReport } from "../js/demo-data.js";
import { normalizeReport, createEmptyReport } from "../js/data-model.js";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "tests", "output");
mkdirSync(outDir, { recursive: true });

const settings = createDefaultSettings();
const samples = [
  createEmptyReport(),
  normalizeReport(demoReport),
  normalizeReport(outOfRangeDemoReport)
];

for (const report of samples) {
  if (!report.patient.name) report.patient.name = "Blank Report";
  const doc = generateReportPDF(report, settings, jsPDF);
  const filename = buildPdfFilename(report);
  const bytes = Buffer.from(doc.output("arraybuffer"));
  writeFileSync(join(outDir, filename), bytes);
  const asText = bytes.toString("latin1");
  const pages = doc.getNumberOfPages();
  if (pages !== 2) {
    throw new Error(`${filename} has ${pages} pages, expected 2`);
  }
  if (!asText.includes("Reference Range")) {
    throw new Error(`${filename} is missing the Reference Range column`);
  }
  console.log(`${filename}: pages=${pages} bytes=${bytes.length}`);
}
