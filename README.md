# Laboratory Report Generator

A standalone browser app for laboratory staff: enter patient and test results, review a live A4 preview, and generate a **two-page A4 PDF**.

V1 also prints a **Reference Range** column. If a numeric result is **below or above** the configured range, that result is **bold** on the preview and in the PDF. The app does not diagnose, classify, or change the entered value.

Patient data stays in the browser. PDFs are generated locally.

## Run locally

Do not open `index.html` as a `file://` URL if the browser blocks ES modules.

```bash
python -m http.server 8000
```

Then open http://localhost:8000

If Python is unavailable:

```bash
npx --yes serve .
```

## Use

1. Enter the patient name and date (required).
2. Enter laboratory results. Blank tests are allowed and stay blank on the PDF.
3. Check the live preview. Out-of-range numbers appear bold; the range stays visible on the right.
4. Click **Generate PDF** or **Print Report**.

**Load demo** and **Load out-of-range demo** fill test data only. They are never used as silent defaults.

## Laboratory settings

Open **Settings** to edit:

- Doctor names and qualifications
- Laboratory name, title, address, phone, email, logo
- Per-test reference ranges (min, max, optional display text, male/female intervals)

Settings are stored in `localStorage` under `labReportSettings`.

A draft of the current report can be saved under `labReportDraft`. That is a local convenience, not a medical record.

## How PDF generation works

- The form writes a structured report object.
- The HTML preview and the PDF renderer both read that object plus settings.
- The PDF is drawn with jsPDF in millimetres onto two A4 portrait pages. It is not a screenshot of the UI.
- Filename pattern: `Laboratory_Report_<PatientName>_<YYYY-MM-DD>.pdf`

Out-of-range detection lives in `js/ranges.js` and is shared by the form, preview, and PDF.

## Change the report template

Edit:

- `templates/laboratory-report/template.js` — field order and labels
- `templates/laboratory-report/layout.js` — A4 margins and PDF columns
- `js/ranges.js` — default reference ranges

Keep PDF drawing in `js/pdf-generator.js`. Do not read HTML element IDs from the PDF renderer.

## Tests

```bash
npm test
```

Optional sample PDFs (requires `npm install`):

```bash
npm run pdf:sample
```

Files are written to `tests/output/` by `scripts/generate-sample-pdf.js`.

## Deploy on Render

The app is a static site.

1. Push this repository to GitHub.
2. Create a Render static site from the repo.
3. Use publish directory `.` (see `render.yaml`).
4. Confirm the production URL loads, settings persist in that browser, and **Generate PDF** works.

No backend, database, or API keys are required.

## Project structure

```text
index.html
css/
js/                  app, form, preview, pdf, ranges, validation, storage
templates/laboratory-report/
tests/
render.yaml
```

## Future architecture

V1 is frontend-only. A later patient database could sit behind FastAPI + PostgreSQL without changing the report object that the PDF renderer already consumes.

## Medical safety

- Blank results stay blank. The app never inserts `Negative`, `Nil`, or `0`.
- Bold means “outside the configured numeric interval”, not a diagnosis.
- Qualitative text such as `Nil` or `Non-Reactive` is not auto-bolded.
- Reference ranges are laboratory-configurable defaults, not medical advice.
