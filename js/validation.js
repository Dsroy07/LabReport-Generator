import { isBlank, trimValue, isValidDateInput } from "./utils.js";
import { parseLabNumber } from "./ranges.js";

export function validateReport(report) {
  const errors = [];
  const name = trimValue(report?.patient?.name);
  const date = trimValue(report?.patient?.date);
  const age = trimValue(report?.patient?.age);

  if (isBlank(name)) {
    errors.push({ field: "patient.name", message: "Please enter the patient name before generating the report." });
  }

  if (isBlank(date)) {
    errors.push({ field: "patient.date", message: "Please enter the report date." });
  } else if (!isValidDateInput(date)) {
    errors.push({ field: "patient.date", message: "Please enter a valid report date." });
  }

  if (!isBlank(age)) {
    const parsed = parseLabNumber(age);
    if (parsed.kind === "number" && parsed.value < 0) {
      errors.push({ field: "patient.age", message: "Age must not be negative." });
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function fieldError(result, path) {
  return result.errors.find((item) => item.field === path) || null;
}
