# PHASE / local studio concept

Vite + React + TypeScript + Three.js / React Three Fiber. No external media,
font files, audio engine, backend or hosted services.

## Run

Node 24 or later. On Windows use `npm.cmd` if PowerShell blocks `npm.ps1`.

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run preview
```

## Art direction

The headline is a three-line block on the left; the sculpture occupies the
right half. On narrow screens they stack in reading order. Only VISIBLE. and
primary actions use the acid accent. The quiet statement provides a pause
before the studies. The studies currently have content, not players or panels.

```text
PHASE/            Work Approach Studio       Sound off   Start a project
-----------------------------------------------------------------------
SOUND,                              sculptural
MADE                                  silver
VISIBLE.                               loop
Short introduction.
Explore the studies
Independent sound studio                                Motion on / off
-----------------------------------------------------------------------
```

Colors follow the brief: charcoal `#101211`, deep `#080A09`, surface `#1B1E1B`,
foreground `#ECEDE6`, silver `#BAC2BC`, acid `#D8FF57`. System Impact is the
primary display face, Arial the body, Consolas only for process numbering.
No remote typeface is requested. Font appearance will depend on the OS.

The distinctive material is a twisted, nonplanar loop with flattened rounded
cross-sections and broad shallow folds. Satin metallic PBR shading
uses a small studio environment captured from code-generated light panels.
No bloom, glass, particle fog or stock TorusKnot. The first review is a static
pose with motion off; idle and pointer tilt are bounded by one controller.

## Implementation boundaries

- HTML contains all text, links and controls; Canvas is decorative.
- Scene code is lazy loaded after the HTML shell; an authored SVG is visible
  while loading and when WebGL fails or its context is lost.
- One demand-based Fiber loop. It rests when motion is off, reduced motion is
  requested, the canvas is offscreen or the document is hidden.
- Touch scroll is native. Pointer tilt is decorative and mouse/pen only.
- Geometry, procedural environment target, listeners and observers have cleanup.
- Sound off is an honest status, not an inactive audio button. No AudioContext.
- A native modal allows local brief generation and copy, with selectable text
  when clipboard permission is unavailable. There is no submission or network.
- Study visuals, panels and audio are later phases.

`?inspect=1` enables frame count, pose and renderer counters as data attributes
on `.phase-visual`, for verification without a second render loop. Normal
visits do not update diagnostic counters.

See `PHASE_PLAN.md` for the current checklist and `QA.md` for actual checks.

## PHASE Loop shader / phase 2

The loop uses flattened rounded sections, smooth welded normals/tangents, and
an anisotropic satin chrome material. `sceneController.ts` owns targets, time,
quaternion settling, scroll travel and both shader uniforms. The 18-second
cycle is shared by all idle channels. Total tilt is bounded near 7 degrees;
compact canvases use smaller motion and geometry budgets.

`shaders/brushedChrome.ts` extends the pinned Three r186 physical-material
chunks. GPU positions, normals and tangents are object-space; normals use the
analytic inverse-transpose deformation Jacobian, tangents its forward Jacobian.
Three's normalMatrix and color/tone-mapping path remain intact. There are no
shadows or mesh picking actions requiring matching depth/raycast deformation.

Uniforms: `uBreath` is bounded to ±0.009; `uTwist` to ±0.018. Their objects stay
stable for the surface lifetime. Program cache keys change with shader source,
not animation values. Shader compile failure selects an ordinary metallic
material; WebGL failure or context loss selects the authored SVG.

`qa/scene-checks.js` is an executable Playwright function for the browser tool.
With production preview on port 4173, execute it using the browser tool's
`filename` argument. It preserves static screenshot fixtures, checks resizing
and exercises both failure paths. It is separate from `npm test` and does not
add a Playwright package to the site. `?surface=standard` provides the ordinary
material fixture. Re-run these checks after any Three version change.
# phase-website

## Studies / phase 3

The work section uses three different compositions with one palette and a shared
satin-metal SVG gradient. FORM leads with a wide concentric sculpture; ECHO uses
points and short routes; AFTERIMAGE uses projected wave bands and trailing lines.
All paths are generated from local math. The hero remains the only WebGL renderer.

```text
FORM:       [ title + concept | dominant concentric form ]
ECHO:       [ signal paths   | title + concept           ]
AFTERIMAGE: [ title + concept | wide folded surface       ]
```

`src/sections/` owns the page sections. `StudyDialog` owns modal/tab semantics;
selection uses `StudyId`, with independent visuals and no audio side effects.
`visualScheduler.ts` shares one RAF request across eligible vector visuals;
`useVisualActivity` gates updates by viewport, document visibility and motion.
Panel sequences finish; replay starts them again and reveals the visual on mobile.
`ProcessVisual` damps a bounded target and rests when settled. HTML carries all
content and controls. Native modal focus is reinforced by `modalFocus.ts`.

Run `qa/studies-checks.js` using the browser tool's filename option while preview
is running on 4173. It covers study selection at desktop/mobile widths, reduced
motion, finite sequence/replay, focus restoration, anchors, an AudioContext guard
and no-WebGL operation. The prior `qa/scene-checks.js` remains valid for the hero.
Keyboard patterns follow the [WAI tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
and [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
