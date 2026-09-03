import { setPath, todayISO, deepClone, escapeHtml } from "./utils.js";
import { evaluateResult, listConfigurableRanges } from "./ranges.js";
import { normalizeReport, reportHasUnsavedWork } from "./data-model.js";
import { validateReport } from "./validation.js";
import { saveDraft, loadDraft, clearDraft } from "./storage.js";
import { loadSettings, saveSettings, createDefaultSettings } from "./settings.js";
import { createEmptySection, createEmptyTest, createPresetSection } from "./catalog.js";
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
const catalogRoot = document.getElementById("catalog-root");

let statusTimer = null;
let formBound = false;
let draftSettings = null;

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
    const evaluation = evaluateResult(
      el.value,
      rangeKey,
      sex,
      appState.settings.referenceRanges,
      appState.settings.customSections
    );
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
  settingsForm.elements.doctor1Reg.value = settings.doctor1?.registrationNo || "";
  settingsForm.elements.doctor2Name.value = settings.doctor2?.name || "";
  settingsForm.elements.doctor2Qual.value = settings.doctor2?.qualification || "";
  settingsForm.elements.doctor2Reg.value = settings.doctor2?.registrationNo || "";
  const features = settings.features || {};
  settingsForm.elements.showHealthCenter.checked = Boolean(features.showHealthCenter);
  settingsForm.elements.showDoctorRegNo.checked = Boolean(features.showDoctorRegNo);
  settingsForm.elements.showOpdNo.checked = Boolean(features.showOpdNo);
  settingsForm.elements.showReferringDoctor.checked = Boolean(features.showReferringDoctor);
  settingsForm.elements.showSampleDate.checked = Boolean(features.showSampleDate);
  settingsForm.elements.showRemarks.checked = Boolean(features.showRemarks);
  fillRangeSettings(settings);
  renderCatalog(settings);
}

function renderCatalog(settings) {
  const sections = settings.customSections || [];
  if (!sections.length) {
    catalogRoot.innerHTML = `<p class="help">No extra sections yet. Add a preset or an empty section. They stay off the main form until you check Show this section.</p>`;
    return;
  }
  catalogRoot.innerHTML = sections
    .map((section, si) => {
      const tests = (section.tests || [])
        .map((test, ti) => `
          <div class="catalog-test">
            <label>Test <input data-si="${si}" data-ti="${ti}" data-k="label" value="${escapeHtml(test.label || "")}"></label>
            <label>Unit <input data-si="${si}" data-ti="${ti}" data-k="unit" value="${escapeHtml(test.unit || "")}"></label>
            <label>Min <input data-si="${si}" data-ti="${ti}" data-k="min" value="${test.min ?? ""}"></label>
            <label>Max <input data-si="${si}" data-ti="${ti}" data-k="max" value="${test.max ?? ""}"></label>
            <label class="check"><input type="checkbox" data-si="${si}" data-ti="${ti}" data-k="enabled" ${test.enabled !== false ? "checked" : ""}> Show</label>
            <button type="button" class="btn" data-del-test="${si}:${ti}">Remove</button>
          </div>
        `)
        .join("");
      return `
        <section class="catalog-section">
          <div class="catalog-toolbar">
            <label>Section title <input data-si="${si}" data-k="title" value="${escapeHtml(section.title || "")}"></label>
            <label class="check"><input type="checkbox" data-si="${si}" data-k="enabled" ${section.enabled ? "checked" : ""}> Show this section on the report</label>
            <label class="check"><input type="checkbox" data-si="${si}" data-k="startOnNewPage" ${section.startOnNewPage !== false ? "checked" : ""}> Start on a new page</label>
          </div>
          ${tests}
          <div class="modal-actions">
            <button type="button" class="btn" data-add-test="${si}">Add test</button>
            <button type="button" class="btn" data-del-section="${si}">Delete section</button>
          </div>
        </section>
      `;
    })
    .join("");
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
  draftSettings = deepClone(appState.settings);
  fillSettingsForm(draftSettings);
  settingsDialog.showModal();
}

function onSaveSettings(event) {
  event.preventDefault();
  const next = {
    ...(draftSettings || appState.settings),
    laboratoryName: settingsForm.elements.laboratoryName.value.trim(),
    reportTitle: settingsForm.elements.reportTitle.value.trim() || "LABORATORY REPORT",
    address: settingsForm.elements.address.value.trim(),
    phone: settingsForm.elements.phone.value.trim(),
    email: settingsForm.elements.email.value.trim(),
    doctor1: {
      name: settingsForm.elements.doctor1Name.value.trim(),
      qualification: settingsForm.elements.doctor1Qual.value.trim(),
      registrationNo: settingsForm.elements.doctor1Reg.value.trim()
    },
    doctor2: {
      name: settingsForm.elements.doctor2Name.value.trim(),
      qualification: settingsForm.elements.doctor2Qual.value.trim(),
      registrationNo: settingsForm.elements.doctor2Reg.value.trim()
    },
    features: {
      showHealthCenter: settingsForm.elements.showHealthCenter.checked,
      showDoctorRegNo: settingsForm.elements.showDoctorRegNo.checked,
      showOpdNo: settingsForm.elements.showOpdNo.checked,
      showReferringDoctor: settingsForm.elements.showReferringDoctor.checked,
      showSampleDate: settingsForm.elements.showSampleDate.checked,
      showRemarks: settingsForm.elements.showRemarks.checked
    },
    logo: (draftSettings || appState.settings).logo ?? appState.settings.logo,
    referenceRanges: readRangeSettings(draftSettings || appState.settings),
    customSections: (draftSettings || appState.settings).customSections || []
  };
  const saved = saveSettings(next);
  setSettings(saved);
  rebuildForm();
  refreshPreview();
  settingsDialog.close();
  showStatus("Settings saved");
}

function bindCatalog() {
  catalogRoot.addEventListener("input", onCatalogField);
  catalogRoot.addEventListener("change", onCatalogField);
  catalogRoot.addEventListener("click", onCatalogClick);
  document.getElementById("btn-add-section").addEventListener("click", () => {
    if (!draftSettings) return;
    draftSettings.customSections = draftSettings.customSections || [];
    draftSettings.customSections.push(createEmptySection());
    renderCatalog(draftSettings);
  });
  document.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!draftSettings) return;
      draftSettings.customSections = draftSettings.customSections || [];
      draftSettings.customSections.push(createPresetSection(btn.getAttribute("data-preset")));
      renderCatalog(draftSettings);
    });
  });
}

function onCatalogField(event) {
  const el = event.target;
  if (!draftSettings || el.dataset.si == null) return;
  const si = Number(el.dataset.si);
  const key = el.dataset.k;
  const section = draftSettings.customSections[si];
  if (!section || !key) return;
  if (el.dataset.ti == null) {
    if (key === "enabled" || key === "startOnNewPage") section[key] = el.checked;
    else section[key] = el.value;
    return;
  }
  const test = section.tests[Number(el.dataset.ti)];
  if (!test) return;
  if (key === "enabled") test.enabled = el.checked;
  else if (key === "min" || key === "max") test[key] = el.value === "" ? null : Number(el.value);
  else test[key] = el.value;
}

function onCatalogClick(event) {
  const add = event.target.closest("[data-add-test]");
  const delTest = event.target.closest("[data-del-test]");
  const delSec = event.target.closest("[data-del-section]");
  if (!draftSettings) return;
  if (add) {
    const si = Number(add.getAttribute("data-add-test"));
    draftSettings.customSections[si].tests.push(createEmptyTest());
    renderCatalog(draftSettings);
  } else if (delTest) {
    const [si, ti] = delTest.getAttribute("data-del-test").split(":").map(Number);
    draftSettings.customSections[si].tests.splice(ti, 1);
    renderCatalog(draftSettings);
  } else if (delSec) {
    const si = Number(delSec.getAttribute("data-del-section"));
    draftSettings.customSections.splice(si, 1);
    renderCatalog(draftSettings);
  }
}

function onLogoChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    appState.settings.logo = reader.result;
    if (draftSettings) draftSettings.logo = reader.result;
  };
  reader.readAsDataURL(file);
}

function clearLogo() {
  appState.settings.logo = null;
  if (draftSettings) draftSettings.logo = null;
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
    draftSettings = fresh;
    fillSettingsForm(fresh);
  });
  document.getElementById("btn-demo").addEventListener("click", () => loadDemo("normal"));
  document.getElementById("btn-demo-oor").addEventListener("click", () => loadDemo("oor"));
  settingsForm.addEventListener("submit", onSaveSettings);
  settingsForm.elements.logo.addEventListener("change", onLogoChange);
  document.getElementById("btn-clear-logo").addEventListener("click", clearLogo);
  bindCatalog();
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
