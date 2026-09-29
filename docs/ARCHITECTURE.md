# Architecture

## Layers

1. `data/`: seven gate descriptors and 25 level records, generated complete
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
testsPassed, totalTests, failures, cases, errors, gateCount and stars.
Structural errors short-circuit validation; valid circuits run every case.
Graph sorting is O(nodes + edges); reachable-path checking rejects cycles
before a wire enters state. Evaluation does not mutate the circuit.

## State and persistence

Context + useReducer stores active puzzle drafts and version-1 progress.
Progress keeps completed levels, best stars/gate count and unlockedLevel.
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
  owns circuit constraints. The editor also offers a visible wiring form.
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
