# Level authoring

Levels live in `src/data/levels.js`. Every record defines id, world, title,
description, difficulty, inputs, outputs, inventory, tests, hints and optimizationGateCount.
IDs are consecutive and stable to preserve saved progress. Input/output IDs
are local to each level. Use the ten supported component IDs and output visuals
`led`, `door`, `flag`, `alarm`, `motor`.

The internal author helper expands a declarative objective expression into
all 2^n input cases. Expressions are strings for inputs or arrays like
`['OR', ['AND','A','B'], 'C']`; they are never evaluated with `eval()`.
The public level record contains the complete test table rather than exposing
a solution circuit. Inventory can contain distractors. The optimization target refers to
all placed gate nodes, including connected unused ones. It provides advice
only; correctness alone completes the level.

To add a level, add its descriptor, a reference circuit fixture under
`tests/fixtures/solutions.js`, and confirm that its full truth table passes
with an allowed inventory at or below optimizationGateCount. Check that targets remain
mathematically valid for every available gate type. Do not label a budget
optimal if another available construction uses fewer gates.

| World                | Levels | Focus                                      |
| -------------------- | ------ | ------------------------------------------ |
| 1. Primeras señales  | 1–5    | AND, OR, NOT and composition               |
| 2. El otro lado      | 6–10   | NAND, NOR and De Morgan                    |
| 3. En sintonía       | 11–15  | XOR, XNOR and comparison                   |
| 4. Redes de decisión | 16–20  | Three/four inputs and multiple outputs     |
| 5. Menos es más      | 21–25  | Restricted gates and compact constructions |

| World                      | Levels | Focus                                                   |
| -------------------------- | ------ | ------------------------------------------------------- |
| 6. El ritmo de las señales | 26–30  | CLOCK, two phases, D memory and stored decisions        |
| 7. Memoria en movimiento   | 31–35  | Shared-clock registers, T memory and accumulated parity |

Sequential levels live in `data/sequentialLevels.js`, declare
`kind: 'sequential'`, and contain ordered test records
`{scenario, step, clock, inputs, outputs}`. A scenario starts with all Q values
zero. One-input challenges cover all three-sample histories; two-input
challenges cover all two-sample histories. Each sample tests a low clock, rising
edge, held high with changed data, and falling edge. Objective dropdowns show
one sequence at a time; Probar circuito checks every sequence.

Component availability comes from `data/unlocks.js`; author inventories and
reference constructions that are solvable using the components earned before
that level. Existing level IDs 1–25 remain unchanged.
