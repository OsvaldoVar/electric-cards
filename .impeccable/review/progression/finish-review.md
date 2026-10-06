# Progression and clocked memory

Verdict: implemented and reviewed in the local project.

AND is available initially. Completing curriculum milestones unlocks the
remaining six Boolean gates, CLOCK, DFF and TFF. The collection and inventory
show which level unlocks each unavailable part. The reducer also enforces this
rule, and older completions derive their corresponding unlocks on reload.

Successful validation opens a native modal with new components, the correctness
message, optional blue optimization advice and Siguiente nivel. Tab stays
inside its actions; Escape and Seguir explorando return focus to the board.

Ten new levels introduce clock phases, D memory, shared-clock registers, T
memory and combined storage/toggle behavior. Sequence validation checks held,
rising and falling clocks from independently reset scenarios. Memory and clock
playback are transient; existing stored drafts and completions remain intact.

The first visual round checked 20 route/viewport combinations without overflow
or runtime errors. Unit checks pass all 83 tests. The final complete browser suite passes 55
cases.
One original desktop touch-only case is intentionally skipped. New sequential
controls passed on desktop and touch emulation. The documented backdrop color
still produces an advisory because Impeccable's design metadata is stale.
