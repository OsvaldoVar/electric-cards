# Testing

```sh
npm ci
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

Vitest covers operations, graph/circuit constraints, complete/partial preview,
every reference solution, inventory, optimization advice and local state. Testing Library
covers component behavior. Playwright builds a level through visible controls,
uses both pointer and touch wiring, checks failure explanations and persisted
progress, and checks page overflow at four required viewports.

CI repeats lint, unit/component tests, production build and Chromium E2E.
Use `npm run test:watch` when changing the engine. E2E failure traces are kept
under `test-results/`, excluded from Git. Never commit node_modules or dist.

## Pixel art frontend checkpoint — 2026-10-01

The visual redesign is implemented, but the independent review requires final mobile fixes. ESLint, production build, formatting and all 83 unit/component tests passed. The complete Chromium desktop/touch suite passed 83 tests with one intentional desktop-only native-touch skip (the touch case passed). A 64-route/viewport capture batch found no document overflow or runtime errors; 88 screenshots and `checks.json` are in `.impeccable/review/pixel/`.

Visual review found zoom controls covering input B after arranging at 360×800, and fit-view modules too small in the short landscape layout. These remain open despite passing automated functional checks. See [the resumable checkpoint](AVANCE-PIXEL-2026-10-01.md). The engine, data, context, hooks and services were confirmed byte-identical to the starting workspace; integrity hashes are recorded in `.impeccable/review/pixel/logic-integrity.json`. Physical iOS/Safari and Firefox remain unverified. No publication or deployment was performed.

## Verification record

### GitHub upload verification — 2026-10-05

Before uploading the current workspace, ESLint, Prettier, all 83 unit/component
tests across 10 files and the production build passed. The complete Chromium
desktop/touch suite passed 83 tests with one intentional desktop-only skip for
native touch wiring; the native touch case passed in the touch project.

Checks used Node.js 24.19.0 for formatting, build and E2E, and Electron's
Node.js 22.21.1 for ESLint and unit/component tests. Playwright used the installed
`/usr/bin/chromium`. The first E2E attempt could not start its local server under
the execution sandbox; the complete run passed after that restriction was removed.
Only documentation formatting was corrected for this upload. No new physical
Safari/iOS or Firefox checks or final visual acceptance review were performed;
the visual follow-up items recorded above remain separate from these automated
results. Runtime dependencies, production builds and Playwright reports remain
excluded from Git by the existing ignore rules.

### Pixel wires, expected-only truth table and scrolling inventory — 2026-10-02

ESLint, all 83 unit/component tests and the production build passed using
Node.js 22.21.1. System Chromium passed 83 desktop/touch E2E checks, with the
existing intentional desktop-only native-touch skip. The failed-row regression
now also checks that the objective retains its expected values without «Obtenido».

Four viewport captures (360×800, 768×1024, 1366×768 and 1920×1080) verify
angular wires, square ports, red failed rows and scrolling the advanced-level
inventory. No runtime errors or document overflow were found. The outer pixel
frame stays fixed while the sidebar scrolls; the hint separator follows the
full inventory. Screenshots and measurements are in
`.impeccable/review/pixel-wires/`. Existing E2E checks also confirm wire endpoints
after reloading/resizing, dragging, deleting and touch connections.

The source detector reported advisory existing font sizes outside the documented
type ramp. No typography changes were made in this task. Physical-device
Safari and Firefox checks remain unperformed.

### Light appearance, global dark mode and stable playback — 2026-09-30

ESLint, Prettier, all 83 unit/component tests and the production build passed
using Node.js 24.14.1 and system Chromium. Desktop/touch browser coverage now
contains 77 passing cases plus the existing intentional desktop skip for native
touch wiring. The full run passed 76 cases; one desktop route-loading check
encountered obsolete asset URLs during a concurrent preview rebuild (404s in
its trace). That exact case passed when repeated against the completed build.

New browser checks verify settings placement before the map, dark appearance
across every page and the completion/settings dialogs, preference persistence,
restoration of light appearance, Escape and return focus. Normal-motion success,
failure and incomplete validation sample every animation frame and assert no
document overflow or board geometry drift. This catches the table-caption
overflow that the previous reduced-motion-only geometry check missed.

Seventy route/theme/viewport checks cover both modes at 360×800, 640×800,
768×1024, 1366×768 and 1920×1080, with no horizontal overflow, puzzle document
scrolling or browser errors. Captures include settings, completion and completed
boards in `.impeccable/review/light-dark/`. The source detector found four
nonblocking palette advisories, including the documented settings backdrop and
legacy navigation/switch colors. Physical Safari/iOS and Firefox remain
unverified.

### Navy background and yellow actions — 2026-09-30

Corrected the color roles: the page background is `#000080`; primary actions
and navigation highlights are `#ffdb58`. White panels retain dark text, while
page text and the brand use light foregrounds against the navy background.

ESLint, all 83 unit/component tests and the production build passed with
Node.js 24.14.1. The complete system-Chromium desktop/touch suite passed 69
tests, with the existing intentional desktop skip for native touch wiring.
Browser assertions verify the exact background and action colors.

Thirty-five route/viewport checks at 360×800, 640×800, 768×1024, 1366×768 and
1920×1080 found no horizontal overflow, puzzle page scrolling or runtime
errors. Captures include home, levels, collection, gate details and puzzle
completion states in `.impeccable/review/navy-background/`. The design detector
returned no findings for the changed theme and color tokens. Physical
Safari/iOS and Firefox remain unverified.

### Navy/yellow palette and unified board header — 2026-09-30

Verified with Node.js 24.14.1 and system Chromium. ESLint, Prettier, all 83
unit/component tests and the production build pass. The final desktop/touch
suite passed 69 tests, with the existing intentional desktop skip for native
touch wiring (covered in the touch project). Coverage includes the new toolbar, exact primary/secondary colors, removal of the selector
form and test-status column, direct-port wiring, complete DFF construction,
cycle/self-link rejection, and unchanged workspace bounds after completion.

Twenty visual route/viewport checks at 360×800, 640×800, 768×1024, 1366×768 and
1920×1080 reported no page overflow or runtime errors. Final screenshots,
including completed-board and popup states, are in
`.impeccable/review/navy-yellow/`, generated by
`node .impeccable/capture-workspace.cjs`.

Navy on white has 16.01:1 contrast, navy on the yellow action has 11.84:1, and
secondary text on the page background has 5.16:1. The source detector reports
five advisory legacy literal colors in shared CSS, with no blocking findings.
Physical Safari/iOS and Firefox remain unverified.

### Viewport workspace and stable completion — 2026-09-30

Verified locally with Node.js 24.14.1 and system Chromium against the production
build. ESLint, Prettier, all 83 unit/component tests and the production build
pass. The full desktop/touch browser suite passed 67 cases with one existing
intentional desktop skip for native touch wiring (covered in the touch project).
A final focused workspace run covers both input projects, including the added
640 px boundary check.

Workspace regressions measure board, sidebar, title and control bounds before
validation, while the popup is open, after Seguir explorando, and after
Siguiente nivel. They also verify focus restoration, unchanged circuit viewport,
the blue map button's position, navigation before the rightmost brand, numbered
level labels, and the absence of duplicate completion/skip actions. Expanded
wiring tools do not change board geometry. Levels 1, 25, 28 and 35 are checked
at 360×800, 640×800, 768×1024, 1366×768 and 1920×1080 for both horizontal and
vertical page overflow.

Visual screenshots and measurements are in `.impeccable/review/workspace/`,
reproduced with `node .impeccable/capture-workspace.cjs`. The final capture checks
20 route/viewport combinations, plus completion popup and dismissal screenshots.
No browser errors or page overflow were found. The source design detector
returned no findings. Physical Safari/iOS and Firefox remain unverified.

### Progressive components, completion popup and sequential levels — 2026-09-30

The game now has 35 levels and 10 components. ESLint, Prettier, production build
and all 83 unit/component tests pass. Unit coverage includes every reference
circuit with only the components earned at that stage, reload compatibility,
locked reducer additions, complete D/T transition tables, shared-clock atomic
sampling, independent memories and failures that expose stateless substitutes.

The final full desktop/touch browser suite passed all 55 cases. The one
existing desktop skip for native touch wiring remains covered in the touch
project. Browser coverage includes popup
completion/next navigation, Escape and focus restoration, unlock persistence,
direct locked learning routes, manually constructed DFF circuits, held/falling
clock behavior, automatic clock pause, memory reset, the T learning simulator and restoration of the actual output
when inspecting a failed sequence step.

Twenty visual route/viewport checks at 360×800, 768×1024, 1366×768 and 1920×1080
reported no page or dialog overflow and no browser errors. Mobile and desktop
captures live in `.impeccable/review/progression/`, generated by
`node .impeccable/capture-progression.cjs` with preview on port 4174. The source
detector reported one advisory for the documented modal backdrop color in the
stale design metadata. Physical Safari/iOS and Firefox remain unverified.

### Completion without stars and blue optimization advice — 2026-09-30

Verified using Node.js 24.19.0 and system Chromium against the production build.
ESLint, Prettier, all 65 unit/component tests and the Vite build passed. The
complete Playwright suite passed 45 tests, with the existing desktop-only skip
for native touch wiring; that case passed in the touch project.

Coverage includes legacy star records loading without lost completions or
drafts, new saves without ratings, correct circuits above the gate target still
unlocking the next level, no optimization advice for incorrect/incomplete
circuits, and advice disappearing after an edit or a compact solution. Browser
tests verify the advice color and its absence during truth-table playback.

Visual captures at 360×800, 768×1024, 1366×768 and 1920×1080 show no page
overflow, runtime errors or visible star ratings. Blue text on its pale blue
surface has a 5.03:1 contrast ratio. Captures and checks are stored in
`.impeccable/review/optimization/`; reproduce with
`node .impeccable/capture-optimization.cjs` and preview on port 4174. Physical
Safari/iOS and Firefox were not checked. The design detector reports existing
palette documentation advisories in shared CSS; the new notice uses the
documented blue and surface tokens. No GitHub publication was performed.

### Completion feedback and steady dragging — 2026-09-30

The full browser suite checks the visible all-correct banner after the final
case, its disappearance after a circuit edit, and continuous visibility of a
connected gate and all three wires at eight points during mouse and touch
dragging. A separate browser measurement confirmed the original disappearing
node and wires during drag, then confirmed their continuous visibility after
preserving measured dimensions in view state.

| Check                      | Result                             |
| -------------------------- | ---------------------------------- |
| ESLint and Prettier        | Passed                             |
| Vitest / Testing Library   | 64 passed across 8 files           |
| Vite production build      | Passed                             |
| Playwright desktop + touch | 43 passed, 1 intentionally skipped |
| Drag regression in browser | 2 passed; no hidden nodes or wires |

### Truth-table playback and hints — 2026-09-30

Verified locally with Node.js 24.19.0, npm 11.9.0 and system Chromium. The
toolchain lives outside the repository in `/tmp/electric-cards-toolchain`.

| Check                       | Result                                     |
| --------------------------- | ------------------------------------------ |
| ESLint                      | Passed                                     |
| Prettier                    | Passed                                     |
| Vitest / Testing Library    | 64 passed across 8 files                   |
| Vite production build       | Passed                                     |
| Playwright desktop + touch  | 41 passed, 1 intentionally skipped         |
| Latest focused playback E2E | 8 passed after the final visual adjustment |
| Visual capture              | 32 checks; no overflow or page errors      |

Unit tests cover formula grouping and negation, every level's designated gate
distractor, and playback cancellation, restart, skip and completion timing.
Browser tests cover row-by-row green/red verdicts, temporary board inputs,
earned progress only after review, and the Pista and selection interactions on
desktop and touch. The visual review includes success and failure frames plus
six routes at four required viewports. Screenshots and the check report are in
`.impeccable/review/apple/`. Physical iOS/Safari and Firefox were not checked.

### Apple-inspired frontend — 2026-09-30

Verified locally using Node.js 24.19.0, npm 11.9.0 and system Chromium. The
Node.js toolchain lives in `/tmp/electric-cards-toolchain`, outside the project;
no dependencies were added or changed.

| Check                                | Result                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| ESLint                               | Passed                                                                                               |
| Prettier                             | Passed                                                                                               |
| Vitest / Testing Library             | 54 passed across 6 files                                                                             |
| Vite production build                | Passed                                                                                               |
| Playwright desktop + touch           | 33 passed, 1 intentionally skipped                                                                   |
| Six routes × four required viewports | 24 checked; no overflow or page errors                                                               |
| Motion and accessibility             | Rapid toggle reversal, keyboard navigation/focus and reduced-motion behavior passed in both projects |
| Visual inspection                    | Home, connected puzzle and success feedback; mobile and desktop captures                             |

The six added E2E executions exercise the new feedback on desktop and touch.
They verify correct signal output while toggles reverse, immediate switch
position and visible focus with keyboard input, correct navigation semantics,
and working puzzle actions without positional animation under reduced motion.
The existing suite verifies wire geometry, node movement, all-case validation,
reset, inventory refunds and persistence against the production build.

Screenshots and the 24-check report live in `.impeccable/review/apple/`. The
capture command is `node .impeccable/capture-apple.cjs` with a local server on
port 4173. It uses isolated browser contexts, including a QA-only saved draft;
it does not modify the user's browser progress. Real iOS/Safari and Firefox
motion feel has not been checked on physical devices.

### Previous notebook redesign — 2026-09-29

Verified locally for the Cuaderno de inventos redesign on 2026-09-29 using
Node.js 24.19.0, npm 11.9.0 and system Chromium 153.0.8010.52 (Arch Linux).

| Check                      | Result                                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Prettier check             | Passed                                                                                                           |
| ESLint                     | Passed, no errors or warnings                                                                                    |
| Vitest / Testing Library   | 54 passed across 6 files                                                                                         |
| Vite production build      | Passed                                                                                                           |
| Playwright desktop + touch | 27 passed, 1 intentionally skipped                                                                               |
| 360×800                    | Six routes checked; no page overflow                                                                             |
| 768×1024                   | Six routes checked; no page overflow                                                                             |
| 1366×768                   | Six routes checked; no page overflow                                                                             |
| 1920×1080                  | Six routes checked; no page overflow                                                                             |
| Browser runtime            | No page errors in 24 route/viewport checks                                                                       |
| Visual inspection          | Home, levels, collection, XNOR details, puzzle and 404 on desktop/mobile; connected circuit and success feedback |
| Impeccable source detector | No findings (`[]`); executed once                                                                                |

Capture checks wait for the lazy route and self-hosted font before measuring.
Full-document screenshots use an explicit viewport matching the document height,
then capture with `fullPage: false`. Chromium/Playwright full-page emulation
otherwise temporarily changes the width observed by the responsive board and
can create misleading wire geometry. Normal viewport rendering and restored
wire endpoints passed the browser tests.

The connected-circuit screenshots seed an isolated browser context with a QA
draft; they do not change the user's saved browser progress.

The one skipped E2E case is native touch wiring under the desktop project; the
same case ran and passed in the touch project. E2E tests used the production
build and covered completion, every case, reload, inventory refunds, stale
result clearing, reset, locked routes, learning simulators, cyclic/self-link
rejection, pointer/touch dragging, organizing nodes and wire geometry after
switching between screen layouts. The wire-geometry case also reloads a saved
circuit and checks both ends of all three wires before arranging or resizing. HTTP development without randomUUID was
also tested successfully.

The earlier browser-CDN workaround has been replaced for this local review by
the installed `/usr/bin/chromium`, supplied through
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. This is not a project dependency.
Normal developer/CI setup uses `npx playwright install chromium`. The override
is optional and does not change normal Playwright installation behavior.

Automated touch emulation does not establish behavior on every physical phone.
Safari and Firefox should receive a physical-device pass before a graded
release. The table records local verification. GitHub runs the CI workflow on
pushes and pull requests; the latest remote result is available in
[Actions](https://github.com/OsvaldoVar/electric-cards/actions). Vercel deployment
has not been executed.

### Learning return and selected-wire controls — 2026-10-06

Verified against main commit 016583528494520566a4cd4123e9f76c77c4eefa plus
this UX change, using Node.js 24.19.0.

- ESLint passed; Prettier passed for changed source and browser tests.
- All 83 Vitest/Testing Library tests passed.
- Production build passed.
- Full Playwright suite: 99 passed, 1 intentional desktop-only touch skip.
  Native touch wiring passed in the touch project.
- New browser coverage checks wire selection by pointer/native touch and
  keyboard, target-port X visibility, deselection on nodes/canvas, target-port
  removal and keyboard activation of the central remove action.
- Learning coverage checks inventory and navigation entry points, collection
  round trips, reload, unchanged validated circuit drafts, return to levels
  1 and 3, normal direct learning visits and invalid origin parameters.
- Learning return headers fit 360×800, 768×1024, 1366×768 and 1920×1080 without
  horizontal page overflow; the existing full workspace checks also passed.

The browser CDN returned an invalid archive. Local QA used temporary
@sparticuz/chromium outside the repository through
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. A temporary Playwright config changed only
the preview host to 127.0.0.1 because this runtime rejects network-interface
enumeration for Vite's default 0.0.0.0 host. No production configuration or
dependencies changed. Physical Safari/iOS and Firefox remain unverified.

On short mobile wires the existing central remove action can overlap the
target-port X. The target-port action remains operable; the central action was
verified through keyboard activation. This change does not alter wire layout.
