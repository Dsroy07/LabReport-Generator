import { formatDateDisplay, getPath, isBlank, sanitizeFilename, todayISO } from "./utils.js";
import { evaluateResult } from "./ranges.js";
import { PDF_LAYOUT } from "../templates/laboratory-report/layout.js";
import { PAGE1_LAYOUT, PAGE2_LAYOUT } from "../templates/laboratory-report/template.js";

function displayValue(value) {
  if (isBlank(value)) return "";
  const text = String(value).trim();
  if (text === "undefined" || text === "null" || text === "NaN") return "";
  return text;
}

export function buildPdfFilename(report) {
  const name = sanitizeFilename(report?.patient?.name || "Patient");
  const date = (report?.patient?.date || todayISO()).slice(0, 10);
  return `Laboratory_Report_${name}_${date}.pdf`;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-jspdf="1"]`);
    if (existing && window.jspdf?.jsPDF) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.jspdf = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to generate the PDF."));
    document.head.appendChild(script);
  });
}

export async function loadJsPDF() {
  if (typeof window !== "undefined" && window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
  if (!window.jspdf?.jsPDF) throw new Error("Unable to generate the PDF.");
  return window.jspdf.jsPDF;
}

function evalField(report, settings, rangeKey, path) {
  const value = displayValue(getPath(report, path));
  const sex = report.patient?.sex || "";
  const evaluation = evaluateResult(value, rangeKey, sex, settings.referenceRanges);
  return { value, ...evaluation };
}

function pdfText(value) {
  return String(value ?? "")
    .replace(/[–—]/g, "-")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=");
}

function setBody(doc, bold = false) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(PDF_LAYOUT.fonts.body);
  doc.setTextColor(20);
}

function setSmall(doc, bold = false) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(PDF_LAYOUT.fonts.small);
  doc.setTextColor(70);
}

function renderHeader(doc, settings, y) {
  const { left, right } = {
    left: PDF_LAYOUT.margins.left,
    right: PDF_LAYOUT.pageWidth - PDF_LAYOUT.margins.right
  };
  const d1 = settings.doctor1 || {};
  const d2 = settings.doctor2 || {};
  const mid = PDF_LAYOUT.pageWidth / 2;

  if (settings.logo) {
    try {
      doc.addImage(settings.logo, "PNG", mid - 10, y - 2, 20, 16);
    } catch {
      /* ignore invalid logo */
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20);
  if (d1.name) doc.text(pdfText(d1.name), left, y);
  if (d2.name) doc.text(pdfText(d2.name), right, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60);
  if (d1.qualification) doc.text(pdfText(d1.qualification), left, y + 5);
  if (d2.qualification) doc.text(pdfText(d2.qualification), right, y + 5, { align: "right" });

  let next = y + 14;
  if (displayValue(settings.laboratoryName)) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20);
    doc.text(pdfText(settings.laboratoryName), mid, next, { align: "center" });
    next += 6;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(PDF_LAYOUT.fonts.title);
  doc.setTextColor(20);
  doc.text(pdfText(displayValue(settings.reportTitle) || "LABORATORY REPORT"), mid, next, { align: "center" });
  next += 4;
  doc.setDrawColor(30);
  doc.setLineWidth(0.35);
  doc.line(left, next, right, next);
  next += 3;

  const contact = [settings.address, settings.phone, settings.email].map(displayValue).filter(Boolean);
  if (contact.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(80);
    doc.text(pdfText(contact.join("  |  ")), mid, next, { align: "center" });
    next += 5;
  }
  return next + 1;
}

function renderPatient(doc, report, y) {
  const left = PDF_LAYOUT.margins.left;
  const right = PDF_LAYOUT.pageWidth - PDF_LAYOUT.margins.right;
  const p = report.patient || {};
  const name = displayValue(p.name);
  const age = displayValue(p.age);
  const date = formatDateDisplay(p.date);

  setBody(doc, false);
  doc.setFont("helvetica", "bold");
  doc.text("Name", left, y);
  doc.setFont("helvetica", "normal");
  doc.text(pdfText(name), left + 16, y);
  doc.setDrawColor(160);
  doc.setLineWidth(0.15);
  doc.line(left + 16, y + 1.2, 118, y + 1.2);

  doc.setFont("helvetica", "bold");
  doc.text("Age", 122, y);
  doc.setFont("helvetica", "normal");
  doc.text(pdfText(age), 132, y);
  doc.line(132, y + 1.2, 150, y + 1.2);

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Date", left, y);
  doc.setFont("helvetica", "normal");
  doc.text(pdfText(date), left + 16, y);
  doc.line(left + 16, y + 1.2, 80, y + 1.2);

  y += 4;
  doc.setDrawColor(30);
  doc.setLineWidth(0.25);
  doc.line(left, y, right, y);
  return y + 6;
}

function renderColHeads(doc, y) {
  const c = PDF_LAYOUT.cols;
  setSmall(doc, true);
  doc.setTextColor(40);
  doc.text("Investigation", c.label, y);
  doc.text("Result", c.value, y);
  doc.text("Reference Range", c.range, y);
  doc.setDrawColor(180);
  doc.setLineWidth(0.15);
  doc.line(c.label, y + 1.6, PDF_LAYOUT.pageWidth - PDF_LAYOUT.margins.right, y + 1.6);
  return y + 6;
}

function drawResultRow(doc, y, { label, n, value, unit, rangeText, outOfRange }) {
  const c = PDF_LAYOUT.cols;
  const name = pdfText(`${n ? n + " " : ""}${label}`);
  setBody(doc, false);
  doc.text(name, c.label, y);

  if (value) {
    setBody(doc, Boolean(outOfRange));
    const shown = pdfText(value);
    doc.text(shown, c.value, y);
    if (unit) {
      const unitX = c.value + doc.getTextWidth(shown) + 2;
      setSmall(doc, false);
      doc.text(pdfText(unit), unitX, y);
    }
  }

  setSmall(doc, false);
  if (rangeText) doc.text(pdfText(rangeText), c.range, y);
  return y + PDF_LAYOUT.lineHeight;
}

function renderLayout(doc, layout, report, settings, y) {
  for (const row of layout) {
    if (row.kind === "heading") {
      y += row.level === 1 ? 2 : 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(row.level === 1 ? PDF_LAYOUT.fonts.heading : PDF_LAYOUT.fonts.section);
      doc.setTextColor(20);
      doc.text(pdfText(row.label), PDF_LAYOUT.cols.label, y);
      doc.setDrawColor(40);
      doc.setLineWidth(row.level === 1 ? 0.3 : 0.18);
      const underline = y + 1.5;
      doc.line(
        PDF_LAYOUT.cols.label,
        underline,
        PDF_LAYOUT.pageWidth - PDF_LAYOUT.margins.right,
        underline
      );
      y += 7;
      continue;
    }

    if (row.kind === "field") {
      const ev = evalField(report, settings, row.rangeKey, row.path);
      y = drawResultRow(doc, y, {
        label: row.label,
        n: row.n,
        value: ev.value,
        unit: row.pdfUnitNote || row.unit || ev.unit,
        rangeText: ev.rangeText,
        outOfRange: ev.outOfRange
      });
      continue;
    }

    if (row.kind === "group") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(PDF_LAYOUT.fonts.section);
      doc.setTextColor(20);
      doc.text(pdfText(row.label), PDF_LAYOUT.cols.label, y);
      y += 5.6;
      for (const item of row.items) {
        const ev = evalField(report, settings, item.rangeKey, item.path);
        y = drawResultRow(doc, y, {
          label: item.label,
          value: ev.value,
          unit: row.unit || ev.unit,
          rangeText: ev.rangeText,
          outOfRange: ev.outOfRange
        });
      }
      continue;
    }

    if (row.kind === "differential") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(PDF_LAYOUT.fonts.section);
      doc.setTextColor(20);
      doc.text(pdfText(row.label), PDF_LAYOUT.cols.label, y);
      y += 6;
      const startX = PDF_LAYOUT.cols.label;
      const slot = 34;
      row.items.forEach((item, index) => {
        const ev = evalField(report, settings, item.rangeKey, item.path);
        const x = startX + index * slot;
        setSmall(doc, true);
        doc.text(pdfText(item.label), x, y);
        setBody(doc, Boolean(ev.outOfRange && ev.value));
        doc.text(pdfText(ev.value || ""), x, y + 5);
        setSmall(doc, false);
        if (ev.rangeText) doc.text(pdfText(ev.rangeText), x, y + 9.5);
      });
      y += 14;
      continue;
    }

    if (row.kind === "cells") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(PDF_LAYOUT.fonts.section);
      doc.setTextColor(20);
      doc.text(pdfText(`${row.n ? row.n + " " : ""}${row.label}`), PDF_LAYOUT.cols.label, y);
      y += 5.6;
      for (const item of row.items) {
        const ev = evalField(report, settings, item.rangeKey, item.path);
        y = drawResultRow(doc, y, {
          label: item.label,
          value: ev.value,
          unit: item.unit || ev.unit,
          rangeText: ev.rangeText,
          outOfRange: ev.outOfRange
        });
      }
    }
  }
  return y;
}

export function generateReportPDF(report, settings, JsPDF) {
  const doc = new JsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });
  if (typeof doc.setCharSpace === "function") doc.setCharSpace(0);

  let y = PDF_LAYOUT.margins.top;
  y = renderHeader(doc, settings, y);
  y = renderPatient(doc, report, y);
  y = renderColHeads(doc, y);
  renderLayout(doc, PAGE1_LAYOUT, report, settings, y);

  doc.addPage();
  y = PDF_LAYOUT.margins.top;
  y = renderHeader(doc, settings, y);
  y = renderPatient(doc, report, y);
  y = renderColHeads(doc, y);
  renderLayout(doc, PAGE2_LAYOUT, report, settings, y);

  if (doc.getNumberOfPages() > 2) {
    while (doc.getNumberOfPages() > 2) {
      doc.deletePage(doc.getNumberOfPages());
    }
  }

  return doc;
}

export async function downloadReportPDF(report, settings) {
  const JsPDF = await loadJsPDF();
  const doc = generateReportPDF(report, settings, JsPDF);
  if (doc.getNumberOfPages() !== 2) {
    throw new Error("Unable to generate the PDF.");
  }
  doc.save(buildPdfFilename(report));
  return { pages: doc.getNumberOfPages(), filename: buildPdfFilename(report) };
}
