import { formatDateDisplay, getPath, isBlank, sanitizeFilename, todayISO } from "./utils.js";
import { evaluateResult } from "./ranges.js";
import { enabledCustomSections, enabledTests } from "./catalog.js";
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
  const evaluation = evaluateResult(value, rangeKey, sex, settings.referenceRanges, settings.customSections);
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
  const features = settings.features || {};
  const mid = PDF_LAYOUT.pageWidth / 2;
  let next = y;

  if (features.showHealthCenter && displayValue(settings.laboratoryName)) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20);
    doc.text(pdfText(settings.laboratoryName), mid, next, { align: "center" });
    next += 5;
  }

  const contact = [settings.address, settings.phone, settings.email].map(displayValue).filter(Boolean);
  if (contact.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(80);
    doc.text(pdfText(contact.join("  |  ")), mid, next, { align: "center" });
    next += 5;
  }

  if (settings.logo) {
    try {
      doc.addImage(settings.logo, "PNG", mid - 10, next - 2, 18, 14);
    } catch {
      /* ignore invalid logo */
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20);
  if (d1.name) doc.text(pdfText(d1.name), left, next);
  if (d2.name) doc.text(pdfText(d2.name), right, next, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60);
  if (d1.qualification) doc.text(pdfText(d1.qualification), left, next + 5);
  if (d2.qualification) doc.text(pdfText(d2.qualification), right, next + 5, { align: "right" });

  if (features.showDoctorRegNo) {
    if (displayValue(d1.registrationNo)) doc.text(pdfText(`Reg. No. ${d1.registrationNo}`), left, next + 9.5);
    if (displayValue(d2.registrationNo)) doc.text(pdfText(`Reg. No. ${d2.registrationNo}`), right, next + 9.5, { align: "right" });
    next += 4.5;
  }

  next += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(PDF_LAYOUT.fonts.title);
  doc.setTextColor(20);
  doc.text(pdfText(displayValue(settings.reportTitle) || "LABORATORY REPORT"), mid, next, { align: "center" });
  next += 4;
  doc.setDrawColor(30);
  doc.setLineWidth(0.35);
  doc.line(left, next, right, next);
  return next + 4;
}

function renderPatient(doc, report, y, settings) {
  const left = PDF_LAYOUT.margins.left;
  const right = PDF_LAYOUT.pageWidth - PDF_LAYOUT.margins.right;
  const p = report.patient || {};
  const name = displayValue(p.name);
  const age = displayValue(p.age);
  const date = formatDateDisplay(p.date);
  const features = settings?.features || {};

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
  if (features.showOpdNo && displayValue(p.opdNo)) {
    doc.setFont("helvetica", "bold");
    doc.text("OPD / Reg. No.", left, y);
    doc.setFont("helvetica", "normal");
    doc.text(pdfText(p.opdNo), left + 32, y);
    y += 5;
  }
  if (features.showReferringDoctor && displayValue(p.referringDoctor)) {
    doc.setFont("helvetica", "bold");
    doc.text("Ref. by", left, y);
    doc.setFont("helvetica", "normal");
    doc.text(pdfText(p.referringDoctor), left + 18, y);
    y += 5;
  }
  if (features.showSampleDate && displayValue(p.sampleDate)) {
    doc.setFont("helvetica", "bold");
    doc.text("Sample", left, y);
    doc.setFont("helvetica", "normal");
    doc.text(pdfText(formatDateDisplay(p.sampleDate)), left + 18, y);
    y += 5;
  }
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

function beginPage(doc, report, settings) {
  let y = PDF_LAYOUT.margins.top;
  y = renderHeader(doc, settings, y);
  y = renderPatient(doc, report, y, settings);
  y = renderColHeads(doc, y);
  return y;
}

function drawPageNumbers(doc) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text(
      `Page ${i} of ${total}`,
      PDF_LAYOUT.pageWidth / 2,
      PDF_LAYOUT.pageHeight - 8,
      { align: "center" }
    );
  }
}

function renderCustomSections(doc, report, settings, y) {
  const sections = enabledCustomSections(settings);
  const pageBottom = PDF_LAYOUT.pageHeight - PDF_LAYOUT.margins.bottom - 8;
  sections.forEach((section, index) => {
    const tests = enabledTests(section);
    const needed = 10 + tests.length * PDF_LAYOUT.lineHeight;
    if (index === 0 || section.startOnNewPage || y + needed > pageBottom) {
      doc.addPage();
      y = beginPage(doc, report, settings);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(PDF_LAYOUT.fonts.heading);
    doc.setTextColor(20);
    doc.text(pdfText(section.title), PDF_LAYOUT.cols.label, y);
    doc.setDrawColor(40);
    doc.setLineWidth(0.3);
    doc.line(PDF_LAYOUT.cols.label, y + 1.5, PDF_LAYOUT.pageWidth - PDF_LAYOUT.margins.right, y + 1.5);
    y += 7;
    tests.forEach((item) => {
      if (y > pageBottom) {
        doc.addPage();
        y = beginPage(doc, report, settings);
      }
      const ev = evalField(report, settings, `custom:${item.id}`, `custom.${item.id}`);
      y = drawResultRow(doc, y, {
        label: item.label,
        value: ev.value,
        unit: item.unit || ev.unit,
        rangeText: ev.rangeText,
        outOfRange: ev.outOfRange
      });
    });
    y += 3;
  });

  const remarks = settings.features?.showRemarks ? displayValue(report.patient?.remarks) : "";
  if (remarks) {
    if (y > pageBottom - 12) {
      doc.addPage();
      y = beginPage(doc, report, settings);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(PDF_LAYOUT.fonts.body);
    doc.text("Remarks", PDF_LAYOUT.cols.label, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(pdfText(remarks), 160);
    doc.text(lines, PDF_LAYOUT.cols.label + 22, y);
  }
}

export function generateReportPDF(report, settings, JsPDF) {
  const doc = new JsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });
  if (typeof doc.setCharSpace === "function") doc.setCharSpace(0);

  let y = beginPage(doc, report, settings);
  renderLayout(doc, PAGE1_LAYOUT, report, settings, y);

  doc.addPage();
  y = beginPage(doc, report, settings);
  y = renderLayout(doc, PAGE2_LAYOUT, report, settings, y);

  const extras = enabledCustomSections(settings);
  const remarksOnly = settings.features?.showRemarks && displayValue(report.patient?.remarks);
  if (extras.length) {
    renderCustomSections(doc, report, settings, y);
  } else if (remarksOnly) {
    if (y > PDF_LAYOUT.pageHeight - 30) {
      doc.addPage();
      y = beginPage(doc, report, settings);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(PDF_LAYOUT.fonts.body);
    doc.text("Remarks", PDF_LAYOUT.cols.label, y + 4);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(pdfText(report.patient.remarks), 160);
    doc.text(lines, PDF_LAYOUT.cols.label + 22, y + 4);
  }

  drawPageNumbers(doc);
  return doc;
}

export async function downloadReportPDF(report, settings) {
  const JsPDF = await loadJsPDF();
  const doc = generateReportPDF(report, settings, JsPDF);
  if (doc.getNumberOfPages() < 2) {
    throw new Error("Unable to generate the PDF.");
  }
  doc.save(buildPdfFilename(report));
  return { pages: doc.getNumberOfPages(), filename: buildPdfFilename(report) };
}
