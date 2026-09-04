import { escapeHtml, getPath } from "./utils.js";
import { evaluateResult } from "./ranges.js";
import { enabledCustomSections, enabledTests } from "./catalog.js";
import { resolveKeyboard, keyboardAttributeString } from "./keyboard.js";
import {
  DATALISTS,
  FORM_SECTIONS,
  PAGE1_LAYOUT,
  PAGE2_LAYOUT
} from "../templates/laboratory-report/template.js";

function fieldId(path) {
  return `field-${path.replace(/\./g, "-")}`;
}

function rangeHint(rangeKey, sex, settings) {
  if (!rangeKey) return "";
  const evaluation = evaluateResult("", rangeKey, sex, settings.referenceRanges, settings.customSections);
  return evaluation.rangeText;
}

function oorClass(value, rangeKey, sex, settings) {
  if (!rangeKey) return "";
  const evaluation = evaluateResult(value, rangeKey, sex, settings.referenceRanges, settings.customSections);
  return evaluation.outOfRange ? "is-oor" : "";
}

function renderDatalists() {
  return Object.entries(DATALISTS)
    .map(([id, options]) => {
      const opts = options.map((opt) => `<option value="${escapeHtml(opt)}"></option>`).join("");
      return `<datalist id="${escapeHtml(id)}">${opts}</datalist>`;
    })
    .join("");
}

function renderInput(field, report, settings) {
  const sex = report.patient?.sex || "";
  const value = getPath(report, field.path);
  const id = fieldId(field.path);
  const required = field.required ? "required" : "";
  const list = field.list ? `list="${escapeHtml(field.list)}"` : "";
  const type = field.type === "date" ? "date" : "text";
  const inputMode = keyboardAttributeString(resolveKeyboard(field, settings));
  const cls = oorClass(value, field.rangeKey, sex, settings);
  const hint = field.hint || (field.unit ? field.unit : "");
  const range = rangeHint(field.rangeKey, sex, settings);
  const prefix = field.n ? `<span class="field-num">${escapeHtml(field.n)}</span>` : "";

  if (field.type === "select") {
    const options = (field.options || [])
      .map((opt) => {
        const label = opt === "" ? "Select" : opt;
        const selected = value === opt ? "selected" : "";
        return `<option value="${escapeHtml(opt)}" ${selected}>${escapeHtml(label)}</option>`;
      })
      .join("");
    return `
      <label class="field" for="${id}">
        <span class="field-label">${prefix}${escapeHtml(field.label)}</span>
        <select id="${id}" name="${escapeHtml(field.path)}" data-path="${escapeHtml(field.path)}">
          ${options}
        </select>
        ${field.hint ? `<span class="field-hint">${escapeHtml(field.hint)}</span>` : ""}
      </label>
    `;
  }

  return `
    <label class="field" for="${id}">
      <span class="field-label">${prefix}${escapeHtml(field.label)}</span>
      <span class="field-control">
        <input
          id="${id}"
          name="${escapeHtml(field.path)}"
          data-path="${escapeHtml(field.path)}"
          data-range-key="${escapeHtml(field.rangeKey || "")}"
          type="${type}"
          ${inputMode}
          ${list}
          ${required}
          class="${cls}"
          value="${escapeHtml(value)}"
          autocomplete="${escapeHtml(field.autocomplete || "off")}"
        />
        ${hint ? `<span class="field-unit">${escapeHtml(hint)}</span>` : ""}
      </span>
      ${range ? `<span class="field-range" title="Reference range">${escapeHtml(range)}</span>` : ""}
    </label>
  `;
}

function renderLayoutRow(row, report, settings) {
  if (row.kind === "heading") {
    return `<h3 class="subhead">${escapeHtml(row.label)}</h3>`;
  }

  if (row.kind === "field") {
    return renderInput({ ...row, type: row.type || "text" }, report, settings);
  }

  if (row.kind === "group" || row.kind === "differential" || row.kind === "cells") {
    const items = row.items
      .map((item) =>
        renderInput(
          {
            ...item,
            type: "text",
            unit: item.unit || (row.kind === "differential" ? "%" : row.unit || "")
          },
          report,
          settings
        )
      )
      .join("");
    const cls = row.kind === "differential" ? "cluster cluster-diff" : "cluster";
    return `
      <fieldset class="${cls}">
        <legend>${row.n ? escapeHtml(row.n) + " " : ""}${escapeHtml(row.label)}</legend>
        <div class="cluster-grid">${items}</div>
      </fieldset>
    `;
  }

  return "";
}

export function renderForm(root, report, settings) {
  const patient = FORM_SECTIONS[0];
  const rest = [
    { id: "hematology", title: "Hematology", layout: PAGE1_LAYOUT.slice(0, 4) },
    { id: "blood", title: "Blood Examination", layout: PAGE1_LAYOUT.slice(4, 7) },
    { id: "other", title: "Other Laboratory Tests", layout: PAGE1_LAYOUT.slice(7) },
    {
      id: "urine",
      title: "Urine Examination",
      layout: PAGE2_LAYOUT.filter((row) => !(row.kind === "heading" && row.level === 1))
    }
  ];

  const extras = extraPatientFields(settings);
  const patientFields = [...patient.fields, ...extras].map((field) => renderInput(field, report, settings)).join("");
  const sections = rest
    .map((section) => {
      const body = section.layout.map((row) => renderLayoutRow(row, report, settings)).join("");
      return `
        <details class="card" id="section-${section.id}" open>
          <summary>${escapeHtml(section.title)}</summary>
          <div class="card-body">${body}</div>
        </details>
      `;
    })
    .join("");

  root.innerHTML = `
    ${renderDatalists()}
    <details class="card" id="section-patient" open>
      <summary>Patient Information</summary>
      <div class="card-body patient-grid">${patientFields}</div>
    </details>
    ${sections}
    ${renderCustomSections(report, settings)}
    ${settings.features?.showRemarks ? renderRemarks(report) : ""}
  `;
}

function extraPatientFields(settings) {
  const features = settings.features || {};
  const extra = [];
  if (features.showOpdNo) extra.push({ path: "patient.opdNo", label: "OPD / Reg. No.", type: "text", keyboard: "full" });
  if (features.showReferringDoctor) extra.push({ path: "patient.referringDoctor", label: "Referring doctor", type: "text", keyboard: "letters" });
  if (features.showSampleDate) extra.push({ path: "patient.sampleDate", label: "Sample date", type: "date" });
  return extra;
}

function renderCustomSections(report, settings) {
  return enabledCustomSections(settings)
    .map((section) => {
      const tests = enabledTests(section)
        .map((item) =>
          renderInput(
            {
              path: `custom.${item.id}`,
              label: item.label,
              unit: item.unit,
              type: "text",
              rangeKey: `custom:${item.id}`
            },
            report,
            settings
          )
        )
        .join("");
      return `
        <details class="card" id="section-${escapeHtml(section.id)}" open>
          <summary>${escapeHtml(section.title)}</summary>
          <div class="card-body">${tests}</div>
        </details>
      `;
    })
    .join("");
}

function renderRemarks(report) {
  const value = escapeHtml(report.patient?.remarks || "");
  return `
    <details class="card" id="section-remarks" open>
      <summary>Remarks</summary>
      <div class="card-body">
        <label class="field" for="field-patient-remarks">
          <span class="field-label">Remarks</span>
          <textarea id="field-patient-remarks" data-path="patient.remarks" rows="3" inputmode="text" autocapitalize="sentences" spellcheck="true">${value}</textarea>
        </label>
      </div>
    </details>
  `;
}

export function syncFormValues(root, report, settings) {
  const sex = report.patient?.sex || "";
  const inputs = root.querySelectorAll("[data-path]");
  inputs.forEach((el) => {
    const path = el.getAttribute("data-path");
    const next = getPath(report, path);
    if (el.value !== next) el.value = next;
    const rangeKey = el.getAttribute("data-range-key");
    if (rangeKey) {
      el.classList.toggle("is-oor", Boolean(oorClass(next, rangeKey, sex, settings)));
    }
  });
  root.querySelectorAll(".field-range").forEach((el) => {
    const input = el.parentElement.querySelector("[data-range-key]");
    if (!input) return;
    const rangeKey = input.getAttribute("data-range-key");
    el.textContent = rangeHint(rangeKey, sex, settings);
  });
}

export function focusPatientName() {
  const el = document.getElementById("field-patient-name");
  if (el) el.focus();
}
