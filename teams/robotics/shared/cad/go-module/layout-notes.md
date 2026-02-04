# Go Module Internal Layout Notes

## 1. Overview
The structural design provides a high-fidelity realization of the industrial design concept, accommodating the mechanical arm, Go board, and internal electronics.

## 2. Component Layout
- **Main Enclosure:** 620mm x 520mm x 80mm. 
  - Material: Matte white/light gray ABS/PC plastic.
  - Internal Cavity: Hollowed for electronic components.
- **Go Board:** 475mm x 475mm x 18mm (Wooden/Plastic composite).
  - Position: Recessed 6mm into the top surface, offset for aesthetics and arm reach.
- **Robotic Arm / Motion System:** Coverage rework required for full 475mm x 475mm board.
  - **Reach Analysis:**
    - Corner-to-corner distance: sqrt(475^2 + 475^2) = 672mm.
    - If base is right-rear, required reach to opposite corner >670mm (220mm is insufficient).
    - If base is centered, required reach to board corner: 475 / sqrt(2) = 336mm.
  - **Preferred Solution (Gantry/XY):**
    - X travel >= 520mm, Y travel >= 520mm (includes 20-25mm margins for edge access).
    - Z travel >= 80mm for pick/place clearance.
    - Linear guides + belt/lead screw to maintain <=±1.0mm placement.
  - **Alternate Solution (Longer Arm):**
    - 4-5 joint articulated arm, total reach >= 700mm if base stays right-rear.
    - If base moves to center cantilever, total reach >= 360mm.
  - **Mount:** Gantry columns or centered pedestal mount (replaces right-rear cylindrical platform).
  - **Motors:** 4-5x precision servos/steppers with encoders (gantry: 3-axis + end effector).
- **Electronics Area (Left-Front):**
  - Main Control PCB: Houses MCU/SoC for game logic and arm control.
  - Power Management: 12V/24V input conversion.
  - Display: Front-left cutout for a 3.5" OLED/LCD status screen.
- **Sensors:**
  - Board Matrix: Hall effect sensors or vision-based (camera hidden in arm elbow/wrist) for move detection.
  - Arm Calibration: Limit switches at each joint for home positioning.

## 3. Mechanical Specs
- **Arm Precision:** Designed for ≤±0.5mm repeatability to meet the ≤±1.0mm placement requirement.
- **Weight Distribution:** Weighted base (internal metal plate) to ensure stability during high-speed arm movements.
- **Thermal Management:** Right-side vent slots for cooling the motor drivers and main processor.
  - Consider adding a 40mm low-noise fan over motor driver/SoC bay if passive airflow is insufficient.

## 4. CAD Files
- **Housing:** `shared/cad/go-module/go-module-housing.step`
- **Arm (legacy, short reach):** `shared/cad/go-module/go-module-arm.step`
- **Gantry mock (concept STL):** `shared/cad/go-module/go-module-gantry.stl`
- **Gantry spec:** `shared/cad/go-module/go-module-gantry-spec.md`
