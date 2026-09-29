# Level authoring

Levels live in `src/data/levels.js`. Every record defines id, world, title,
description, difficulty, inputs, outputs, inventory, tests, hints and stars.
IDs are consecutive and stable to preserve saved progress. Input/output IDs
are local to each level. Use only seven supported gate IDs and output visuals
`led`, `door`, `flag`, `alarm`, `motor`.

The internal author helper expands a declarative objective expression into
all 2^n input cases. Expressions are strings for inputs or arrays like
`['OR', ['AND','A','B'], 'C']`; they are never evaluated with `eval()`.
The public level record contains the complete test table rather than exposing
a solution circuit. Inventory can contain distractors. Star budgets refer to
all placed gate nodes and must satisfy maxGates3 <= maxGates2.

To add a level, add its descriptor, a reference circuit fixture under
`tests/fixtures/solutions.js`, and confirm that its full truth table passes
with an allowed inventory and earns three stars. Check that budgets remain
mathematically valid for every available gate type. Do not label a budget
optimal if another available construction uses fewer gates.

| World                | Levels | Focus                                      |
| -------------------- | ------ | ------------------------------------------ |
| 1. Primeras señales  | 1–5    | AND, OR, NOT and composition               |
| 2. El otro lado      | 6–10   | NAND, NOR and De Morgan                    |
| 3. En sintonía       | 11–15  | XOR, XNOR and comparison                   |
| 4. Redes de decisión | 16–20  | Three/four inputs and multiple outputs     |
| 5. Menos es más      | 21–25  | Restricted gates and compact constructions |
