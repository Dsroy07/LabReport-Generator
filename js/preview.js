import { escapeHtml, formatDateDisplay, getPath, isBlank } from "./utils.js";
import { evaluateResult } from "./ranges.js";
import { PAGE1_LAYOUT, PAGE2_LAYOUT } from "../templates/laboratory-report/template.js";

function displayValue(value) {
  if (isBlank(value)) return "";
  const text = String(value).trim();
  if (text === "undefined" || text === "null" || text === "NaN") return "";
  return text;
}

function evalField(report, settings, rangeKey, path) {
  const value = displayValue(getPath(report, path));
  const sex = report.patient?.sex || "";
  const evaluation = evaluateResult(value, rangeKey, sex, settings.referenceRanges);
  return { value, ...evaluation };
}

function resultSpan(value, outOfRange) {
  if (!value) return `<span class="val"></span>`;
  return `<span class="val${outOfRange ? " oor" : ""}">${escapeHtml(value)}</span>`;
}

function rowHtml({ label, n, value, unit, rangeText, outOfRange }) {
  const name = `${n ? escapeHtml(n) + " " : ""}${escapeHtml(label)}`;
  return `
    <div class="result-row">
      <div class="lbl">${name}</div>
      <div class="res">
        ${resultSpan(value, outOfRange)}
        ${value && unit ? `<span class="unit">${escapeHtml(unit)}</span>` : ""}
      </div>
      <div class="rng">${escapeHtml(rangeText || "")}</div>
    </div>
  `;
}

function renderLayout(layout, report, settings) {
  return layout
    .map((row) => {
      if (row.kind === "heading") {
        return `<h2 class="sec-title level-${row.level || 1}">${escapeHtml(row.label)}</h2>`;
      }

      if (row.kind === "field") {
        const ev = evalField(report, settings, row.rangeKey, row.path);
        return rowHtml({
          label: row.label,
          n: row.n,
          value: ev.value,
          unit: row.pdfUnitNote || row.unit || ev.unit,
          rangeText: ev.rangeText,
          outOfRange: ev.outOfRange
        });
      }

      if (row.kind === "group") {
        const children = row.items
          .map((item) => {
            const ev = evalField(report, settings, item.rangeKey, item.path);
            return rowHtml({
              label: item.label,
              value: ev.value,
              unit: row.unit || ev.unit,
              rangeText: ev.rangeText,
              outOfRange: ev.outOfRange
            });
          })
          .join("");
        return `<div class="group"><h3 class="group-title">${escapeHtml(row.label)}</h3>${children}</div>`;
      }

      if (row.kind === "differential") {
        const cells = row.items
          .map((item) => {
            const ev = evalField(report, settings, item.rangeKey, item.path);
            return `
              <div class="diff-cell">
                <div class="diff-label">${escapeHtml(item.label)}</div>
                ${resultSpan(ev.value, ev.outOfRange)}
                <div class="rng">${escapeHtml(ev.rangeText)}</div>
              </div>
            `;
          })
          .join("");
        return `
          <div class="group">
            <h3 class="group-title">${escapeHtml(row.label)}</h3>
            <div class="diff-grid">${cells}</div>
          </div>
        `;
      }

      if (row.kind === "cells") {
        const children = row.items
          .map((item) => {
            const ev = evalField(report, settings, item.rangeKey, item.path);
            return rowHtml({
              label: item.label,
              value: ev.value,
              unit: item.unit || ev.unit,
              rangeText: ev.rangeText,
              outOfRange: ev.outOfRange
            });
          })
          .join("");
        return `<div class="group"><h3 class="group-title">${row.n ? escapeHtml(row.n) + " " : ""}${escapeHtml(row.label)}</h3>${children}</div>`;
      }

      return "";
    })
    .join("");
}

function headerHtml(settings) {
  const d1 = settings.doctor1 || {};
  const d2 = settings.doctor2 || {};
  const lab = displayValue(settings.laboratoryName);
  const title = displayValue(settings.reportTitle) || "LABORATORY REPORT";
  const contact = [settings.address, settings.phone, settings.email].filter((v) => displayValue(v));
  const logo = settings.logo
    ? `<img class="lab-logo" src="${escapeHtml(settings.logo)}" alt="" />`
    : "";

  return `
    <header class="report-header">
      <div class="doctors">
        <div class="doc">
          ${d1.name ? `<div class="doc-name">${escapeHtml(d1.name)}</div>` : ""}
          ${d1.qualification ? `<div class="doc-qual">${escapeHtml(d1.qualification)}</div>` : ""}
        </div>
        ${logo}
        <div class="doc doc-right">
          ${d2.name ? `<div class="doc-name">${escapeHtml(d2.name)}</div>` : ""}
          ${d2.qualification ? `<div class="doc-qual">${escapeHtml(d2.qualification)}</div>` : ""}
        </div>
      </div>
      ${lab ? `<div class="lab-name">${escapeHtml(lab)}</div>` : ""}
      <div class="report-title">${escapeHtml(title)}</div>
      ${contact.length ? `<div class="lab-contact">${contact.map(escapeHtml).join(" · ")}</div>` : ""}
    </header>
  `;
}

function patientHtml(report) {
  const p = report.patient || {};
  return `
    <section class="patient-line">
      <div class="p-name"><span class="k">Name</span> <span class="v">${escapeHtml(displayValue(p.name))}</span></div>
      <div class="p-age"><span class="k">Age</span> <span class="v">${escapeHtml(displayValue(p.age))}</span></div>
      <div class="p-date"><span class="k">Date</span> <span class="v">${escapeHtml(formatDateDisplay(p.date))}</span></div>
    </section>
  `;
}

function colHeads() {
  return `
    <div class="col-heads">
      <div>Investigation</div>
      <div>Result</div>
      <div>Reference Range</div>
    </div>
  `;
}

export function renderPreview(root, report, settings) {
  root.innerHTML = `
    <article class="a4-page" data-page="1" aria-label="Report page 1">
      ${headerHtml(settings)}
      ${patientHtml(report)}
      ${colHeads()}
      ${renderLayout(PAGE1_LAYOUT, report, settings)}
    </article>
    <article class="a4-page" data-page="2" aria-label="Report page 2">
      ${headerHtml(settings)}
      ${patientHtml(report)}
      ${colHeads()}
      ${renderLayout(PAGE2_LAYOUT, report, settings)}
    </article>
  `;
}
