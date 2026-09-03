import { escapeHtml, formatDateDisplay, getPath, isBlank } from "./utils.js";
import { evaluateResult } from "./ranges.js";
import { enabledCustomSections, enabledTests } from "./catalog.js";
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
  const evaluation = evaluateResult(value, rangeKey, sex, settings.referenceRanges, settings.customSections);
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

function doctorBlock(doc, align, showReg) {
  if (!doc) return "";
  const cls = align === "right" ? "doc doc-right" : "doc";
  const reg = showReg && displayValue(doc.registrationNo) ? `<div class="doc-reg">Reg. No. ${escapeHtml(doc.registrationNo)}</div>` : "";
  return `
    <div class="${cls}">
      ${doc.name ? `<div class="doc-name">${escapeHtml(doc.name)}</div>` : ""}
      ${doc.qualification ? `<div class="doc-qual">${escapeHtml(doc.qualification)}</div>` : ""}
      ${reg}
    </div>
  `;
}

function headerHtml(settings) {
  const d1 = settings.doctor1 || {};
  const d2 = settings.doctor2 || {};
  const features = settings.features || {};
  const lab = features.showHealthCenter ? displayValue(settings.laboratoryName) : "";
  const title = displayValue(settings.reportTitle) || "LABORATORY REPORT";
  const contact = [settings.address, settings.phone, settings.email].filter((v) => displayValue(v));
  const logo = settings.logo
    ? `<img class="lab-logo" src="${escapeHtml(settings.logo)}" alt="" />`
    : "";
  const showReg = Boolean(features.showDoctorRegNo);

  return `
    <header class="report-header">
      ${lab ? `<div class="lab-name health-center">${escapeHtml(lab)}</div>` : ""}
      ${contact.length ? `<div class="lab-contact">${contact.map(escapeHtml).join(" · ")}</div>` : ""}
      <div class="doctors">
        ${doctorBlock(d1, "left", showReg)}
        ${logo}
        ${doctorBlock(d2, "right", showReg)}
      </div>
      <div class="report-title">${escapeHtml(title)}</div>
    </header>
  `;
}

function patientHtml(report, settings) {
  const p = report.patient || {};
  const features = settings.features || {};
  const extra = [];
  if (features.showOpdNo && displayValue(p.opdNo)) extra.push(`<div><span class="k">OPD / Reg. No.</span> <span class="v">${escapeHtml(p.opdNo)}</span></div>`);
  if (features.showReferringDoctor && displayValue(p.referringDoctor)) extra.push(`<div><span class="k">Ref. by</span> <span class="v">${escapeHtml(p.referringDoctor)}</span></div>`);
  if (features.showSampleDate && displayValue(p.sampleDate)) extra.push(`<div><span class="k">Sample</span> <span class="v">${escapeHtml(formatDateDisplay(p.sampleDate))}</span></div>`);
  return `
    <section class="patient-line">
      <div class="p-name"><span class="k">Name</span> <span class="v">${escapeHtml(displayValue(p.name))}</span></div>
      <div class="p-age"><span class="k">Age</span> <span class="v">${escapeHtml(displayValue(p.age))}</span></div>
      <div class="p-date"><span class="k">Date</span> <span class="v">${escapeHtml(formatDateDisplay(p.date))}</span></div>
    </section>
    ${extra.length ? `<section class="patient-extra">${extra.join("")}</section>` : ""}
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

function customPagesHtml(report, settings) {
  const sections = enabledCustomSections(settings);
  if (!sections.length) return "";
  const pages = [];
  let current = [];
  let forceNew = true;
  sections.forEach((section, index) => {
    if (section.startOnNewPage || forceNew) {
      if (current.length) pages.push(current);
      current = [section];
      forceNew = false;
    } else {
      current.push(section);
    }
    if (index === sections.length - 1 && current.length) pages.push(current);
  });

  const remarks = settings.features?.showRemarks ? displayValue(report.patient?.remarks) : "";

  return pages
    .map((group, pageIndex) => {
      const body = group
        .map((section) => {
          const rows = enabledTests(section)
            .map((item) => {
              const ev = evalField(report, settings, `custom:${item.id}`, `custom.${item.id}`);
              return rowHtml({
                label: item.label,
                value: ev.value,
                unit: item.unit || ev.unit,
                rangeText: ev.rangeText,
                outOfRange: ev.outOfRange
              });
            })
            .join("");
          return `<h2 class="sec-title">${escapeHtml(section.title)}</h2>${rows}`;
        })
        .join("");
      const remarksHtml =
        pageIndex === pages.length - 1 && remarks
          ? `<div class="remarks-block"><span class="k">Remarks</span> ${escapeHtml(remarks)}</div>`
          : "";
      return `
        <article class="a4-page" data-page="${pageIndex + 3}" aria-label="Report page ${pageIndex + 3}">
          ${headerHtml(settings)}
          ${patientHtml(report, settings)}
          ${colHeads()}
          ${body}
          ${remarksHtml}
        </article>
      `;
    })
    .join("");
}

export function renderPreview(root, report, settings) {
  const extras = customPagesHtml(report, settings);
  const remarksOnPage2 =
    !enabledCustomSections(settings).length && settings.features?.showRemarks && displayValue(report.patient?.remarks)
      ? `<div class="remarks-block"><span class="k">Remarks</span> ${escapeHtml(displayValue(report.patient.remarks))}</div>`
      : "";
  root.innerHTML = `
    <article class="a4-page" data-page="1" aria-label="Report page 1">
      ${headerHtml(settings)}
      ${patientHtml(report, settings)}
      ${colHeads()}
      ${renderLayout(PAGE1_LAYOUT, report, settings)}
    </article>
    <article class="a4-page" data-page="2" aria-label="Report page 2">
      ${headerHtml(settings)}
      ${patientHtml(report, settings)}
      ${colHeads()}
      ${renderLayout(PAGE2_LAYOUT, report, settings)}
      ${remarksOnPage2}
    </article>
    ${extras}
  `;
}
