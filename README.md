# PHASE / local studio concept

Vite + React + TypeScript + Three.js / React Three Fiber, with procedural Web
Audio. No external media, font files, microphone, backend or hosted services.

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

Development preview: `http://127.0.0.1:5173/`. Production preview defaults to
`http://127.0.0.1:4173/`. Everything stays local.

## Art direction

The headline is a three-line block on the left; the sculpture occupies the
right half. On narrow screens they stack in reading order. The quiet statement
provides a pause before the studies. FORM is a dominant concentric form; ECHO
uses points and routes; AFTERIMAGE uses projected wave bands and trailing lines.
The three compositions share a satin-metal SVG gradient and system typography.

Colors follow the brief: charcoal `#101211`, deep `#080A09`, surface `#1B1E1B`,
foreground `#ECEDE6`, silver `#BAC2BC`, acid `#D8FF57`. System Impact is the
primary display face, Arial the body, Consolas only for process numbering.
No remote typeface is requested. Font appearance depends on the OS.

The main visual is a twisted, nonplanar loop with flattened rounded sections,
broad shallow folds, welded normals/tangents and anisotropic satin chrome.
Its environment is captured from code-generated light panels. No bloom, glass,
particle fog, stock TorusKnot, texture files or HDRI.

## Visual architecture

- HTML contains all text, navigation, buttons, tabs and status; Canvas is decorative.
- One lazy, demand-based Fiber renderer. An authored SVG remains visible while
  loading and when WebGL fails or its context is lost.
- `sceneController.ts` owns time, pointer, scroll and audio targets, quaternion
  settling and uniform damping. The 18-second idle cycle has a total tilt budget
  near 7 degrees. Compact canvases use smaller motion and geometry budgets.
- Shader breath/twist idle limits are ±0.009 / ±0.018; audio extends their total
  limits to ±0.021 / ±0.04. The high band can add at most 12% reflection strength.
  Phone audio contributions are scaled by 0.55. Motion off resets all channels.
- `shaders/brushedChrome.ts` extends the pinned Three r186 physical chunks.
  Normals use the analytic inverse-transpose deformation Jacobian, tangents its
  forward Jacobian; Three's normalMatrix and color/tone mapping remain intact.
- Shader failure selects an ordinary metallic material; WebGL failure selects
  the SVG. `?surface=standard` exposes the material fallback fixture.
- `visualScheduler.ts` shares one RAF request for eligible vector motifs, capped
  at 30 updates/s. Offscreen, hidden and paused motifs unsubscribe. Panel visual
  sequences finish; Replay motion explicitly restarts them while audio is off.
- Native scrolling and zoom remain available. Decorative pointer tilt is mouse/
  pen only. Geometry, materials, environment targets and listeners have owners
  and cleanup. The hero remains the only WebGL renderer.

## Audio / phase 4

The page starts **Sound off**, volume 20%, with zero AudioContexts. Only **Hear
PHASE**, **Play study**, **Play again**, or **Enable sound** can create/resume the
single context. Enable sound only readies the controls; it does not play a voice.
Visual selection, scrolling, motion replay and closing/opening panels never
start sound. Selecting a different study stops the previous study.

The original synth scores are short and finite:

| Study | Duration | Character |
| --- | --- | --- |
| PHASE | 4 s | A compact C–G–C modal signature and low tonal release. |
| FORM | 8 s | The signature extended by a low pulse and resolving upper tones. |
| ECHO | 9 s | Eight gliding tonal signals with filtered procedural noise ticks. |
| AFTERIMAGE | 12 s | Detuned low oscillators, filtered noise and a quiet feedback delay. |

`audioEngine.ts` owns consent, the context, one voice, serialized fade/disposal,
resume cancellation, analyser sampling and lifecycle. Switching releases the
old voice with a 45 ms gain fade **before** constructing the next. Volume uses
30 ms ramps. Voice envelopes, fixed headroom and a compressor control the output.
A silent audio-time completion source includes the final tail, updates finished
state, disconnects the voice and suspends the context. AFTERIMAGE's generated
noise buffer repeats internally only until its scheduled stop; no study loops.

`studies.ts` contains the scores; `synth.ts` constructs owned oscillators,
procedural noise buffers and effects; `audioGraph.ts` owns shared routing.
`AudioProvider` exposes snapshots only for discrete UI state. Meter callbacks
mutate refs/data at up to 30 Hz rather than rendering React every frame.

The analyser reads **post-volume, post-compressor output**. True waveform RMS
and FFT low/mid/high bands feed bounded deformation/reflection targets. At zero
output all bands are zero, including any FFT smoothing residue. Idle never sets
playing status or manufactures analyser energy. Reduced motion leaves audio
controls functional with static visuals.

Play/Stop and a native volume range appear in the fixed player and the study
panel footer. Escape closes the panel while playback continues with the fixed
Stop accessible. Opening Project brief stops playback. Hiding the document or
an audio-system interruption stops it and clears reactive energy. Returning
stays silent until another Play. BFCache pagehide stops; final pagehide/unmount
cleans up nodes/listeners and closes the context. Browser autoplay/resume errors
show a retry message and cannot produce a delayed canceled voice.

There are no audio files, remote streams, sampled instruments or microphone APIs.

## Content and keyboard interaction

`src/sections/` owns statement, work, approach and studio. Studies are explicitly
self-initiated concepts. Native study tabs use Left/Right wrapping and Home/End;
modal focus remains inside and Escape restores the original opener. Native
range controls support Arrow keys, Home and End. Menu anchors update the hash,
close the menu and focus the target section. A separate native modal generates
and copies a local project brief, with selectable text if clipboard is unavailable.
There is no submission or network request.

Keyboard patterns follow the [WAI tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
and [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
Audio scheduling follows the [Web Audio specification](https://www.w3.org/TR/webaudio-1.1/).

## Verification

`npm test` runs score, lifecycle, analyser, parameter mapping, selection, geometry,
frame-step and brief tests. `npm run build` includes TypeScript checking.

The following are Playwright functions for the browser tool's `filename`
argument, with a fresh production preview on 4173 (no extra site dependencies):

- `qa/scene-checks.js`: desktop/mobile hero, shader/WebGL fallback, resize resources.
- `qa/studies-checks.js`: all panels, focus/tabs/menu/anchors, reduced motion and
  a guard asserting that visual-only interaction creates zero AudioContexts.
- `qa/audio-checks.js`: real context/voice transitions, volume, controls at 320/
  390/1440, interruption, simulated visibility/BFCache and teardown.
- `qa/audio-endings-checks.js`: complete real-time playback and natural end of
  every score. This takes roughly 36 seconds.
- `qa/audio-edge-checks.js`: delayed/rejected resume, unsupported audio and WebGL.
- `qa/audio-load-checks.js`: warm RAF samples and 15 repeated start/stop cycles.
- `qa/audio-signal-checks.js`: real OfflineAudioContext renders, full envelopes,
  scheduled mid-phrase fades, finite/headroom/silent-tail assertions. This one
  uses dev source modules on 5173; it emits metrics, never audio files.

`?inspect=1` exposes scene/voice/resource counters as data attributes for these
checks; normal visits do not update diagnostics. It is not a second renderer.

See `PHASE_PLAN.md` for the checklist and `QA.md` for actual results and limits.

## Final brief and review / phase 5

The project brief uses an input view and a result view. Required project-name/description
errors are linked to their fields and focus the first invalid input. Generate
focuses the result heading. Edit details preserves the original draft, including
multiline text; generating again replaces the output. Close and the primary
action remain outside the scrolling body. Copy brief writes the generated text
to the real Clipboard API; a missing/denied API focuses and selects all text for
manual copying. Details exist only in page memory. No contact or submission is
simulated. Closing restores the original CTA (or Menu for the mobile menu action).

Footer anchors and Skip to content explicitly focus their destination. The
mobile menu also opens the project brief. Small labels are at least 12px and
key touch controls are at least 44px high. The 1280x720 hero uses a slightly
smaller display size so both hero actions remain visible.

`useVisualActivity` shares one visibility listener and one dialog-attribute
observer. It gates each view by viewport intersection, page visibility, motion
and modal ownership. Decorative visuals behind a modal rest; a study motif
inside that modal can run. This avoids using GPU work to animate an obscured
hero. The existing slow motion budgets and reduced-motion static states remain.

Additional production browser functions:

- `qa/phase5-checks.js`: all five viewport layouts, brief validation/editing,
  actual clipboard write/read, manual-copy fallbacks, focus and footer anchors.
- `qa/phase5-access-checks.js`: DOM text contrast, focus/error associations,
  mobile menu CTA, player focus visibility and 640x360 reflow. This is a targeted
  audit, not a screen-reader test or accessibility certification.
- `qa/phase5-performance-checks.js`: new-context startup, warm RAF distribution,
  WebGL2 timer queries for the mesh draw, modal/motion-off rest and resource counts.

`QA.md` records the actual Windows/Chrome backend and measured samples. Physical
phones, Safari/Android, system font differences, real OS lifecycle, assistive
technology and subjective audio listening remain manual verification limits.


## Local review regressions

`qa/review-checks.js` covers player-dismissal focus return, native and simulated
Arial layouts, visual/audio note states and delayed-start messages. Execute with
the browser tool against production preview on 4173. `REVIEW.md` records the
confirmed findings, before/after evidence, fixes and verification limits.
