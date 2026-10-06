# Architecture

## Layers

1. `data/`: ten component descriptors and 35 level records, generated complete
   truth tables and world metadata. No individual level components.
2. `engine/`: binary operations, graph topology, structural validation,
   partial/complete evaluation and all-case level validation. Pure JavaScript,
   independent of React and localStorage.
3. `context/`, `services/`: reducer transitions and versioned persistence.
4. `hooks/`: puzzle controller coordinates engine and state.
5. `components/`, `pages/`: presentation and React Flow interaction.

## Circuit contract

```js
{
  nodes: [
    { id: 'input-A', type: 'input', position: {x:0,y:0}, data: {inputId:'A'} },
    { id: 'gate-1', type: 'gate', position: {x:250,y:0}, data: {gateType:'AND'} },
    { id: 'output-LED', type: 'output', position: {x:550,y:0}, data: {outputId:'LED'} }
  ],
  edges: [
    {id:'wire-1',source:'input-A',sourceHandle:'out',target:'gate-1',targetHandle:'a'}
  ]
}
```

Gate targets are `a`/`b` (NOT only `a`); outputs use `in`. Only input/gate
nodes expose `out`. IDs are stable; engine ignores visual positions/styles.

`evaluateCircuit(circuit, inputs)` returns `{valid:true, outputs, nodeValues}`
or `{valid:false,error,errors}`. In partial preview mode, unconnected signals
are `null`, never assumed to be zero. `validateLevel` returns success,
testsPassed, totalTests, failures, cases, errors, gateCount and canOptimize.
Structural errors short-circuit validation; valid circuits run every case.
Graph sorting is O(nodes + edges); reachable-path checking rejects cycles
before a wire enters state. Evaluation does not mutate the circuit.

## State and persistence

Context + useReducer stores active puzzle drafts and version-1 progress.
Progress keeps completed levels, best gate count and unlockedLevel.
Inventory is computed as allowance minus placed instances, not separate state.
Circuit changes clear stale validation results. Inputs can change preview
without affecting exhaustive validation. Reducer defends inventory and wiring
in addition to editor validation. Persist serializable data only: callbacks,
preview values and selected states never go into storage.

Storage loading filters unknown levels, invalid scores, oversized collections
and malformed drafts. Draft shape must pass engine validation in incomplete
mode with the corresponding level before it can be used. Storage exceptions
do not interrupt the game. Saves are debounced to avoid writes per drag frame.

## Decisions

- Plain JS/CSS follows the course requirements and keeps setup small.
- React Flow handles touch, dragging, zoom and accessible nodes; the engine
  owns circuit constraints. Wiring uses drag or two taps on visible ports.
- Mobile boards arrange signals top-to-bottom and use down/up ports. Desktop
  boards use right/left ports. An explicit organizer works on existing drafts,
  and port internals are refreshed when their orientation changes. Positions
  never influence Boolean evaluation. Layout helpers belong in `services/`.
- Symbols and character portraits are repository-native SVG components with
  no external asset service. They are educational metaphors, not extra gates.
- Truth cases are authored from declarative Boolean expressions evaluated by
  the same pure gate primitive. Reference circuits are independently defined
  in tests and checked exhaustively; no solution is embedded in UI.
- Route modules are lazy-loaded to keep the React Flow bundle out of home.
- Deploy config supports Vercel SPA rewrites; deployment requires an account
  and is outside the repository creation request.

## Frontend: Apple-inspired laboratory

The 2026-09-30 iteration replaces the notebook presentation with neutral white
surfaces, system typography, blue primary actions and a translucent sticky
navigation bar. Existing educational SVGs, level data and board geometry remain
runtime components. The new user request supersedes the previous visual
reference; old Impeccable artifacts are retained as historical material.

`variables.css` owns colors, radius, elevation and motion tokens. `globals.css`
contains shared UI, `screens.css` contains page layouts, `responsive.css` adapts
the layout, and `motion.css` implements interaction feedback and accessibility
variants. The board's geometry stays in `CircuitBoard.css`. No runtime fonts,
new dependencies, backend or storage migration are needed.

Navigation has one shared sliding selection surface. Binary switches retarget
CSS transforms from their current position, without timers or delayed state.
`@starting-style` introduces home content and feedback panels;
unsupported browsers show the final content immediately. There is no animation
on node movement, wire geometry, table values or repeated keyboard actions.

Layout tracks pointer/keyboard modality through document capture listeners,
with cleanup on unmount. Keyboard actions disable CSS animation and transitions;
pointer presses restore the usual feedback. Reduced-motion preferences keep
short fades and color feedback, remove animated position/scale changes and
update the binary switch position immediately. The existing React Flow
organize/fit duration still respects both keyboard and reduced-motion input.
Reduced-transparency and increased-contrast preferences use opaque navigation.

The engine, node/handle IDs, inventory rules and versioned localStorage contract
remain independent of presentation. All existing drafts and earned progress
continue using the same validation and persistence rules.

## Truth-table review and hints

`validateLevel` still computes every case synchronously. `useValidationPlayback`
reveals that result one row at a time: 360 ms of input preview followed by
160 ms for its verdict. The active row's inputs temporarily drive the board;
they are not saved to the draft. The objective and result tables derive their
pending/checking/passed/failed states from the same playback state, and the
board, output and wires reflect the active case. Rewards and completion are
committed only after the last row; there is no skip button in the UI. Edits,
input changes, reset and a new test cancel any pending timers. Keyboard
activation and reduced-motion preferences finish the review immediately.

`formatExpression` renders each level's declarative Boolean goal as algebraic
notation in Pista, independently of the user's circuit. Each of the 25 level
records designates one valid gate type as a distractor and adds it to inventory
when absent. Existing inventory options remain available so saved drafts and
alternate solutions retain their behavior. React Flow's oversized selection rectangle is hidden;
individual node focus remains visible for keyboard use.

Success confirmation and optimization advice appear only in the completion
popup. The objective table contains only inputs and expected outputs, with
review communicated through row colors and accessible labels. No board status
line or additional test-status column is inserted before or after testing. React Flow reports measured
node dimensions through `onNodesChange`. The board keeps those dimensions in
view state when it sends new positions to controlled React Flow nodes. Without
them, React Flow hides the moving node and connected wires until its next
measurement. Port internals are refreshed only when node IDs or orientation
change, while the persisted circuit continues to store positions alone.

## Completion and optimization advice

Levels define `optimizationGateCount` as a feasible compact construction.
`validateLevel` returns `canOptimize` only when every test passes and all placed
gates exceed that target. Correctness always completes the level and unlocks
the next; there is no rating. Blue optimization advice appears in the completion
popup after playback finishes.

Version-1 storage continues using the same key and draft contract. Loading old
records drops the legacy `stars` field while preserving `completed`,
`bestGateCount`, drafts and derived unlocks. New saves contain no star scores.

## Progressive unlocks and completion dialog

`data/unlocks.js` derives the component collection from completed levels; no
additional trusted storage flags are needed. The reducer rejects ADD_GATE for
locked components and validates completions with the unlocked IDs. The UI
filters inventory and blocks direct learning routes for undiscovered parts.
Each reference solution is checked with only the components available at that
stage. Existing completed levels imply their unlocks on load.

After validation finishes successfully, the puzzle opens a native modal dialog
with the correctness verdict, newly unlocked parts, optional blue optimization
advice and Siguiente nivel. Native dialog provides focus containment and Escape
dismissal; Seguir explorando returns to the board. The last level returns to the
map. A failed or interrupted validation cannot open the dialog.

## Discrete clocks and memory

The user expanded the scope to CLOCK, DFF and TFF on 2026-09-30. They remain gate
nodes in an acyclic graph; no physical timing, asynchronous reset, analog
simulation or external feedback loops are modeled. CLOCK has no inputs. DFF
accepts d/clk and TFF t/clk. Their out handle exposes Q. All registers start at
0 and react only to a 0-to-1 clock transition.

`engine/sequential.js` evaluates a snapshot with the new clock and previous Q,
samples all registers from that snapshot, then commits new Q simultaneously.
Two registers on the same clock therefore transfer the previous first Q into
the second register. Unchanged and falling clocks preserve Q. Validation
resets memory for every independent scenario, then checks every step.
`sequentialObjectives.js` describes expected behavior independently of graph
evaluation. Scenarios include data changes with CLK held high to reject
transparent or stateless substitutes. Sequence validation finishes immediately
and results let learners inspect individual step snapshots.

Simulation state and clock timers are transient. Reload and circuit edits
reset them; moving a node preserves them. Changing a signal or advancing the
clock clears stale sequence results. Automatic clock advances every second,
pauses on testing/editing, and cleans up its interval on navigation. Circuit
drafts, best counts, completions and storage key remain compatible with v1.

Educational models follow the rising-edge D behavior described by
[Texas Instruments](https://www.ti.com/product/SN74AUC2G79/part-details/SN74AUC2G79DCTR).
T is an ideal enabled toggle primitive; the toggle concept is described in
[TI's flip-flop overview](https://www.ti.com/product/SN74HC112). Both primitives
in this game intentionally use rising edges; they are not models of a specific
physical chip.

## Viewport editor layout — 2026-09-30

`workspace.css` defines the final editor layout. Puzzle routes use a flex shell
with `100dvh`, no site footer, and a workspace that fills the remaining height.
The sidebar contains the objective, inventory, clock, hints, manual
inputs and detailed test results; its own overflow never increases page height.
The board uses a flexible canvas between stable header and hint rows. At small
widths the tools sit above the board within the same bounded workspace.

The header places the blue map link at the upper left and navigation immediately
before the brand at the upper right. Visible puzzle/map labels are derived from
stable IDs as Nivel N; internal level titles and storage IDs remain unchanged.

Completion opens/closes the native dialog in a layout effect. The root reserves
scrollbar space on regular pages, while the bounded editor needs no page
scrollbar. Modal dismissal and next-level navigation therefore preserve board
bounds and the inspected circuit's viewport. Reset confirmation is positioned
over the workspace, without inserting a row. Only the popup offers continuation;
success results keep optional case inspection in the sidebar without another
completion banner or next-level action.

## Navy/yellow palette and compact toolbar — 2026-09-30

The user pinned primary #000080 and secondary #ffdb58. Shared semantic tokens
map navigation, links, focus and component symbols to navy; yellow highlights
the selected navigation item and test action, with navy foreground. Light
surfaces carry a restrained navy tint, while success/error keep semantic colors.

The board header owns the level h1 and Organizar, Probar circuito and Reiniciar.
There is no separate title row, Tu circuito heading, or review subtitle. Zoom
and fit-view float inside the canvas without consuming another layout row.
The user explicitly removed the selector wiring form and Prueba table column.
The engine and playback contracts remain unchanged; tests now wire actual ports.

Desktop new-gate positions and Organizar use 220 px column spacing, preventing
left-side disconnect controls from covering the preceding gate's output. Existing card positions remain untouched until players choose Organizar; output
terminals shift right when a newly added card would obstruct their ports.

## Background color clarification — 2026-09-30

The user clarified that #000080 is the page background and #ffdb58 is for
buttons/highlights. `theme.css` applies the final color roles after shared
styles: navy page/header, light text on that background, yellow actions and
selected navigation, and white reading/circuit surfaces with dark text.
Surface-local text tokens prevent page text colors from leaking into cards.
The browser theme color matches the navy page background.

## Appearance settings and playback overflow — 2026-09-30

The latest request restores the light background while keeping yellow actions.
Dark mode is opt-in and changes shared semantic tokens on `html[data-theme]`,
including navigation, teaching surfaces, tables, React Flow and both dialogs.
`public/theme-init.js` reads the separate `electric-cards:theme` preference before
the first paint; SettingsDialog changes and persists it, with storage failures
falling back to a working in-memory selection. No game persistence migration.

The visible scrollbar during playback came from an absolutely positioned hidden
table caption whose containing block escaped the sidebar. `.table-scroll` now
provides its containing block. Puzzle routes also bound root/body scrolling to
the viewport; all long results stay inside the sidebar. Frame-by-frame browser
regressions cover normal-motion success, failure and incomplete validation.

## Current presentation contract: pixel art logic editor — 2026-10-01

This section is the active presentation contract. It supersedes the historical
notebook, Apple-inspired, navy/yellow and opt-in-dark presentation descriptions
above. The user supplied the pixel art reference and directly authorized the
complete frontend visual replacement. Earlier architecture sections remain
as a decision history; engine, storage and interaction contracts still apply.

`src/styles/variables.css` owns the implemented palette: background #090d1f,
surfaces #11162b / #181e37, borders #504075 / #8b5cb5, action #ffd34e,
hover #ffe47a, 0-wire #ff547d, 1-wire #63ddff, success #55e58c, output-red
#e84763, text #f4f2ff and secondary text #aeb4d0. Pixelify Sans regular and
bold are self-hosted with OFL licensing. `pixel.css` provides shared hard
buttons and stepped hollow outline geometry. `workspace.css`, `theme.css`,
`motion.css` and `CircuitBoard.css` govern editor layout, appearances, feedback
and React Flow presentation. DESIGN.md and `.impeccable/design.json` are the
current reusable visual documentation.

The editor is bounded to `100dvh`; the document does not scroll. Desktop uses
a 300–360px left tools panel, compacting to 280px at 1000px. Supporting tools
and wide tables scroll internally. At 700px the tools stack above the board
within a region bounded by `min(26dvh, 208px)`. Landscape phones wider than
700px and no taller than 540px keep a 252px panel beside the board. The stable
board header owns Nivel N, Organizar, Probar circuito and Reiniciar. Zoom and
fit-view stay at the canvas's upper right; instructions stay at its bottom.
Dialogs and validation feedback do not insert new workspace rows.

Stepped outlines use a non-interactive hollow pseudo-element so ports,
disconnection buttons and focus contours are never clipped. Selected gates
use yellow; keyboard focus remains cyan. Known wires use pink for 0 and cyan
for 1, with a crisp dark SVG outline and angular routes; unknown wires remain dashed.
There are no gradients, glass surfaces, blur, diffuse shadows, characters or
scenery. `CharacterPortrait` retains its component interface but renders
`GateSymbol` and EC module identification; educational labels remain in place.

Dark appearance is the default. `public/theme-init.js` applies an explicit
saved light preference before first paint, and shared light token overrides
keep the pixel materials with dark text and darker signal colors. Appearance
continues to use `electric-cards:theme`, independently of game saves. Short
feedback uses 80ms pressure and 120ms state changes; keyboard and reduced
motion disable CSS motion. Native controls, accessible labels, visible focus
and 44px touch targets remain required.

The redesign is presentation only: preserve engine truth operations, graph
validation, gate and level data, routing, reducer transitions, versioned
localStorage, inventory, sequential memory and React Flow manipulation.
Drag/tap wiring and visible delete/disconnect controls remain available.
There is no selector connection form. All-case validation, completion popup,
unlocks, reset behavior and clock controls retain their established contracts.

## Pixel wires and scrolling frame — 2026-10-02

`Wire` uses React Flow's orthogonal path helper with zero corner radius;
the temporary connection uses `ConnectionLineType.Step`. Square 16px ports
keep the existing 44px interaction areas, handle positions and IDs. Known
wires use a 4px signal stroke over an 8px dark outline; selection uses 6px.
Unknown signals remain dashed. No routing geometry is persisted.

The objective truth table shows expected values only. Failed cases retain red
row feedback and accessible labels; detailed results keep received values.

`puzzle-sidebar-frame` owns the decorative pixel outline outside the scrolling
`puzzle-sidebar`. Previously the outline's bottom edge scrolled through the
inventory because it was positioned inside the scroll container. Content
separators now remain in normal document flow while the outer frame stays fixed.

## Learning detours and wire selection — 2026-10-06

Learning links opened from a puzzle carry its stable level ID in the `from`
query parameter. `useLearningContext` resolves only known levels and supplies
that context to inventory links, navigation, collection cards and the link back
to the collection. The learning header and detail action return directly to the
origin puzzle. Ordinary learning visits keep their map action. Query-based
context survives reload and opening a link in another tab without introducing
a new saved game field; the existing reducer and validated drafts restore the
circuit. Sequential memory and running timers remain transient as documented.

Wire selection belongs to the board's view state. The selected edge controls
both its central remove action and its target port's disconnect action; other
occupied ports show no X. Pointer/touch and keyboard edge selection use the
same controlled state. Selecting a node or the canvas clears edge selection.
Selection is never persisted with circuit drafts.
