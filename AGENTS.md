# Electric Cards — Agent instructions

Read this file and all Markdown files under `docs/` before modifying code.

## Goal and scope

Build a responsive educational React game in Spanish. Players construct acyclic
Boolean circuits from a finite gate inventory. A solution must satisfy every
test case for the level. Support AND, OR, NOT, NAND, NOR, XOR and XNOR only.
Do not add a backend, authentication, databases, Redux, analog electronics,
voltage, propagation delays, feedback circuits, HDL or hardware integration.

## Technology

React, Vite, JavaScript, plain CSS, React Router, @xyflow/react,
Context + useReducer, localStorage, Vitest, React Testing Library and Playwright.
Use Node.js 22.12+ or 24. Dependencies and lockfile must stay synchronized.

## Architecture

- Boolean operations and circuit rules live exclusively in `src/engine/`.
- React components call engine functions; never duplicate truth logic in UI.
- `evaluateCircuit(circuit, inputs)` returns output values or a structured error.
- `validateLevel(level, circuit)` evaluates every defined case.
- Circuit nodes use `input`, `gate`, `output` types; edges name both handles.
- Gate metadata belongs in `src/data/gates.js`; levels in `src/data/levels.js`.
- Levels are data, never individual React components.
- Keep pure functions, small components and explicit error codes.

## Circuit constraints

Signals are numeric 0/1. NOT has one input; other gates have two. Each target
port accepts one wire. Sources may fan out. Reject self-links, nonexistent
nodes/ports, reversed connections, duplicate target connections and cycles.
Check the whole circuit and the level's allowed nodes/inventory at validation.
Incomplete circuits cannot complete levels. Deleting a gate removes its wires
and restores inventory, calculated from placed nodes. Fixed inputs and outputs
cannot be deleted. A puzzle reset clears its draft, never earned progress.

## Interaction and layout

Inventory buttons add gates; there is no inventory drag requirement. Players
move nodes, connect by dragging OR by tapping source then target, delete gates
and disconnect occupied ports with visible buttons. An accessible connection
form also allows wiring without precise pointer targeting. Touch operation
must work without hover, context menus or keyboard. Controls use large targets.
Keep the board recoverable with an explicit fit-view control.
Verify 360×800, 768×1024, 1366×768 and 1920×1080; no page overflow.
Use CSS variables. Inline styles are allowed for React Flow geometry only.

## Learning and progress

Every gate has a name, correct symbol, expression, explanation, truth table,
character, ability, example and interactive binary-input simulator.
Use versioned localStorage for completions, best star/gate scores and puzzle
drafts. Treat corrupt/unavailable storage as empty, keep the game functional,
and tell the user if persistence is unavailable. Never trust stored circuits.

## Required checks

Run before completing a phase:

```sh
npm run lint
npm run test
npm run build
```

Run `npm run test:e2e` after interaction changes. Unit tests must cover all gate
truth tables, fan-out, multi-output evaluation, missing ports, invalid signals,
cycle detection, every reference level solution, inventory constraints,
all-case level checking and persistence/reducer behavior. E2E must build and
complete a level, verify touch wiring, restoration after deleting a gate,
failure explanations, progress after reload and responsive screens.
Do not mark a check as passing unless it actually ran. Record limits in
`docs/TESTING.md`. Document contracts/decisions in `docs/ARCHITECTURE.md`.
