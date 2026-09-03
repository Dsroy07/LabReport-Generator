# Reference Analysis

The two photographed laboratory report pages were **not present** in this repository when V1 was implemented. This note records what was taken from `laboratory_report_generator_spec.md` and what remains uncertain.

## Page structure

- Page 1: doctor header, report title, patient line, blood/hematology and other tests
- Page 2: urine examination — physical, chemical, microscopic
- Page size: A4 portrait
- Standard V1 output: exactly two pages

## Header

Two doctor identities from the spec defaults:

- Dr. RAM JETHMALANI, M.S. (Ortho)
- Dr. (Mrs.) SWAPNA JETHMALANI, M.D. (Ob. & Gyn.)
- Centered title: LABORATORY REPORT

These are settings defaults, not hard-coded in the PDF drawing primitives.

## Patient line

Printed:

- Name
- Age
- Date as `DD / MM / YYYY`

Sex is collected on the form so reference ranges can be sex-specific. It is **not** printed on the PDF, because the spec said not to force Sex onto the report if the paper original omitted it.

## Field order (page 1)

Hb, W.B.C. Total, Differential Count (P L M B E), E.S.R., Blood Group, Rh Factor, Blood Sugar (Fasting / Post prandial / Random), Urine Sugar, Blood Urea, Bleeding Time, Clotting Time, RA Factor Test, Serum Uric Acid, Serum Creatinine, HIV Test, HBsAg Test.

Differential order follows spec sections 11 and 35 (`P L M B E`). Spec section 19 listed `P L M` then `B E` on a second line. If a later photograph shows a different order, change `PAGE1_LAYOUT` in `templates/laboratory-report/template.js`.

## Units

Taken from the spec. E.S.R. uses `mm/hr` in both the form and the PDF so the unit column stays compact. The longer phrase “mms. at the end of an hour” was not used, to avoid overlap.

## Uncertainties (not invented)

- Exact header typography, spacing, and whether a logo is present
- Whether the original paper already printed a reference-range column
- Exact differential letter order if the photograph disagrees with the spec
- Exact wording of E.S.R. unit
- Whether Sex appears on the paper report
- Precise margins and rule weights

Where the photograph is missing, the implementation uses a clean professional reconstruction of the spec’s structure rather than guessing photographic details (wrinkles, shadows, carpet, camera angle).

## V1 addition requested after the spec

Reference ranges are printed on the preview and PDF. Numeric results below the configured minimum or above the configured maximum are **bold**. That rule is implemented in `js/ranges.js` and applied by both the HTML preview and the PDF renderer.
