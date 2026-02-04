# Go Module Gantry Motion Spec (Draft)

## 1. Coverage math
- Board size: 475mm x 475mm.
- Corner-to-corner distance: sqrt(475^2 + 475^2) = 672mm.
- Center-to-corner distance: 475 / sqrt(2) = 336mm.

## 2. Preferred motion system (XY gantry)
- X travel: >= 520mm (475mm board + 20-25mm margin each side).
- Y travel: >= 520mm.
- Z travel: >= 80mm for pick/place clearance.
- Target placement accuracy: <= +/-1.0mm.

## 3. Alternate motion system (centered cantilever arm)
- Base position: centered above board.
- Required reach: >= 360mm.
- 4-5 joint articulated arm with encoder feedback.

## 4. Right-rear base (not recommended)
- Required reach: >= 700mm to cover opposite corner.
- Implies longer arm, lower stiffness, higher error risk.

## 5. Thermal note
- If passive venting is insufficient, reserve space for 40mm low-noise fan near motor drivers/SoC bay.
