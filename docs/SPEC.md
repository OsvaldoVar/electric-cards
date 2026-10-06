# Electric Cards — Specification

Electric Cards teaches combinational and sequential digital logic through circuit puzzles.
The interface is Spanish and works on desktop, tablet and mobile browsers.
This is a standalone SPA with no account, server or database.

## Routes

| Route          | Purpose                                                 |
| -------------- | ------------------------------------------------------- |
| `/`            | Introduction, progress and resume action                |
| `/levels`      | Seven worlds, unlocks and completed levels              |
| `/puzzle/:id`  | Objective, finite inventory, circuit editor and results |
| `/learn`       | Ten progressively unlocked component cards              |
| `/learn/:gate` | Gate symbol, expression, simulator and truth table      |

## Game rules

- Nodes: fixed binary inputs, movable gate instances and fixed output terminals.
- AND/OR/NAND/NOR/XOR/XNOR have two inputs, NOT one, CLOCK none.
  DFF has D/CLK; TFF has T/CLK. Both expose Q through the out handle.
- Target ports accept one wire; a source may feed several target ports.
- Connections always travel from a source output to a target input.
- All nodes must form a DAG. Incomplete wiring produces unknown previews.
- All placed gates must be fully connected, even unused ones, for completion.
- Inventory is finite and derived from placed nodes; deleting refunds a gate.
- Validation checks circuit shape, level terminals, inventory and all cases.
- Every correct circuit completes its level. When it exceeds the optimization
  gate target, show blue advice explaining a smaller feasible gate count.
  Replays preserve the best gate count; there are no star ratings.
- Completing a level unlocks the next. Completed levels remain replayable.
- Progress and in-progress drafts persist locally; no sync between devices.

## Content

35 puzzles across fundamentals, negation, comparison, combinational circuits,
optimization, clocks and memory. Include LED, door, flag, alarm and motor terminal visuals.
All representations are Boolean. Tables cover every input combination.
Hints are educational and never count as failed attempts or reduce progress.

## Acceptance

All engine tests, lint, build and E2E checks pass. A player can complete a
puzzle on touch using tap-to-connect, see every failed case, replay inputs,
reset a draft and reload without losing progression. No interactive feature
depends exclusively on hover, right-click or keyboard.

## Sequential progression

Start with AND. Unlock OR after 1, NOT after 2, NAND after 5, NOR after 6,
XOR after 10, XNOR after 11, CLOCK after 25, DFF after 27 and TFF after 31.
Correct completion opens a success dialog with a next-level button and any new
component. Escape or Seguir explorando closes it.

Levels 26–35 contain memory and ordered clocked tests. Validate every step of
every independent scenario from Q=0. Clock 0→1 captures D or toggles enabled T;
falling or held clocks preserve Q. Shared-clock registers sample simultaneously.
The clock can be stepped or run automatically and paused. Resetting memory
keeps the circuit. Memory and timer state are transient across page reloads.
