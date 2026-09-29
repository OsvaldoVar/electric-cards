# UI and interaction

Dark laboratory visual system: mint live signals, violet comparison,
amber negation, quiet blue-black surfaces and high-contrast labels.
Shared CSS tokens cover color, spacing, radius and typography. Gate families
use both names and symbols; signal state is always labeled 0/1/unknown in
addition to color. System fonts avoid requests to third-party font services.

Desktop puzzle: objective rail, central dotted board, right inventory rail.
Mobile: compact objective, a tall board with signals arranged from top to
bottom, inventory and controls underneath. Ports face down/up on mobile and
right/left on desktop. The Organize control repositions nodes for the current
screen, including drafts previously built in another orientation.
Zoom/fit controls remain visible. Custom ports have large touch hit targets.
Each gate has a visible delete action. Occupied target ports can be cleared.
Wires also have a labeled remove button when selected.

The board supports dragging or two taps to wire. A collapsible connection
form provides source/target selectors for keyboard, assistive technology and
small screens. All actions have accessible labels and visible focus states.
Do not globally block browser zoom. Respect reduced-motion preferences.

Validation reports every tested row, pass/fail counts and received versus
expected values. Selecting a case sets preview inputs. Successful completion
shows earned stars and a next-level link. Invalid circuits show actionable
messages rather than an unexplained failure state.

The learning collection presents seven character cards. Details combine the
standard logic symbol, verbal rule, Boolean expression, simulator and table.
