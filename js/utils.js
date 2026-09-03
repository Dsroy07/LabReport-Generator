export function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateDisplay(iso) {
  if (!iso) return "";
  const m = String(iso).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]} / ${m[2]} / ${m[1]}`;
  const dmy = String(iso).trim().match(/^(\d{1,2})\D+(\d{1,2})\D+(\d{4})$/);
  if (dmy) {
    return `${dmy[1].padStart(2, "0")} / ${dmy[2].padStart(2, "0")} / ${dmy[3]}`;
  }
  return String(iso).trim();
}

export function isValidDateInput(value) {
  if (!value) return false;
  const m = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

export function isBlank(value) {
  return value == null || String(value).trim() === "";
}

export function trimValue(value) {
  if (value == null) return "";
  return String(value).trim();
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getPath(obj, path) {
  if (!obj || !path) return "";
  const parts = path.split(".");
  let cur = obj;
  for (const part of parts) {
    if (cur == null) return "";
    cur = cur[part];
  }
  return cur == null ? "" : cur;
}

export function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (cur[key] == null || typeof cur[key] !== "object") cur[key] = {};
    cur = cur[key];
  }
  cur[parts[parts.length - 1]] = value;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeFilename(name) {
  const cleaned = String(name || "Patient")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/_+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 80);
  return cleaned || "Patient";
}

export function hasMeaningfulData(report) {
  if (!report) return false;
  const stack = [report];
  while (stack.length) {
    const cur = stack.pop();
    if (cur && typeof cur === "object") {
      for (const value of Object.values(cur)) stack.push(value);
    } else if (!isBlank(cur)) {
      return true;
    }
  }
  return false;
}
