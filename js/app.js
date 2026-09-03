import { setPath, todayISO, deepClone } from "./utils.js";
import { evaluateResult, listConfigurableRanges } from "./ranges.js";
import { normalizeReport, reportHasUnsavedWork } from "./data-model.js";
import { validateReport } from "./validation.js";
import { saveDraft, loadDraft, clearDraft } from "./storage.js";
import { loadSettings, saveSettings, createDefaultSettings } from "./settings.js";
import { appState, setReport, setSettings, setStatus, resetReport, markClean } from "./state.js";
import { renderForm, syncFormValues, focusPatientName } from "./form.js";
import { renderPreview } from "./preview.js";
import { downloadReportPDF } from "./pdf-generator.js";
import { demoReport, outOfRangeDemoReport } from "./demo-data.js";

const formRoot = document.getElementById("form-root");
const previewRoot = document.getElementById("preview-root");
const statusEl = document.getElementById("status");
const settingsDialog = document.getElementById("settings-dialog");
const confirmDialog = document.getElementById("confirm-dialog");
const confirmMessage = document.getElementById("confirm-message");
const confirmTitle = document.getElementById("confirm-title");
const settingsForm = document.getElementById("settings-form");
const rangeRoot = document.getElementById("range-settings");

let statusTimer = null;
let formBound = false;

function showStatus(message) {
  setStatus(message);
  statusEl.textContent = message;
  statusEl.hidden = !message;
  clearTimeout(statusTimer);
  if (message) {
    statusTimer = setTimeout(() => {
      statusEl.hidden = true;
      statusEl.textContent = "";
    }, 2800);
  }
}

function refreshPreview() {
  renderPreview(previewRoot, appState.report, appState.settings);
}

function rebuildForm() {
  renderForm(formRoot, appState.report, appState.settings);
  bindForm();
}

function bindForm() {
  if (formBound) return;
  formBound = true;
  formRoot.addEventListener("submit", (event) => event.preventDefault());
  formRoot.addEventListener("input", onFormChange);
  formRoot.addEventListener("change", onFormChange);
}

function onFormChange(event) {
  const el = event.target;
  const path = el.getAttribute?.("data-path");
  if (!path) return;
  setPath(appState.report, path, el.value);
  appState.ui.dirty = true;
  const rangeKey = el.getAttribute("data-range-key");
  const sex = appState.report.patient?.sex || "";
  if (rangeKey) {
    const evaluation = evaluateResult(el.value, rangeKey, sex, appState.settings.referenceRanges);
    el.classList.toggle("is-oor", evaluation.outOfRange);
  }
  if (path === "patient.sex") {
    syncFormValues(formRoot, appState.report, appState.settings);
  }
  refreshPreview();
}

function confirmAction({ title, message, confirmLabel = "Confirm" }) {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    const okBtn = document.getElementById("confirm-ok");
    const cancelBtn = document.getElementById("confirm-cancel");
    okBtn.textContent = confirmLabel;
    const finish = (result) => {
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      confirmDialog.close();
      resolve(result);
    };
    const onOk = () => finish(true);
    const onCancel = () => finish(false);
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    confirmDialog.showModal();
  });
}

async function newReport() {
  if (reportHasUnsavedWork(appState.report)) {
    const ok = await confirmAction({
      title: "Start a new report?",
      message: "Entered patient and laboratory data will be cleared. Laboratory settings are kept.",
      confirmLabel: "New Report"
    });
    if (!ok) return;
  }
  resetReport();
  clearDraft();
  rebuildForm();
  refreshPreview();
  focusPatientName();
  showStatus("New report");
}

async function clearReport() {
  if (reportHasUnsavedWork(appState.report)) {
    const ok = await confirmAction({
      title: "Clear the current report?",
      message: "All entered results will be removed.",
      confirmLabel: "Clear"
    });
    if (!ok) return;
  }
  resetReport();
  rebuildForm();
  refreshPreview();
  focusPatientName();
  showStatus("Report cleared");
}

function saveCurrentDraft() {
  const ok = saveDraft(appState.report);
  markClean();
  showStatus(ok ? "Draft saved locally on this device." : "Unable to save draft on this device.");
}

async function generatePdf() {
  const result = validateReport(appState.report);
  if (!result.ok) {
    showStatus(result.errors[0].message);
    const first = document.getElementById(`field-${result.errors[0].field.replace(/\./g, "-")}`);
    if (first) first.focus();
    return;
  }
  try {
    await downloadReportPDF(appState.report, appState.settings);
    showStatus("PDF generated");
  } catch (error) {
    showStatus("Unable to generate the PDF. Please try again.");
  }
}

function printReport() {
  const result = validateReport(appState.report);
  if (!result.ok) {
    showStatus(result.errors[0].message);
    return;
  }
  window.print();
}

function fillRangeSettings(settings) {
  const rows = listConfigurableRanges()
    .map((item) => {
      const current = settings.referenceRanges[item.key] || item;
      const numeric = item.type !== "qualitative";
      const male = current.male || item.male || {};
      const female = current.female || item.female || {};
      const sexBlock = item.male || item.female
        ? `
          <label>Male min <input data-range="${item.key}" data-sex="male" data-prop="min" value="${male.min ?? ""}"></label>
          <label>Male max <input data-range="${item.key}" data-sex="male" data-prop="max" value="${male.max ?? ""}"></label>
          <label>Female min <input data-range="${item.key}" data-sex="female" data-prop="min" value="${female.min ?? ""}"></label>
          <label>Female max <input data-range="${item.key}" data-sex="female" data-prop="max" value="${female.max ?? ""}"></label>
        `
        : "";
      return `
        <div class="range-row">
          <div class="range-name">${item.label}</div>
          <label>Display
            <input data-range="${item.key}" data-prop="display" value="${current.display || ""}" placeholder="${numeric ? "e.g. 12.0 – 16.0" : "e.g. Nil"}">
          </label>
          ${
            numeric
              ? `
            <label>Min <input data-range="${item.key}" data-prop="min" value="${current.min ?? ""}"></label>
            <label>Max <input data-range="${item.key}" data-prop="max" value="${current.max ?? ""}"></label>
          `
              : `<div class="range-qual">Qualitative</div>`
          }
          ${sexBlock}
        </div>
      `;
    })
    .join("");
  rangeRoot.innerHTML = rows;
}

function fillSettingsForm(settings) {
  settingsForm.elements.laboratoryName.value = settings.laboratoryName || "";
  settingsForm.elements.reportTitle.value = settings.reportTitle || "";
  settingsForm.elements.address.value = settings.address || "";
  settingsForm.elements.phone.value = settings.phone || "";
  settingsForm.elements.email.value = settings.email || "";
  settingsForm.elements.doctor1Name.value = settings.doctor1?.name || "";
  settingsForm.elements.doctor1Qual.value = settings.doctor1?.qualification || "";
  settingsForm.elements.doctor2Name.value = settings.doctor2?.name || "";
  settingsForm.elements.doctor2Qual.value = settings.doctor2?.qualification || "";
  fillRangeSettings(settings);
}

function readRangeSettings(base) {
  const next = deepClone(base.referenceRanges);
  rangeRoot.querySelectorAll("[data-range]").forEach((input) => {
    const key = input.getAttribute("data-range");
    const prop = input.getAttribute("data-prop");
    const sex = input.getAttribute("data-sex");
    if (!next[key]) next[key] = {};
    const raw = input.value.trim();
    const numeric = prop === "min" || prop === "max";
    const value = numeric ? (raw === "" ? null : Number(raw)) : raw;
    if (sex) {
      next[key][sex] = { ...(next[key][sex] || {}), [prop]: value };
    } else {
      next[key][prop] = value;
    }
  });
  return next;
}

function openSettings() {
  fillSettingsForm(appState.settings);
  settingsDialog.showModal();
}

function onSaveSettings(event) {
  event.preventDefault();
  const next = {
    ...appState.settings,
    laboratoryName: settingsForm.elements.laboratoryName.value.trim(),
    reportTitle: settingsForm.elements.reportTitle.value.trim() || "LABORATORY REPORT",
    address: settingsForm.elements.address.value.trim(),
    phone: settingsForm.elements.phone.value.trim(),
    email: settingsForm.elements.email.value.trim(),
    doctor1: {
      name: settingsForm.elements.doctor1Name.value.trim(),
      qualification: settingsForm.elements.doctor1Qual.value.trim()
    },
    doctor2: {
      name: settingsForm.elements.doctor2Name.value.trim(),
      qualification: settingsForm.elements.doctor2Qual.value.trim()
    },
    logo: appState.settings.logo,
    referenceRanges: readRangeSettings(appState.settings)
  };
  const saved = saveSettings(next);
  setSettings(saved);
  rebuildForm();
  refreshPreview();
  settingsDialog.close();
  showStatus("Settings saved");
}

function onLogoChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    appState.settings.logo = reader.result;
  };
  reader.readAsDataURL(file);
}

function clearLogo() {
  appState.settings.logo = null;
  settingsForm.elements.logo.value = "";
}

function restoreDraftIfAny() {
  const draft = loadDraft();
  if (!draft?.report) return;
  setReport(normalizeReport(draft.report), { dirty: false });
  showStatus("Draft restored from this device.");
}

function loadDemo(kind) {
  const source = kind === "oor" ? outOfRangeDemoReport : demoReport;
  const next = normalizeReport(source);
  next.patient.date = todayISO();
  setReport(next);
  rebuildForm();
  refreshPreview();
  showStatus(kind === "oor" ? "Out-of-range demo loaded (test data only)." : "Demo data loaded (test data only).");
}

function bindChrome() {
  document.getElementById("btn-new").addEventListener("click", newReport);
  document.getElementById("btn-clear").addEventListener("click", clearReport);
  document.getElementById("btn-draft").addEventListener("click", saveCurrentDraft);
  document.getElementById("btn-print").addEventListener("click", printReport);
  document.getElementById("btn-pdf").addEventListener("click", generatePdf);
  document.getElementById("btn-settings").addEventListener("click", openSettings);
  document.getElementById("btn-settings-close").addEventListener("click", () => settingsDialog.close());
  document.getElementById("btn-reset-settings").addEventListener("click", () => {
    const fresh = createDefaultSettings();
    fresh.logo = null;
    fillSettingsForm(fresh);
    appState.settings.logo = null;
  });
  document.getElementById("btn-demo").addEventListener("click", () => loadDemo("normal"));
  document.getElementById("btn-demo-oor").addEventListener("click", () => loadDemo("oor"));
  settingsForm.addEventListener("submit", onSaveSettings);
  settingsForm.elements.logo.addEventListener("change", onLogoChange);
  document.getElementById("btn-clear-logo").addEventListener("click", clearLogo);
}

function init() {
  appState.settings = loadSettings();
  restoreDraftIfAny();
  rebuildForm();
  refreshPreview();
  bindChrome();
  focusPatientName();
}

init();
