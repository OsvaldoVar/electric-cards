# Visual authority decision

The user approved Cuaderno de inventos and comp B, then accepted the real assembled first viewport in the local review (session 456037252a12778b78a47d4b1dd4f2105b2a6257a15e48d2cdaad10e4cc09280, revision 9012243947d8bd23fbdb8210c1a7e2da2ed74eb6cdeecf1d1ddb0fce07e940b9).

The Impeccable 0.1.8 image-comparison gate continued to reject the exact accepted capture, reporting visible controls as missing and treating real inventory/content differences as blockers. Spanish and English force reasons were attempted; no automatic pass was recorded.

The user explicitly instructed:

> Sí: usa la pantalla real aprobada como referencia, B como guía y continúa sin más consultas visuales

The remaining implementation therefore uses the accepted real viewport at .impeccable/review/hero-native.png as visual authority, a code-led workflow, and B as a visual guide. The previous automated build state is retained as diagnostic history, with its failed hero gate; it is not proof of completion. Finish review, documentation, lint, tests, build, and functional/responsive checks remain required. No further visual approvals.

