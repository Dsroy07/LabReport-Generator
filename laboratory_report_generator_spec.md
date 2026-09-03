# Laboratory Report Generator — Complete Product & Development Specification

## 1. Project Overview

Build a standalone, browser-based **Laboratory Report Generator** that allows laboratory staff to enter patient and laboratory examination data through a simple web form and generate a professional **two-page A4 PDF laboratory report**.

The supplied reference images are the primary visual and structural references for Version 1.

### Primary workflow

```text
Open Application
      ↓
Create New Report
      ↓
Enter Patient Information
      ↓
Enter Laboratory Results
      ↓
Review Live Preview
      ↓
Generate A4 PDF
      ↓
Print / Save PDF
```

### Version 1 objective

The first release must focus on one thing and do it reliably:

> **Patient Entry → Laboratory Data Entry → Live Report Preview → Two-page A4 PDF**

Do not add unnecessary enterprise functionality in V1.

---

# 2. Reference Documents / Images

The project is based on two supplied photographs of a laboratory report.

The first reference page contains:

- Laboratory/doctor header
- Patient name
- Age
- Date
- Hb
- W.B.C. Total
- Differential Count
- E.S.R.
- Blood Group
- Rh Factor
- Blood Sugar
- Urine Sugar
- Blood Urea
- Bleeding Time
- Clotting Time
- RA Factor Test
- Serum Uric Acid
- Serum Creatinine
- HIV Test
- HBsAg Test

The second reference page contains:

- Urine Examination
  - Physical Examination
  - Chemical Examination
  - Microscopic Examination

---

# 3. Product Philosophy

The application should feel like a small professional laboratory utility, not a generic web form.

Priorities:

1. Extremely low learning curve
2. Fast data entry
3. Minimal mouse usage
4. Clear grouping of tests
5. No unnecessary screens
6. Reliable PDF output
7. Exact A4 page control
8. Clean architecture
9. Easy future expansion
10. Easy deployment on Render

The operator should be able to create a report quickly without needing technical knowledge.

---

# 4. Technology Requirements

## Frontend

Use:

- HTML5
- CSS3
- Modern JavaScript
- ES modules where appropriate

Prefer vanilla JavaScript unless a dependency provides a substantial benefit.

## PDF

Use a browser-compatible PDF solution such as:

- jsPDF

or another well-maintained client-side PDF library if testing shows it produces better results.

The PDF renderer must be independent from the form UI.

## Storage for V1

Use browser `localStorage` only for:

- Laboratory settings
- Doctor/header configuration
- UI preferences
- Optional temporary draft

Do not require a database for V1.

## Hosting

The application must be deployable to Render.

It should work as a static web application if possible.

---

# 5. Important Architecture Decision

Separate the application into three logical layers.

```text
┌──────────────────────────────┐
│         INPUT LAYER          │
│                              │
│ HTML Form                    │
│ Validation                   │
│ User Interaction             │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│        DATA MODEL            │
│                              │
│ Patient                      │
│ Laboratory Results           │
│ Report Configuration         │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│       OUTPUT LAYER           │
│                              │
│ Live Preview                 │
│ PDF Renderer                 │
│ Print                        │
└──────────────────────────────┘
```

Do not tightly couple HTML element IDs directly to PDF drawing logic.

The PDF renderer should receive a structured report object.

---

# 6. Suggested Project Structure

```text
lab-report-generator/
│
├── index.html
├── README.md
├── package.json
├── render.yaml
│
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── app.css
│   ├── form.css
│   └── preview.css
│
├── js/
│   ├── app.js
│   ├── state.js
│   ├── validation.js
│   ├── form.js
│   ├── preview.js
│   ├── pdf-generator.js
│   ├── storage.js
│   ├── settings.js
│   └── utils.js
│
├── templates/
│   └── laboratory-report/
│       ├── template.js
│       └── layout.js
│
├── assets/
│   ├── logo/
│   └── fonts/
│
└── tests/
    ├── validation.test.js
    ├── data-model.test.js
    └── pdf-layout.test.js
```

The exact structure may be simplified if unnecessary, but keep responsibilities separated.

---

# 7. Application Screens

V1 should have three primary views.

## 7.1 Report Entry

Main working screen.

Contains:

- Patient information
- Blood/hematology section
- Other laboratory tests
- Urine examination
- Action buttons

## 7.2 Live Preview

Display a visual representation of the final report.

Desktop layout:

```text
┌────────────────────────────────────────────────────────────┐
│                    LAB REPORT GENERATOR                    │
├────────────────────────────┬───────────────────────────────┤
│                            │                               │
│       DATA ENTRY           │         REPORT PREVIEW        │
│                            │                               │
│ Patient Information        │       A4 PAGE 1              │
│                            │                               │
│ Laboratory Results         │                               │
│                            │                               │
│ Urine Examination          │                               │
│                            │                               │
│                            │       A4 PAGE 2              │
│                            │                               │
├────────────────────────────┴───────────────────────────────┤
│ NEW REPORT | CLEAR | PRINT | GENERATE PDF                  │
└────────────────────────────────────────────────────────────┘
```

On smaller screens, preview can move below the form.

## 7.3 Settings

Allow configuration of fixed report information.

---

# 8. Patient Information

Create a clearly separated card.

Fields:

### Patient Name

Type:

```text
text
```

Required:

Yes.

### Age

Type:

```text
number
```

Allow:

- years
- optionally months for future extension

V1 can simply use a free numeric age field.

### Sex

Options:

```text
Male
Female
Other
```

If the original paper does not require a sex field, do not force it into the PDF. It may remain available internally or be omitted from V1 PDF.

### Report Date

Default to current date.

Allow manual editing.

Format displayed in PDF:

```text
DD / MM / YYYY
```

---

# 9. Laboratory Header Configuration

Do not hard-code the laboratory identity into the PDF generation logic.

Create a settings object.

Example:

```javascript
const laboratorySettings = {
    doctor1: {
        name: "Dr. RAM JETHMALANI",
        qualification: "M.S. (Ortho)"
    },

    doctor2: {
        name: "Dr. (Mrs.) SWAPNA JETHMALANI",
        qualification: "M.D. (Ob. & Gyn.)"
    },

    reportTitle: "LABORATORY REPORT"
};
```

The user must be able to change these values through Settings.

Possible fields:

- Doctor 1 name
- Doctor 1 qualification
- Doctor 2 name
- Doctor 2 qualification
- Laboratory name
- Report title
- Address
- Phone
- Email
- Logo

Only fields configured by the user should appear.

---

# 10. Complete V1 Laboratory Data Model

Use a structured object similar to:

```javascript
const report = {
    patient: {
        name: "",
        age: "",
        sex: "",
        date: ""
    },

    hematology: {
        hb: "",
        wbcTotal: "",

        differential: {
            p: "",
            l: "",
            m: "",
            e: "",
            b: ""
        },

        esr: ""
    },

    blood: {
        group: "",
        rhFactor: "",

        sugar: {
            fasting: "",
            postPrandial: "",
            random: ""
        }
    },

    otherTests: {
        urineSugar: "",
        bloodUrea: "",
        bleedingTime: "",
        clottingTime: "",
        raFactor: "",
        serumUricAcid: "",
        serumCreatinine: "",
        hiv: "",
        hbsag: ""
    },

    urine: {
        physical: {
            colour: "",
            acidity: "",
            specificGravity: ""
        },

        chemical: {
            albumin: "",
            sugar: "",
            bileSalts: "",
            bilePigments: "",
            ketoneBodies: ""
        },

        microscopic: {
            wbc: "",
            rbc: "",
            epithelialCells: "",
            casts: "",
            crystals: "",
            miscellaneous: "",
            parasites: ""
        }
    }
};
```

---

# 11. Complete Field Inventory

## 11.1 Hematology

### Hb

Label:

```text
Hb
```

Unit:

```text
gm%
```

Input:

Numeric/free text.

Do not automatically interpret the value.

---

### W.B.C. Total

Label:

```text
W.B.C. Total
```

Unit:

```text
Cells / cmm
```

---

### Differential Count

Fields:

```text
P
L
M
B
E
```

The order in the PDF should follow the supplied reference.

Display:

```text
P     L     M     B     E
```

or preserve the exact ordering determined during visual comparison with the reference.

---

### E.S.R.

Label:

```text
E.S.R.
```

Unit:

```text
mm/hr
```

The reference image indicates:

```text
mms. at the end of an hour
```

The UI may use the simpler `mm/hr` notation while the PDF should reproduce the desired report wording.

---

# 12. Blood Examination

## Blood Group

Allow common values:

```text
A+
A-
B+
B-
AB+
AB-
O+
O-
```

Also allow manual entry.

Do not force a restricted dropdown if the operator needs to enter unusual/custom notation.

---

## Rh Factor

Allow:

```text
Positive
Negative
+
-
```

or manual entry.

---

# 13. Blood Sugar

Create three separate inputs:

### Fasting

Unit:

```text
mg%
```

### Post Prandial

Unit:

```text
mg%
```

### Random

Unit:

```text
mg%
```

Do not automatically calculate or classify glucose.

---

# 14. Other Laboratory Tests

## Urine Sugar

Free text/numeric field.

Do not assume a unit.

---

## Blood Urea

Unit:

```text
mg%
```

---

## Bleeding Time

Unit:

```text
seconds
```

---

## Clotting Time

Unit:

```text
seconds
```

---

## RA Factor Test

Unit:

```text
mg%
```

The original report appears to show a unit field beside the test. Preserve the reference template and make the unit configurable if necessary.

---

## Serum Uric Acid

Unit:

```text
mg%
```

---

## Serum Creatinine

Unit:

```text
mg%
```

---

## HIV Test

Allow free-text result.

Examples:

```text
Negative
Positive
Non-Reactive
Reactive
```

Do not automatically interpret.

---

## HBsAg Test

Allow free-text result.

Examples:

```text
Negative
Positive
Non-Reactive
Reactive
```

Do not automatically interpret.

---

# 15. Urine Examination

The second PDF page must have a clear:

```text
URINE EXAMINATION
```

heading.

Divide it into three subsections.

---

# 16. Physical Examination

Fields:

### Colour

Examples:

```text
Pale Yellow
Yellow
Dark Yellow
Straw
```

Allow free text.

### Acidity

Free text or numeric.

Do not automatically calculate pH unless explicitly implemented later.

### Specific Gravity

Free text/numeric.

---

# 17. Chemical Examination

Fields:

### Albumin

Free text.

### Sugar

Free text.

### Bile Salts

Free text.

### Bile Pigments

Free text.

### Ketone Bodies

Free text.

---

# 18. Microscopic Examination

## Cells

Subsection:

```text
Cells -
```

Fields:

### W.B.C.

### R.B.C.

### Epithelial Cells

---

## Additional Microscopic Fields

### Casts

### Crystals

### Miscellaneous

### Parasites

All should support free-text results because microscopy reports may contain values such as:

```text
Nil
Few
Occasional
Present
2-3 / HPF
```

Do not force all microscopy fields to numeric-only inputs.

---

# 19. Input Design

The form should be visually clean and optimized for rapid entry.

Each section should be collapsible if this improves usability, but all sections should remain easy to access.

Example:

```text
PATIENT INFORMATION
────────────────────────────

Patient Name       [______________]

Age                [____]

Report Date        [__/__/____]


HEMATOLOGY
────────────────────────────

Hb                 [______] gm%

W.B.C. Total       [______] Cells/cmm

Differential Count

P [___]   L [___]   M [___]
B [___]   E [___]

E.S.R.              [____] mm/hr
```

---

# 20. Data Entry UX

The application must minimize operator effort.

## Keyboard-first workflow

Tab order should follow the natural report order.

Example:

```text
Patient Name
→ Age
→ Date
→ Hb
→ WBC
→ P
→ L
→ M
→ B
→ E
→ ESR
→ Blood Group
→ Rh Factor
→ Fasting
→ Post Prandial
→ Random
→ ...
```

Do not create confusing tab order.

---

# 21. Input Behavior

Numeric fields should accept:

- integers
- decimals where appropriate

Example:

```text
12.5
8,200
1.025
```

The UI may normalize commas where appropriate.

Free-text fields must allow:

```text
Nil
Negative
Positive
Few
Present
2-3 / HPF
```

---

# 22. Validation

Validation should be helpful, not obstructive.

Required fields:

- Patient Name
- Report Date

Potentially required depending on workflow:

- Age

Laboratory results should generally be optional because a report may legitimately contain a blank/not-performed test.

Do not prevent PDF generation merely because every laboratory field is not filled.

---

# 23. Validation Rules

Examples:

### Age

Must not be negative.

### Numeric laboratory fields

Reject clearly invalid characters when a field is explicitly numeric.

### Date

Must be a valid date.

### Patient name

Must not be empty.

Avoid aggressive validation that makes normal laboratory notation impossible.

---

# 24. New Report

The New Report action should:

1. Ask for confirmation if unsaved data exists.
2. Clear patient data.
3. Clear laboratory results.
4. Preserve laboratory configuration/settings.
5. Set report date to current date.
6. Return focus to Patient Name.

---

# 25. Clear

Clear should reset the current form.

If data exists, show a confirmation:

```text
Clear the current report?

All entered results will be removed.

[Cancel] [Clear]
```

---

# 26. Save Draft

V1 can implement this using localStorage.

Store:

```text
current report
timestamp
```

Do not imply that localStorage is permanent medical record storage.

Show:

```text
Draft saved locally on this device.
```

---

# 27. Privacy

This application deals with potentially sensitive patient information.

V1 should follow privacy-by-design principles.

Do not:

- send patient data to third-party APIs
- transmit reports to analytics services
- log patient data to console in production
- store patient data unnecessarily

The PDF should be generated locally in the browser.

If analytics are ever added, ensure no patient-identifying information is transmitted.

---

# 28. Live Preview

The preview should visually approximate the final PDF.

The preview should use an A4 page ratio.

Example:

```text
┌───────────────────────┐
│                       │
│     HEADER            │
│                       │
│ Patient information   │
│                       │
│ Blood investigations  │
│                       │
│ Other tests           │
│                       │
│                       │
└───────────────────────┘

       PAGE 1
```

Second page:

```text
┌───────────────────────┐
│                       │
│ URINE EXAMINATION     │
│                       │
│ Physical              │
│ Chemical              │
│ Microscopic           │
│                       │
└───────────────────────┘

       PAGE 2
```

---

# 29. PDF Requirements

The generated PDF must:

- be exactly A4
- use portrait orientation
- contain exactly two pages for the standard V1 template
- have predictable margins
- avoid clipping
- avoid overlapping text
- preserve section headings
- preserve units
- preserve the overall visual hierarchy of the reference
- render cleanly when printed

The PDF should not be a screenshot of the browser.

---

# 30. PDF Rendering Strategy

Create dedicated PDF functions.

Example:

```javascript
generateReportPDF(report, settings)
```

Internally:

```javascript
renderHeader()
renderPatientInformation()
renderHematology()
renderBloodTests()
renderOtherTests()
renderUrinePage()
renderFooter()
```

Use consistent coordinate/layout constants.

Example:

```javascript
const PAGE = {
    width: 210,
    height: 297,
    marginLeft: 18,
    marginRight: 18,
    top: 15,
    bottom: 15
};
```

Use millimeters or another consistent coordinate system.

Do not scatter random pixel coordinates throughout the code.

---

# 31. PDF Layout Constants

Create centralized configuration:

```javascript
const PDF_LAYOUT = {
    pageWidth: 210,
    pageHeight: 297,

    margins: {
        top: 15,
        right: 15,
        bottom: 15,
        left: 15
    },

    fonts: {
        heading: 13,
        section: 11,
        body: 9,
        small: 8
    },

    lineHeight: 5
};
```

The exact values should be tuned after visually comparing generated PDFs with the supplied reference.

---

# 32. Header

The PDF header should reproduce the structure of the reference.

Example:

```text
Dr. RAM JETHMALANI
M.S. (Ortho)

Dr. (Mrs.) SWAPNA JETHMALANI
M.D. (Ob. & Gyn.)
```

Then:

```text
LABORATORY REPORT
```

The exact final typography should be tuned based on the supplied reference images.

Do not assume the OCR/photo text is perfect; inspect the reference visually.

---

# 33. Patient Header

Include:

```text
Name ______________________     Age ______
Date ____ / ____ / ______
```

Use the entered data.

Do not print JavaScript field names.

---

# 34. Report Sections

The first page should retain the visual hierarchy of the reference:

```text
Hb

W.B.C. Total

Differential Count

E.S.R.

Blood Group

Rh Factor

Blood Sugar

Urine Sugar

Blood Urea

Bleeding Time

Clotting Time

RA Factor Test

Serum Uric Acid

Serum Creatinine

HIV Test

HBsAg Test
```

---

# 35. Differential Count PDF Layout

The differential count should visually resemble:

```text
Differential Count

P       L       M       B       E
__      __      __      __      __
```

or the exact arrangement determined from the supplied report.

---

# 36. Blood Sugar PDF Layout

Display:

```text
Blood Sugar

a) Fasting          __________

b) Post prandial    __________

c) Random           __________
```

Only populated values should be inserted.

---

# 37. Urine Examination PDF Page

The second page should use:

```text
URINE EXAMINATION
```

Then:

```text
PHYSICAL EXAMINATION
```

Then:

```text
1) Colour
2) Acidity
3) Specific gravity
```

Then:

```text
CHEMICAL EXAMINATION
```

Then:

```text
1) Albumin
2) Sugar
3) Bile Salts
4) Bile Pigments
5) Ketone Bodies
```

Then:

```text
MICROSCOPIC EXAMINATION
```

Then:

```text
1) Cells -
   W.B.C.
   R.B.C.
   Epithelial cells

2) Casts
3) Crystals
4) Miscellaneous
5) Parasites
```

The visual layout should follow the reference photograph rather than simply using a modern table.

---

# 38. Empty Values

Do not print:

```text
undefined
null
NaN
```

If a value is empty, the PDF should either:

- leave the result area blank, or
- use the exact configured blank representation.

Never automatically insert `Negative`, `Nil`, `0`, or any other medical result.

---

# 38A. Reference Ranges and Out-of-Range Emphasis (V1)

V1 **must** show configured reference ranges on the live preview and on the PDF, and **must** emphasize results that fall outside those ranges.

This is a reporting convention, not a diagnosis.

## Range column

Every numeric laboratory test that has a configured range must print a **Reference Range** value on the same row as the result.

Example:

```text
Hb                    10.2 gm%                 13.0 – 17.0
W.B.C. Total          7800 Cells / cmm         4000 – 11000
Blood Urea            28 mg%                   15 – 40
```

The range must appear even if the result is blank. Do not invent a result just because a range exists.

Qualitative tests (HIV, HBsAg, urine sugar, microscopy text, and similar) may show a typical reference such as `Nil` or `Non-Reactive`. That text is a configured normal finding, not an auto-filled result.

## Out-of-range emphasis

If an entered numeric result is **below the configured minimum** or **above the configured maximum**, the **result value** must be rendered **bold**.

Rules:

- In-range values use the normal body font weight.
- Out-of-range values use bold on the preview and in the PDF.
- Blank values are never bold.
- Non-numeric free text such as `Nil`, `Negative`, or `Present` is not compared numerically and is not auto-bolded.
- Do not change the entered digits.
- Do not replace the value with `High`, `Low`, `Abnormal`, or any other interpretive label.
- Do not use color as the only out-of-range signal. Bold is the required emphasis. Color may be used in the on-screen form as an extra cue, not as a substitute.

Examples:

```text
Hb 10.2 against 13.0 – 17.0     →  10.2 is bold (below range)
Hb 13.2 against 13.0 – 17.0     →  13.2 is not bold
WBC 15000 against 4000 – 11000  →  15000 is bold (above range)
Hb (empty)                      →  blank, not bold, range still printed
```

Microscopy spans such as `2-3 / HPF` may be compared using the numeric span when a numeric range exists (`8-10 / HPF` against `0 – 5` is out of range). If the text cannot be parsed as a number or numeric span, leave it unbolded.

## Sex-specific ranges

Where a test commonly has adult male and female intervals (Hb, E.S.R., serum uric acid, serum creatinine), use the patient's Sex field **internally** to choose the interval.

If Sex is empty or `Other`, use the generic adult interval.

Do not print Sex on the PDF unless the reference report itself includes it.

## Configuration

Reference ranges belong in laboratory settings, not in PDF drawing code.

They must be editable in Settings and stored in `localStorage` with the other laboratory configuration.

Default intervals are starting values for a general adult report. They are not immutable medical truth. The laboratory must be able to change them.

## Safety boundary

Showing a configured interval and bolding a number that sits outside it is allowed in V1.

The application still must not:

- diagnose disease
- classify the patient as diseased
- recommend treatment
- auto-insert missing results
- rewrite the operator's entered value

---

# 39. Medical Safety Principle

The application is a **data-entry and document-generation tool**.

It must not:

- diagnose disease
- classify patients
- recommend treatment
- automatically change results
- invent missing results
- convert a blank field into a medical conclusion

V1 may display configured reference ranges and bold out-of-range numeric results as specified in section 38A. That emphasis is not a diagnosis.

---

# 40. Formatting Rules

The PDF must use consistent:

- font family
- font sizes
- line spacing
- alignment
- margins
- section spacing

Numbers should remain exactly as entered unless normalization is explicitly intended.

Examples:

```text
12.5
8200
1.025
Negative
Nil
2-3 / HPF
```

should remain recognizable.

---

# 41. Print Support

Add:

```text
PRINT REPORT
```

Printing should preferably print the report preview/template rather than the entire application interface.

Use a dedicated print stylesheet.

Example:

```css
@media print {
    .app-sidebar,
    .controls,
    .form-panel {
        display: none;
    }

    .report-preview {
        display: block;
    }
}
```

Tune this carefully so page breaks remain correct.

---

# 42. PDF Filename

Generate a useful filename.

Example:

```text
Laboratory_Report_<PatientName>_<YYYY-MM-DD>.pdf
```

Sanitize the patient name.

Example:

```text
Laboratory_Report_Rahul_Sharma_2026-09-03.pdf
```

Avoid illegal filename characters.

---

# 43. Settings Storage

Use:

```javascript
localStorage
```

for laboratory configuration.

Example key:

```text
labReportSettings
```

Do not store the entire patient database in V1.

---

# 44. Draft Storage

Optional key:

```text
labReportDraft
```

Structure:

```javascript
{
    savedAt: "2026-09-03T15:30:00Z",
    report: {...}
}
```

---

# 45. Error Handling

The application should fail gracefully.

Examples:

If PDF library fails:

```text
Unable to generate the PDF.

Please try again.
```

If required patient data is missing:

```text
Please enter the patient name before generating the report.
```

Never expose raw JavaScript errors to the operator.

---

# 46. Accessibility

Use:

- proper `<label>` elements
- keyboard navigation
- visible focus states
- readable contrast
- semantic HTML
- accessible buttons
- appropriate `aria-label` only when necessary

Do not make the application dependent on color alone.

---

# 47. Responsive Design

Desktop is the primary target.

Recommended:

```text
Desktop:
Form + Preview side-by-side

Tablet:
Form above/beside preview depending on width

Mobile:
Form first
Preview below
```

The PDF itself remains A4 regardless of screen size.

---

# 48. UI Design Direction

Use a restrained professional interface.

Suggested:

```text
Background: light neutral
Cards: white
Borders: subtle
Typography: clean sans-serif
Buttons: clear hierarchy
```

Avoid:

- excessive gradients
- excessive animations
- oversized decorative elements
- unnecessary dashboard widgets

This is a working laboratory tool.

---

# 49. Main Navigation

Keep navigation minimal.

Possible:

```text
LAB REPORT GENERATOR

[New Report]
[Current Report]
[Settings]
```

No complex sidebar is required for V1.

---

# 50. Main Action Bar

Persistent action bar:

```text
[ New Report ] [ Save Draft ] [ Clear ]

                    [ Preview ] [ Generate PDF ]
```

Make Generate PDF visually prominent.

---

# 51. Status Messages

Use small non-intrusive messages:

```text
Draft saved
PDF generated
Settings saved
Report cleared
```

Avoid intrusive alerts for every action.

---

# 52. Test Data

Create a test/demo dataset solely for development.

Example:

```javascript
const demoReport = {
    patient: {
        name: "Test Patient",
        age: "35",
        sex: "Male",
        date: "2026-09-03"
    },

    hematology: {
        hb: "13.2",
        wbcTotal: "7800",

        differential: {
            p: "60",
            l: "32",
            m: "5",
            e: "2",
            b: "1"
        },

        esr: "12"
    },

    blood: {
        group: "B+",
        rhFactor: "Positive",

        sugar: {
            fasting: "92",
            postPrandial: "128",
            random: "105"
        }
    },

    otherTests: {
        urineSugar: "Nil",
        bloodUrea: "28",
        bleedingTime: "2 min",
        clottingTime: "5 min",
        raFactor: "Negative",
        serumUricAcid: "5.2",
        serumCreatinine: "0.9",
        hiv: "Non-Reactive",
        hbsag: "Non-Reactive"
    },

    urine: {
        physical: {
            colour: "Pale Yellow",
            acidity: "Acidic",
            specificGravity: "1.020"
        },

        chemical: {
            albumin: "Nil",
            sugar: "Nil",
            bileSalts: "Nil",
            bilePigments: "Nil",
            ketoneBodies: "Nil"
        },

        microscopic: {
            wbc: "2-3 / HPF",
            rbc: "Nil",
            epithelialCells: "Few",
            casts: "Nil",
            crystals: "Nil",
            miscellaneous: "Nil",
            parasites: "Nil"
        }
    }
};
```

This is test data only.

Clearly label it as demo/test data and never silently insert it into a real report.

---

# 53. Automated Tests

At minimum test:

## Data

- empty report
- fully populated report
- partial report

## Validation

- empty patient name
- invalid age
- invalid date
- valid numeric values
- valid free-text microscopy values

## PDF

Verify:

- PDF is generated
- PDF is exactly two pages
- no page overflow
- no undefined/null output
- patient name appears
- report date appears
- representative laboratory values appear
- page 2 contains urine examination
- filename is valid

---

# 54. PDF Visual QA

This is mandatory.

Do not consider PDF generation complete just because the PDF file opens.

Generate test PDFs and inspect them visually.

Check:

- header alignment
- patient information
- section spacing
- field labels
- result alignment
- units
- page margins
- page breaks
- page 2 layout
- clipping
- overlapping text
- excessive empty space
- print readability

---

# 55. Reference Image Matching

The supplied images are the visual reference.

The implementation should first reproduce the structure.

Do not blindly reproduce photographic imperfections such as:

- paper wrinkles
- shadows
- perspective distortion
- camera angle
- background carpet
- image noise

The final PDF should look like a **clean professionally printed version of the same report**, not a photograph.

---

# 56. Template System

Create a template abstraction.

Example:

```javascript
const reportTemplate = {
    id: "laboratory-standard-v1",
    name: "Laboratory Standard Report",
    pages: 2,
    pageSize: "A4",
    orientation: "portrait"
};
```

Future templates can be:

```text
laboratory-standard-v1
cbc-v1
urine-v1
lft-v1
kft-v1
```

Do not implement all of these in V1.

Only create the architecture needed to support them later.

---

# 57. Future Expansion Compatibility

The architecture should eventually support:

```text
Patient
   ↓
Report
   ↓
Test Results
   ↓
Template
   ↓
PDF
```

Potential future database:

```text
PostgreSQL
```

Potential future API:

```text
FastAPI
```

Potential future frontend:

```text
Current HTML/JS frontend
```

Do not implement the backend now unless required for deployment.

---

# 58. Future Version: Patient Database

Possible later functionality:

```text
Patient Search
Patient Profile
Previous Reports
Report History
Duplicate Previous Report
```

Potential schema:

```text
patients
reports
report_results
templates
users
laboratory_settings
```

This is future scope only.

---

# 59. Future Version: Authentication

Do not implement authentication in V1.

Later:

```text
Admin
Doctor
Lab Technician
Reception
```

with role-based access.

---

# 60. Future Version: Report Number

Future reports can have:

```text
Report No:
LAB-2026-000001
```

Do not implement a globally unique report number using only localStorage if multiple computers will eventually be used.

---

# 61. Future Version: Barcode / QR

Potential future QR code can encode a report identifier.

Do not put sensitive patient data directly into a public QR code unless explicitly designed and secured.

---

# 62. Reference Ranges — V1 vs later

V1 already includes:

- per-test reference ranges on the preview and PDF
- sex-specific adult intervals where configured
- bold emphasis for numeric results outside the configured min/max
- Settings so the laboratory can edit those intervals

Later versions may add:

- age-banded pediatric ranges
- multiple range sets per laboratory
- pregnancy-specific intervals
- method-specific intervals

Do not add diagnostic interpretation in those later versions either.

---

# 63. Future Version: Multi-Laboratory Support

Eventually settings can become:

```text
Laboratory
    ↓
Doctors
    ↓
Templates
    ↓
Reports
```

This should be considered when naming configuration variables.

---

# 64. Security Considerations

When deployed publicly:

- serve over HTTPS
- never expose API keys in frontend JavaScript
- never send patient data to third-party AI services
- avoid unnecessary external scripts
- use a Content Security Policy where practical
- sanitize filenames
- sanitize any HTML-generated report content
- keep dependencies updated

---

# 65. External Dependencies

Keep dependencies minimal.

Recommended:

```text
jsPDF
```

Potentially:

```text
DOMPurify
```

only if dynamic HTML rendering makes it necessary.

Do not add a large frontend framework unless there is a clear engineering reason.

---

# 66. Render Deployment

The project must include a Render-compatible deployment configuration.

If using a static site, configure Render to serve the application directory.

Possible `render.yaml` concept:

```yaml
services:
  - type: web
    name: lab-report-generator
    runtime: static
    buildCommand: ""
    staticPublishPath: .
```

The exact Render configuration should be validated against current Render deployment requirements during implementation.

---

# 67. GitHub Workflow

Recommended:

```text
Local Project
     ↓
Git
     ↓
GitHub Repository
     ↓
Render
     ↓
Production
```

Codex should keep the repository clean.

Use meaningful commits.

Example:

```text
feat: create report entry interface
feat: add laboratory data model
feat: add live report preview
feat: add A4 PDF renderer
test: add PDF layout validation
fix: prevent page overflow
docs: add Render deployment instructions
```

---

# 68. README Requirements

The repository README must explain:

1. What the application does
2. How to run locally
3. How to configure laboratory information
4. How PDF generation works
5. How to deploy to Render
6. How to change the report template
7. Project structure
8. Testing instructions
9. Future architecture

---

# 69. Local Development

The application should work locally.

Prefer serving it through a lightweight static server rather than requiring a complicated development environment.

Example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

If ES modules are used, do not rely on `file://` execution.

---

# 70. Browser Compatibility

Target current:

- Chrome
- Edge
- Firefox

Prioritize Chrome/Edge for laboratory desktop deployment if necessary.

---

# 71. No Backend Requirement in V1

Do NOT add:

- PostgreSQL
- MongoDB
- Firebase
- Supabase
- Redis
- authentication server
- REST API

unless a concrete V1 requirement emerges.

The application should be usable entirely in the browser.

---

# 72. Important Separation: Preview vs PDF

The preview and PDF should represent the same data but do not need to share the exact rendering implementation.

Recommended:

```text
Report Object
      │
      ├──────────────→ HTML Preview
      │
      └──────────────→ PDF Renderer
```

This prevents the PDF system from becoming dependent on browser CSS.

---

# 73. Report Data Normalization

Before rendering:

```javascript
const normalizedReport = normalizeReport(formData);
```

This should:

- trim unnecessary whitespace
- normalize empty values
- normalize date representation
- preserve clinically meaningful free text
- avoid changing the actual medical result

Example:

```javascript
normalizeValue("   Nil   ")
```

may return:

```text
"Nil"
```

but should not change:

```text
"2-3 / HPF"
```

into something else.

---

# 74. Form State

Maintain one central state object.

Avoid dozens of independent global variables.

Example:

```javascript
const appState = {
    report: createEmptyReport(),
    settings: loadSettings(),
    ui: {
        activeSection: "patient",
        previewVisible: true
    }
};
```

---

# 75. Empty Report Factory

Use a function:

```javascript
function createEmptyReport() {
    return {
        patient: {
            name: "",
            age: "",
            sex: "",
            date: today()
        },

        hematology: {
            hb: "",
            wbcTotal: "",
            differential: {
                p: "",
                l: "",
                m: "",
                b: "",
                e: ""
            },
            esr: ""
        },

        blood: {
            group: "",
            rhFactor: "",
            sugar: {
                fasting: "",
                postPrandial: "",
                random: ""
            }
        },

        otherTests: {
            urineSugar: "",
            bloodUrea: "",
            bleedingTime: "",
            clottingTime: "",
            raFactor: "",
            serumUricAcid: "",
            serumCreatinine: "",
            hiv: "",
            hbsag: ""
        },

        urine: {
            physical: {
                colour: "",
                acidity: "",
                specificGravity: ""
            },
            chemical: {
                albumin: "",
                sugar: "",
                bileSalts: "",
                bilePigments: "",
                ketoneBodies: ""
            },
            microscopic: {
                wbc: "",
                rbc: "",
                epithelialCells: "",
                casts: "",
                crystals: "",
                miscellaneous: "",
                parasites: ""
            }
        }
    };
}
```

---

# 76. Settings Factory

```javascript
function createDefaultSettings() {
    return {
        doctor1: {
            name: "Dr. RAM JETHMALANI",
            qualification: "M.S. (Ortho)"
        },

        doctor2: {
            name: "Dr. (Mrs.) SWAPNA JETHMALANI",
            qualification: "M.D. (Ob. & Gyn.)"
        },

        reportTitle: "LABORATORY REPORT",

        logo: null
    };
}
```

The values should be treated as defaults based on the supplied reference, not as immutable application constants.

---

# 77. User Interface Components

Use reusable components/functions for:

```text
Section Card
Field
Numeric Field
Text Field
Select Field
Action Button
Status Message
Preview Page
Settings Panel
```

Do not duplicate large chunks of markup unnecessarily.

---

# 78. Design for Future Test Templates

A future test definition could look like:

```javascript
{
    id: "hb",
    label: "Hb",
    type: "numeric",
    unit: "gm%",
    section: "hematology"
}
```

Another:

```javascript
{
    id: "urineMicroscopyWbc",
    label: "W.B.C.",
    type: "text",
    unit: "",
    section: "microscopic"
}
```

V1 can hard-code the template where simpler, but keep the data model capable of evolving toward a test-definition system.

---

# 79. Do Not Over-Engineer

Avoid building a full Laboratory Information Management System in V1.

The target is:

```text
Small
Fast
Reliable
Standalone
Printable
```

The first milestone is not a database.

The first milestone is a **perfect report generator**.

---

# 80. Definition of Done — V1

The project is complete only when all of the following work:

### Application

- [ ] Application opens correctly
- [ ] Form loads without errors
- [ ] Patient fields work
- [ ] All V1 laboratory fields are present
- [ ] Sections are clearly organized
- [ ] Keyboard navigation works
- [ ] Validation works
- [ ] New Report works
- [ ] Clear works
- [ ] Save Draft works
- [ ] Settings work

### Preview

- [ ] Preview updates from entered data
- [ ] Preview shows page 1
- [ ] Preview shows page 2
- [ ] Empty values do not produce garbage text
- [ ] Long patient names are handled
- [ ] Long microscopy results do not break the layout

### PDF

- [ ] PDF generates successfully
- [ ] PDF is A4
- [ ] PDF is portrait
- [ ] PDF is exactly two pages
- [ ] Header is correctly positioned
- [ ] Patient data appears correctly
- [ ] All laboratory sections appear
- [ ] Units appear correctly
- [ ] Reference ranges appear for tests that have them
- [ ] Out-of-range numeric results are bold
- [ ] In-range and blank results are not bold
- [ ] Entered values are never rewritten into High/Low/Abnormal
- [ ] Urine examination appears on page 2
- [ ] No clipping
- [ ] No overlapping text
- [ ] No page 3
- [ ] Filename is correct

### Deployment

- [ ] GitHub repository works
- [ ] Render deployment works
- [ ] Production URL loads
- [ ] PDF generation works on production
- [ ] No development-only paths are required

---

# 81. Development Sequence

Codex should work in this order.

## Phase 1 — Analyze Reference

Before coding:

1. Inspect both reference images.
2. Identify every field.
3. Identify exact section order.
4. Identify approximate typography.
5. Identify page structure.
6. Identify margins.
7. Identify header structure.
8. Identify units.
9. Identify page break.
10. Record uncertainties instead of inventing information.

Create:

```text
REFERENCE_ANALYSIS.md
```

---

# 82. Phase 2 — Data Model

Implement:

- empty report factory
- settings factory
- normalization
- serialization/deserialization

Test independently.

---

# 83. Phase 3 — Form

Build:

- patient information
- hematology
- blood
- other tests
- urine examination

Do not build PDF yet.

Ensure all form fields map cleanly to the data model.

---

# 84. Phase 4 — UI Polish

Add:

- responsive layout
- keyboard navigation
- validation
- status messages
- clear/new report
- local draft
- settings

---

# 85. Phase 5 — Preview

Build an A4 HTML preview.

The preview should be visually close to the final PDF.

Test with:

- empty data
- short data
- complete data
- long text

---

# 86. Phase 6 — PDF

Implement dedicated PDF rendering.

Start with:

```text
Page 1
```

Then:

```text
Page 2
```

Then integrate both.

---

# 87. Phase 7 — PDF QA

Generate multiple PDFs.

Test:

```text
Empty report
Minimal report
Fully populated report
Long patient name
Long microscopy text
Decimal values
Text values
```

Inspect all PDFs.

---

# 88. Phase 8 — Deployment

Deploy to Render.

Test production from a clean browser session.

Verify:

- assets load
- PDF library loads
- PDF generates
- settings persist
- no console errors
- no broken paths

---

# 89. Phase 9 — Final Cleanup

Before declaring completion:

- remove debugging code
- remove unnecessary dependencies
- remove unused CSS
- remove unused JavaScript
- update README
- update deployment instructions
- ensure no patient test data remains as a default
- ensure no API keys exist
- ensure production console is clean

---

# 90. Codex Operating Instructions

When working on this repository:

1. Inspect the existing code before changing it.
2. Do not rewrite working components unnecessarily.
3. Make small logical changes.
4. Run tests after significant changes.
5. Generate an actual PDF after PDF-related changes.
6. Inspect PDF page count and layout.
7. Keep the project runnable after each major phase.
8. Do not add dependencies without justification.
9. Do not add backend infrastructure without a concrete requirement.
10. Do not invent medical logic.
11. Do not invent missing information from the reference.
12. Preserve the reference report's overall structure.
13. Keep configuration separate from patient data.
14. Keep PDF rendering separate from the form UI.
15. Document important architectural decisions.

---

# 91. Codex Completion Report

When implementation is complete, Codex must provide a final report containing:

```text
PROJECT STATUS
--------------
Implemented:
- ...
- ...

Files created:
- ...

Files changed:
- ...

Dependencies:
- ...

Tests:
- ...

PDF QA:
- Page count:
- A4:
- Overflow:
- Clipping:
- Preview:
- Print:

Deployment:
- Render configuration:
- Build method:

Known limitations:
- ...

Recommended next steps:
- ...
```

---

# 92. Future V2 Roadmap

After V1 is stable:

## V2A — Better Reporting

- report number
- print optimization
- logo support
- customizable footer
- additional templates
- duplicate report

## V2B — Local Patient Records

- patient database
- search
- previous reports
- report history

## V2C — Backend

Potential architecture:

```text
Frontend
   ↓
FastAPI
   ↓
PostgreSQL
```

## V2D — User Management

- Admin
- Doctor
- Technician
- Reception

## V2E — Laboratory Workflow

- Test catalog
- Sample collection
- Pending tests
- Completed tests
- Verification
- Finalization
- Report release

These are future phases.

---

# 93. Future Enterprise Architecture

Eventually the system can evolve into:

```text
                    ┌─────────────────┐
                    │   Web Frontend  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    FastAPI      │
                    │      API        │
                    └────────┬────────┘
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
       ┌──────────┐   ┌────────────┐   ┌─────────────┐
       │ Patients │   │  Reports   │   │  Templates  │
       └──────────┘   └────────────┘   └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ PostgreSQL  │
                      └─────────────┘
```

The V1 frontend should not depend on this architecture, but should be compatible with it later.

---

# 94. Final Product Principle

The most important requirement is:

> **The operator should spend their time entering laboratory results, not fighting the software.**

The application should therefore prioritize:

```text
Fast Entry
     +
Clear Organization
     +
Reliable PDF
     +
Simple Deployment
```

over unnecessary complexity.

---

# 95. Final Codex Prompt

Use the following as the primary instruction when giving this specification to Codex:

> Read this entire specification before writing code.
>
> Build the Laboratory Report Generator according to this document and the supplied laboratory report reference images.
>
> Start by analyzing the reference images and create `REFERENCE_ANALYSIS.md`.
>
> Then implement the project incrementally:
>
> 1. Data model
> 2. Form
> 3. Validation
> 4. Settings
> 5. Local draft storage
> 6. Live A4 preview
> 7. Dedicated two-page A4 PDF renderer
> 8. Testing
> 9. PDF visual QA
> 10. Render deployment configuration
>
> Do not skip PDF visual QA.
>
> The final PDF must be a clean, professional recreation of the supplied two-page laboratory report structure, not a screenshot of the browser UI.
>
> Keep V1 frontend-first and backend-free.
>
> Do not add medical interpretation, diagnosis, treatment recommendations, or invented laboratory results.
>
> Do not add authentication, database infrastructure, billing, patient history, or other enterprise functionality unless explicitly requested.
>
> Use the reference images as the source of truth for layout and field inventory.
>
> Where the photograph is ambiguous, preserve the uncertainty in documentation and choose the least-assumptive implementation rather than inventing information.
>
> Before declaring the project complete:
>
> - run the application
> - enter the complete demo dataset
> - generate the PDF
> - verify it is exactly two A4 pages
> - inspect both pages
> - test long and short values
> - test blank values
> - test print behavior
> - fix all clipping, overlap, overflow, and page-break issues
> - verify Render deployment
>
> Do not say the project is complete until the actual generated PDF has been tested.

---

# 96. Immediate Goal

The immediate target is:

```text
┌───────────────────────────────────────────────┐
│             LAB REPORT GENERATOR              │
├───────────────────────────────────────────────┤
│                                               │
│  ENTER DATA                                   │
│                                               │
│  Patient                                      │
│  Hematology                                   │
│  Blood                                        │
│  Other Tests                                  │
│  Urine Examination                            │
│                                               │
│                    ↓                          │
│                                               │
│              LIVE A4 PREVIEW                  │
│                                               │
│                    ↓                          │
│                                               │
│             GENERATE 2-PAGE PDF               │
│                                               │
└───────────────────────────────────────────────┘
```

**Build this first. Everything else comes later.**
