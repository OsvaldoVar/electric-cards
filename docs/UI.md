# UI and interaction

The current presentation, implemented on 2026-10-01 from the user's reference,
is a modern pixel art indie logic puzzle editor. DESIGN.md and
`.impeccable/design.json` describe this active system; earlier notebook,
Apple-inspired and navy/yellow directions are historical.

## Visual system

`src/styles/variables.css` owns the palette, Pixelify Sans font faces, spacing,
shape, depth and short-motion tokens. The default background is #090d1f,
surfaces #11162b / #181e37, borders #504075 / #8b5cb5, action yellow #ffd34e
and hover yellow #ffe47a. Text uses #f4f2ff and secondary #aeb4d0. Signal wires
use pink #ff547d for 0 and cyan #63ddff for 1; success uses green #55e58c.
Red #e84763 marks inactive output frames. Values, labels and dashed unknown
wires provide additional state cues.

Pixelify Sans regular and bold are self-hosted under `public/fonts/`; preserve
`Pixelify-OFL.txt`. Shared pixel materials in `pixel.css` use solid panels,
2px borders, 2px base corners and hollow stepped outlines. The outlines do not
clip ports, focus or controls. Buttons are yellow with dark text and hard
zero-blur relief. There are no gradients, glass effects, blur, soft shadows,
characters or scenery. `CharacterPortrait` now renders the technical
`GateSymbol` and EC module identifier; existing educational names and labels
remain intact.

Dark is the default before first paint. Configuraciones remains available on
all routes. A saved explicit light preference uses the alternate pixel palette:
light surfaces, dark text and darker cyan, pink and success indicators. The
separate `electric-cards:theme` preference does not migrate game storage.
Settings and completion use native dialogs with solid pixel materials;
Escape and close restore appropriate focus.

## Routes and learning surfaces

Home retains its live AND simulator and main action. Wide screens show
introduction and demonstration side by side; narrow screens stack them. The
map retains 35 puzzles across seven worlds and distinguishes available,
locked and completed states with text and state indicators. Visible puzzle
names remain Nivel N. The collection and gate details retain expressions,
explanations, truth/transition tables and interactive simulators for AND, OR,
NOT, NAND, NOR, XOR, XNOR, CLOCK, DFF and TFF. Technical symbols replace
portrait artwork throughout these surfaces.

## Editor geometry

Puzzle routes occupy `100dvh` without document scrolling. The header normally
uses 76px, with Configuraciones and Mapa at the left and navigation plus brand
at the right. The workspace fills the remaining height. A left sidebar holds
objective, inventory, clock, hints, inputs and detailed results; only that
panel and table containers scroll when their content grows.
The decorative pixel frame belongs to a separate outer container so its bottom
edge never scrolls across the inventory; section separators follow the content.

Desktop sidebar width is `clamp(300px, 23vw, 360px)`, becoming 300px at 1200px
and 280px at 1000px. The board has a stable header containing Nivel N,
Organizar, Probar circuito and Reiniciar. Zoom and Ajustar vista float in the
upper right of the canvas; instructions remain in its bottom strip. Validation,
reset confirmation and dialog dismissal preserve the editor's layout.

At 700px and below, supporting tools stack above the board in a compact region
bounded by `min(26dvh, 208px)`; the board receives the remaining height. Controls
use shorter visual labels while accessible names remain available. Landscape
phones at least 701px wide and no more than 540px high keep a 252px tools panel
beside the board. Tables wider than their panel scroll internally.

## Circuit interaction and signals

React Flow retains node movement, selection, connections, zoom and viewport
recovery. Inventory buttons add gates. Wiring uses drag or source/target taps
on visible ports; there is no selector connection form. Visible delete and
disconnect buttons remain available without hover, with 44px targets. The
16px port visuals also have 44px interactive areas. Organizar and Ajustar vista
remain available to recover the circuit.

Input and gate modules are 136px wide; outputs are 144px. Selected gates use
a yellow outline. Keyboard focus uses a separate visible cyan contour and does
not add a large selection rectangle. Wires use orthogonal paths with square
90-degree corners, including the connection preview. Known wires use a crisp
4px SVG stroke with an opaque 8px dark outline and no blur. Unknown wires use
dashed segments and omit the outline. Selected wires use a 6px main stroke.
Ports are 16px squares with signal-colored borders and dark outlines. Wire colors,
0/1 badges and output verdict borders convey complementary state information.

## Validation, progression and memory

Probar circuito previews each truth-table combination, then its verdict;
playback finishes automatically. The objective table retains input and expected
output columns, accessible review states and numeric values. Failed rows use
red feedback without an additional «Obtenido» value. Detailed results
remain in the sidebar. Keyboard tests and reduced motion reveal full results
without timed playback. Incomplete circuits report actionable errors.

Only the completion popup confirms success, offers Siguiente nivel, reports
new unlocks and gives optimization advice when applicable. Seguir explorando
and Escape dismiss it. No success banner or duplicate continuation action is
inserted over the board. Reset clears the draft and preserves earned progress.

Sequential puzzles retain manual/automatic clock controls, visible pause and
memory reset. Their objective table selects an independent sequence of steps.
CLOCK, DFF and TFF learning pages retain clock-controlled simulators and
transition tables. All circuit, progression and persistence rules are unchanged.

## Motion, access and review

Press feedback moves controls down 2px in 80ms and reduces their hard relief.
Colors and borders respond in 120ms with ease-out. Hover treatments require a
precise pointer. Canvas geometry follows React Flow directly. Keyboard input
disables CSS animation and transitions; reduced motion also removes press
movement and uses immediate scrolling. No decorative animation loops are used.

Preserve native controls, focus visibility, accessible labels, browser zoom,
44px targets, touch wiring and equivalent keyboard actions. Review routes at
360×800, 768×1024, 1366×768 and 1920×1080, plus a landscape phone and explicit
light/reduced-motion preferences. Touch emulation needs real-device review for
release. Actual validation results and limitations belong in `docs/TESTING.md`;
this presentation contract does not claim unperformed checks.

Final visual acceptance and any remaining browser review are pending at this
handoff. The saved documentation describes implemented source; it does not
claim completion of that final review.

## Learning return and quiet wires — 2026-10-06

Unselected wires have no delete controls. Selecting a wire reveals its central
remove button and the X at its target port; other wires stay clear. Selecting
a node or the canvas hides these controls. Node deletion remains available.

Aprender and Compuertas opened during a puzzle retain the current level.
The collection and gate details offer Volver al nivel N in the header, and
the gate detail's main action returns to that same level. The collection link
and its cards preserve this context, including through reload. Normal visits
to the collection continue to offer the level map. Circuit drafts and earned
progress use the existing save behavior.

## Separate wire lanes and crossing bridges — 2026-10-06

The board now routes wires together instead of giving each wire the same
independent midpoint. Parallel runs prefer separate lanes, and routes avoid
module bodies. A branching source retains a short common stem before its paths
separate. Necessary crossings show a square bridge, so a crossover does not
look like a connection. Signal colors, selection and disconnect actions remain.

Routes follow moved modules, reload existing drafts and switch between desktop
and mobile port directions. The same path drives the visible stroke, outline
and hit area. Routing changes no connections, gate inventory or test results.
The geometry regression reproduces A/B feeding both XOR and XNOR as in the
reported image.
