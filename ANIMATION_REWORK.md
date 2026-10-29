# PHASE animation rework ? 2026-10-29

Completed locally. Preview: http://127.0.0.1:4173/ (production), http://127.0.0.1:5173/ (dev).
No dependencies, remote media, font files or audio samples added. Site content,
navigation, brief, keyboard controls and single-context/single-voice audio retained.
No commit, push, remote changes or deployment.

## Before ? after

- **Hero:** tiny global oscillation ? thin sculptural Resonance Loop, 8 s travelling
  width/tension/roll wave plus 16 s secondary orientation. Surface changes in the
  first 2?3 s. Periodic seam, dynamic normals/tangents, satin chrome, broad silver
  panels, narrow accents and black reflection cards. Text composition retained.
- **FORM:** global shrink ? nine instanced metal rings with delayed depth impulses
  and local folds. Pixel outline across .2/.85/1.65/3.7 s was 405?407 px wide and
  287?297 px tall in a 534?380 canvas: no collapse into an empty frame.
- **AFTERIMAGE:** precomputed bands translating ? actual travelling 3D ribbon
  deformation. Two faint histories at ?.55/?1.1 s sample previous surface poses
  and previous smoothed energy; histories grow and fade, including the finite end.
- **ECHO:** static paths with blinking nodes ? travelling head/trail, timed arrival,
  node attack and release. Seven composed routes connect eight nodes. Shared
  synth/visual events avoid duplicated onset timing.
- **Approach:** repeated ring scaling ? continuous five-strip morph from separated
  Listen through open Shape to precise closed Refine. User selection remains authoritative.
- One 1.15 s hero entry, no repeated text reveal. Pointer stays secondary. Bass,
  mid and high have different bounded roles and attack/release. Silent previews
  are explicitly labeled and never manufacture audio energy.

## Architecture and limits

Hero keeps its R3F controller/renderer. FORM/AFTERIMAGE share one lazy Three pool
with a fixed framebuffer, copied into decorative 2D canvases so native dialog
presentation works. This is actual GPU-generated 3D, not an SVG substituting for
WebGL. Ten alternating panel selections created **two total native GL contexts**,
with no context growth. Pool belongs to the page; views own and release meshes,
geometry/materials. Final page owner and pagehide dispose GPU resources.

Studies/process share one ~30 Hz scheduler with timing remainder. No geometry,
material, large array or React state is rebuilt per animation frame. Offscreen,
background, behind-modal, motion-off and completed sequences stop updates. Mobile
uses fewer segments/ribbons and capped DPR. No full postprocessing chain.

Audio score events are shared. Playback uses AudioContext time, with independent
smoothed analyser bands. Real-time FORM and AFTERIMAGE panel tests measured clock
error 0 / 18.7 ms at the sampled instant. Natural end leaves visuals at rest and
never restarts silent preview. Stop, change study, mute, interruption and hidden
return preserve consent and one-voice rules. No microphone or auto-play.

## Actually verified

Windows 10 / Chrome 155, native WebGL2, ANGLE Intel UHD Graphics 620 / D3D11.
Hero reported material=shader, ready=true, non-lost context. This environment
successfully rendered real WebGL; fallback was tested separately, not graded as 3D.

- Visually inspected **1440?900, 1280?720, 390?844 and 320?568**; 768?1024 and
  640?360 reflow also covered by regression fixtures. Phone sizes are emulation.
- Multiple animation instants, live pointer/selection/replay and three local
  canvas WebM clips. Source clips decoded successfully with non-empty pixels.
- Motion off, reduced motion, silent selection, finite replay, three Approach
  states/rapid selection, menu/tabs/focus, panel scrolling, volume and stop.
- Actual shader compile error and context loss exposed SVG + diagnostics;
  HTML/audio remained usable. No-WebGL and unsupported/delayed audio paths passed.
- Real Clipboard write/read, denied/missing clipboard manual selection and brief
  generation passed at five widths. Targeted DOM contrast minima 8.11:1 page,
  7.25:1 form, minimum text 12 px. This is not a WCAG certification.
- Typecheck, production build, **52 unit tests / 11 files** passed. Tests cover
  periodic geometry/partials, amplitude bounds, delayed impulses/history, shared
  events, morph continuity, controller damping, resource ownership, audio and brief.
- Browser fixtures passed: scene, studies, audio, audio-edge, audio-endings,
  audio-load, audio-signal, phase5, phase5-access, phase5-performance, review;
  plus all six rework fixtures listed in README. Normal rework run: 0 page/console
  errors. Intentional shader/context errors are expected and not suppressed.
- All four real-time scores finished (4/8/9/12 s): 0 voices, 4 shared nodes,
  one AudioContext, zero energy. Fifteen Play/Stop cycles returned to the same state.
  OfflineAudioContext full/faded renders had finite samples, peak < .18 and zero tails.

## Measured workload

Local production preview, warmed samples, same Intel desktop GPU for both sizes.
No CPU/network throttling. Query times below exclude presentation/compositing.

| Measurement | 1440?900 DPR1 | 390?844 DPR3 emulation |
| --- | ---: | ---: |
| Hero warm RAF p50 / p95 | 16.6 / 17.0 ms | 16.6 / 17.0 ms |
| Hero GPU mesh draw p50 / p95 | 2.21 / 2.27 ms | 1.11 / 1.13 ms |
| Hero triangles / draw calls | 10,240 / 1 | 5,376 / 1 |
| AFTERIMAGE GPU draws sum p50 / p95 | 3.09 / 3.13 ms | 1.76 / 1.78 ms |

Study GPU sample measured AFTERIMAGE's one instanced surface + two history draws
summed per update (60 complete updates / 180 queries, disjoint=false). FORM did
not receive a separate GPU timer sample; its CPU submission was measured below.

FORM: 12,672 triangles / 1 draw desktop, 9,216 / 1 compact. AFTERIMAGE: 26,752 / 3,
13,312 / 3 compact. Separate warm study samples yielded ~30 updates/s; CPU render
submission + canvas-copy API p95 1.2 ms FORM and 1.4 ms AFTERIMAGE desktop, 1.2/1.3 ms
mobile emulation. These are CPU API wall times, not GPU time. Warm samples had
zero long tasks; page RAF p95 was 26 ms in that instrumented run. Do not combine
those RAF samples with the later hero sample to claim a universal frame rate.

Hero startup ready ~882 / 795 ms, longest startup long task 310 / 245 ms. New
material compilation on some panel switches still took ~57?63 ms in diagnostics.
Shader warm-up/startup and the shared Three chunk remain profiling candidates.
Hero modal/motion-off counters stayed unchanged; pool counters stabilized across
switch/resize cycles. Counters do not measure native GC or exact GPU memory.

Production bundle: main JS 274.37 kB / 86.04 gzip; Scene 184.54 / 59.19; shared
Three/environment 737.21 / 187.03; study renderer 9.40 / 3.90; CSS 27.85 / 6.24.
Vite large-chunk warning remains. No claim of confirmed 60 fps on physical phones.

## Local evidence

All paths relative to project root:

- Before: artifacts/qa/rework-before-hero-1440.png, rework-before-form.png,
  rework-before-approach.png.
- After: artifacts/qa/rework-final-hero-t1.png / -t3.png; rework-final-form-*.png;
  rework-final-afterimage-t1.png / -t3.png; rework-final-echo.png;
  rework-final-process-{listen,shape,refine}.png.
- Actual initialized 3D page captures: artifacts/qa/rework-live-page-{1440,1280,390,320}.png,
  plus rework-live-{hero,form,afterimage}-*.png. Earlier rework-final-page-* captures
  intentionally show reduced-motion rest and can include not-yet-initialized SVG.
- Clips: artifacts/qa/rework-clips/resonance-loop.webm, form-impulse.webm,
  afterimage-history.webm. Browser-native capture, no audio, no added FFmpeg/dependency.

## Remaining verification limits

Physical iPhone/Android GPU, Safari, screen reader, actual browser zoom/pinch,
real OS background/BFCache and subjective audio listening were not verified.
Visibility/BFCache/interruption events were simulated. SVG is a simplified
fallback, not visually equivalent to the 3D surface. System font differences
remain platform-dependent. Remote repo/live reference fetch failed; visual
judgment and fixes used the actual local build. Nothing was published.
