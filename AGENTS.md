# PHASE — project instructions

## Read before implementing

- Read `PHASE_PLAN.md` and the current phase in `CODEX_PROMPTS.md`.
- Preserve the project-specific visual direction. Apply general skill advice within this brief.
- Work in the current local PHASE project. Treat the referenced INLUNE repository as read-only. Do not create a repository, configure a remote, commit, push, publish, deploy, or provision external services unless the user asks for that action.
- Inspect existing files before scaffolding. Preserve existing user work. Do not run a generator that removes the documents or skills in this nonempty project.
- Implement the requested phase autonomously; resolve routine technical choices without repeated permission questions.

## Skills

- Use `frontend-design` for visual decisions and critique.
- Use `awwwards-motion` for relevant creative techniques. Its universal glass/spring recommendations are not PHASE requirements.
- For the 3D implementation, select the relevant scene, R3F, shader, material, animation, particle and interaction skills.
- Use performance, accessibility and testing skills when that phase calls for them. Do not load unrelated skills just because they are available.

## Product and design

- PHASE is a fictional independent sound studio, presented as a portfolio concept.
- Public-facing website copy is English. Development conversation can be Serbian.
- Keep the charcoal, silver and acid-yellow direction; large condensed display type; quiet body copy; one memorable procedural sculpture.
- Preserve the hierarchy and composition defined in the plan. Avoid generic SaaS cards, invented testimonials, client logos, awards, staff biographies or business metrics.
- Content and navigation must remain usable when audio is off and WebGL is unavailable.

## Assets and scope

- Build the principal visuals from geometry, shaders, Canvas/SVG and CSS. Generate audio with Web Audio API.
- Do not introduce MP4, GIF, image textures, photographs, GLB/GLTF, HDRI, sampled audio or remote media requests.
- Use system fonts in the strict code-only version. A custom font is an explicit later design choice, not a hidden dependency.
- Package dependencies are allowed. Check installed versions and peer dependencies before choosing APIs. Prefer local modules over CDN script tags.
- Default stack: Vite, React, TypeScript, Three.js and React Three Fiber, with ordinary CSS. Add Drei or GSAP only for a concrete requirement; do not add a second animation framework without need.
- No accounts, database, CMS, analytics or backend in version one.

## Implementation quality

- Keep rendered content in semantic HTML. Canvas is a visual layer, not the source of essential text or buttons.
- Use refs/uniform mutations for per-frame work; avoid React setState every frame. Share scene parameters through one clear controller.
- Keep audio disabled until an explicit user gesture. One AudioContext and one active study; provide stop, volume and a visible playback state.
- Do not request microphone access. Do not start audio when the user scrolls or switches visual-only controls.
- Honor reduced motion, provide a motion toggle, stop unnecessary background rendering, and clean up audio nodes, listeners and GPU resources.
- Maintain mobile layouts and touch-friendly controls. Do not disable zoom, intercept ordinary scrolling, or require hover to reveal essential actions.
- Use separate modules for the main visual, audio engine, project data, controls and styles.

## Verification

- Run the checks that exist and are appropriate to changed behavior. Establish type checking and a production build in setup.
- Add meaningful tests for audio state, parameter mapping and brief generation. Inspect visual work in a browser when that capability is available.
- Test keyboard controls, audio opt-in/stop, reduced motion, mobile layout, project switching and WebGL fallback.
- Report what actually ran, what was inspected, and any remaining verification limits. Never claim a performance target was met without measurement.
- Update the phase checklist in the implementation section of `PHASE_PLAN.md` with completed work and concrete remaining issues.
