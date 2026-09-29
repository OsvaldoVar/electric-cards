# Electric Cards — Specification

Electric Cards teaches combinational digital logic through circuit puzzles.
The interface is Spanish and works on desktop, tablet and mobile browsers.
This is a standalone SPA with no account, server or database.

## Routes

| Route          | Purpose                                                 |
| -------------- | ------------------------------------------------------- |
| `/`            | Introduction, progress and resume action                |
| `/levels`      | Five worlds, unlocks and best stars                     |
| `/puzzle/:id`  | Objective, finite inventory, circuit editor and results |
| `/learn`       | Seven educational character cards                       |
| `/learn/:gate` | Gate symbol, expression, simulator and truth table      |

## Game rules

- Nodes: fixed binary inputs, movable gate instances and fixed output terminals.
- AND/OR/NAND/NOR/XOR/XNOR have two inputs, NOT one.
- Target ports accept one wire; a source may feed several target ports.
- Connections always travel from a source output to a target input.
- All nodes must form a DAG. Incomplete wiring produces unknown previews.
- All placed gates must be fully connected, even unused ones, for completion.
- Inventory is finite and derived from placed nodes; deleting refunds a gate.
- Validation checks circuit shape, level terminals, inventory and all cases.
- Earn one star for correctness, two for the stated gate budget, three for the
  smaller optimal budget. Replays never downgrade best results.
- Completing a level unlocks the next. Completed levels remain replayable.
- Progress and in-progress drafts persist locally; no sync between devices.

## Content

25 puzzles across fundamentals, negation, comparison, combinational circuits
and optimization. Include LED, door, flag, alarm and motor terminal visuals.
All representations are Boolean. Tables cover every input combination.
Hints are educational and never count as failed attempts or reduce stars.

## Acceptance

All engine tests, lint, build and E2E checks pass. A player can complete a
puzzle on touch using tap-to-connect, see every failed case, replay inputs,
reset a draft and reload without losing progression. No interactive feature
depends exclusively on hover, right-click or keyboard.
