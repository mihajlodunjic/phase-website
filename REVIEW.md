# PHASE — local review, 29 October 2026

Reviewed against AGENTS.md and PHASE_PLAN.md. Changes stay local. No repository,
remote, commit, push, publishing or external service work was performed.

## Findings, evidence and fixes

| Priority | Confirmed problem before changes | Impact | Resolution |
| --- | --- | --- | --- |
| P2 | Enter on player **Sound off** moved focus from BUTTON to BODY; next Tab went to Skip to content. | Keyboard users lost their position when dismissing the player. | The player remembers the most recent stable control outside it, restores focus on dismissal and reveals it if needed. The focus listener is removed when the player closes. |
| P2 | Simulated Arial display fallback at 320×568: document scrollWidth 312 > clientWidth 305; FORM ended at x≈311.6 and AFTERIMAGE at x≈310.65. | Horizontal scroll and cropped headings when condensed system fonts are unavailable. | Reduced the narrow-screen FORM/AFTERIMAGE sizes and arrow gap. Afterward scrollWidth=clientWidth=305 in both native and Arial cases. No overflow hiding or font asset was added. |
| P3 | Playing ECHO panel displayed both **Playing ECHO.** and **Visual only**. | The visual/audio relationship was unclear. | The motif note now uses Visual preview / Following sound / Static visual, according to actual playback and motion state. |
| P3 | A delayed audio resume displayed **Enabling soundâ€¦**; the same corrupted punctuation existed in the study-start string. | Broken feedback during a pending browser audio start. | Correct Unicode ellipsis via source escape; browser verifies Enabling sound… and Starting FORM…. A unit test covers both pending states. |

Before evidence: `artifacts/qa/review-before-font-320.png`,
`review-before-playing-label.png`, `review-before-starting-text.png`.
Focus was recorded from actual document.activeElement, not inferred from CSS.

Changed implementation: `src/components/AudioControls.tsx`,
`src/components/StudyDialog.tsx`, `src/styles/studies.css`,
`src/audio/audioEngine.ts`, `src/audio/audioEngine.test.ts`.

## Verification after changes

- Typecheck, production build and **46 unit tests / 8 files passed**.
- New repeatable `qa/review-checks.js` passed: all four regressions, real DOM
  focus, correct subsequent Tab order, native/Arial display across 320×568,
  390×844, 768×1024, 1280×720 and 1440×900. Layout-only actions create zero
  AudioContexts. Returning focus does not click the button or restart sound.
- Passed again: `qa/phase5-checks.js`, `qa/phase5-access-checks.js`,
  `qa/studies-checks.js`, `qa/scene-checks.js`, `qa/audio-checks.js`,
  `qa/audio-edge-checks.js`, `qa/audio-endings-checks.js`, and
  `qa/phase5-performance-checks.js`.
- Brief generation/editing, actual clipboard read-back, denied/absent clipboard,
  no-WebGL brief, modal focus and menu/footer anchors passed. Reflow 640×360 and
  the targeted HTML contrast checks passed (page min ~8.11:1, form ~7.25:1).
- All study panels, finite visual replay, reduced motion, selection, shader /
  WebGL fallback and 10 resize resource cycles passed. Audio default off,
  one-context/one-voice switches, mute, Stop, canceled/rejected resume, simulated
  hidden/interrupted/BFCache and natural 4/8/9/12-second endings passed.
- Normal review/UI/audio paths: zero captured page/console errors. Deliberate
  WebGL failure produces its expected error. Existing Three/Fiber Clock and
  Vite large-chunk warnings remain.

Actual screenshots were inspected: charcoal/silver/acid palette, condensed
headline, dark loop cavity, readable text, three distinct study compositions,
mobile work flow and corrected playback note. The direction was preserved.
This is a visual review on the tested Windows backend, not a universal design
or accessibility certification.

After evidence: `review-after-{1440,390,320}.png`, `review-after-font-320.png`,
`review-after-playing-label.png`, `review-after-starting-text.png` in
`artifacts/qa/`. Browser scripts provide the corresponding assertions.

## Measured performance and remaining limits

Chrome 155 / Windows / ANGLE Intel UHD 620 / D3D11. Same existing scene and
quality settings. New browser contexts; process/shader caches can be warm.
30 warm-up RAFs, then 120 RAF intervals; separate 60-query GPU draw sample.

| Metric | 1440×900, DPR1 | 390×844 touch emulation, DPR3 |
| --- | ---: | ---: |
| Scene ready, approximate | 666 ms | 765 ms |
| Longest startup long task | 248 ms | 285 ms |
| Warm RAF p50 / p95 / max | 17.9 / 18.6 / 18.9 ms | 17.9 / 18.7 / 18.9 ms |
| Warm long tasks | 0 | 0 |
| GPU mesh draw p50 / p95 | 3.68 / 3.71 ms | 1.78 / 1.79 ms |
| Draw calls / triangles | 1 / 23,296 | 1 / 11,520 |

Timer queries completed with disjoint=false. GPU figures cover one mesh draw,
not JavaScript, compositing or presentation. Different RAF values from phase 5
are not attributed to these UI fixes: the renderer, geometry and shader were
not optimized in this review. A stable 60 fps target is still not confirmed.
The mobile emulation uses the same desktop GPU and a capped renderer DPR1.25.

Modal background frames stayed 262→262 / 269→269; Motion off stayed 268→268 /
276→276. Renderer resources remained 1 geometry / 2 textures / 1 program,
including resize checks. These counters do not measure total native/GPU memory.

The **922.11 kB / 245.65 kB gzip lazy scene** and startup long tasks remain an
open performance constraint. Main JS is ~271.44 kB / 84.97 kB gzip; CSS ~27.23 kB /
6.10 kB gzip. The warning was not hidden by cosmetic chunk splitting. No new
assets, packages, animation library or backend were introduced.

Not verified here: physical iPhone/Android, Safari, screen reader, actual browser
zoom/pinch, real OS tab/BFCache lifecycle, other installed system fonts or
subjective audio listening. Arial was a deliberate fallback simulation, not a
claim to have tested another operating system. Prior touch evidence remains in
QA.md; this review repeats mobile viewport and touch-emulated performance paths.
