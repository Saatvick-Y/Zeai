---
name: espada-industrial-ui
description: Design principles, 3D digital-twin architecture, spatial hierarchy, and progressive disclosure rules for the ESPADA Industrial Digital-Twin Platform.
---

# ESPADA: Industrial Digital-Twin & Operations Intelligence

## 1. Core Visual Language & Philosophy
ESPADA is an aerospace/advanced manufacturing industrial operations command platform. It is engineered to look and feel like high-end mission-control engineering software:
- **Atmosphere**: Deep near-black/navy matte environment (`#020617`, `#080d1a`, `#0f172a`), subtle directional lighting, crisp technical borders (`#1e293b`), and restrained cyan/teal accents (`#06b6d4`, `#38bdf8`).
- **Restrained Status Lighting**:
  - **Normal**: Localized emerald status beacons (`#10b981`).
  - **Warning**: Localized amber warning illumination (`#f59e0b`).
  - **Critical**: Localized pulsing red beacon (`#ef4444`).
  - **Offline**: Muted slate/grey chassis (`#475569`).
  - *No neon floodlighting across entire machines*.
- **Typography**: Precision monospace (`Fira Code`, `JetBrains Mono`) for telemetry parameters, coordinates, and metrics; clean sans-serif (`Inter`) for spatial titles and contextual guidance.

---

## 2. Progressive Disclosure & Spatial Hierarchy (Anti-Dashboard Clutter)
The platform strictly enforces progressive disclosure across 7 discrete workspaces rather than cramming all metrics onto one screen:

| Level | Workspace | Primary Focus | UI Implementation |
| :--- | :--- | :--- | :--- |
| **Level 1** | **Command Center (`/`)** | "What requires attention right now?" | 65% Viewport **3D Factory Digital Twin**, floating HUD with fleet demand kW, health score, active machine count, and quick attention bar. |
| **Level 2** | **Factory Digital Twin (`/twin`)** | Spatial factory exploration & zone thermal/vibration layers | Fullscreen 3D twin with zone selectors, thermal heat map overlay, vibration flow, and click-to-focus camera interpolation. |
| **Level 3** | **Machine Workspaces (`/machines`, `/machines/[id]`)** | Deep diagnostic telemetry & signal overlay | Dropdown selector `[M03 - Rotary Compressor ▼]`, 5 focused tabs (Overview, Live Waveforms, Health Decomposition, Energy, AI Diagnostics). |
| **Level 4** | **Energy Intelligence (`/energy`)** | Power flow, peak demand, and time-series heatmaps | 3D/2D Energy Flow Diagram (Grid → Substations → Zones → M01-M10) + Machine vs Time Energy Heatmap with time resolution dropdowns. |
| **Level 5** | **Machine Health (`/health`)** | Fleet-wide health degradation & ranking | Compact health distribution bar, anomaly timeline, vibration harmonic comparison, and degradation ranking matrix. |
| **Level 6** | **AI Neural Insights (`/ai`)** | Root cause evidence & production-aware reasoning | Animated AI diagnostic engine, measured vs baseline telemetry evidence cards, and operational impact calculations. |
| **Level 7** | **Optimization Simulator (`/optimization`)** | Peak demand shaving & dispatch simulation | 3-column scenario simulator with interactive dispatch timeline (e.g. `08:00 M01 Full Production`, `08:10 M03 Inter-shift Inspection`), projected vs baseline comparisons. |

---

## 3. Left Navigation Rail & Alert Drawer
- **Collapsible Left Nav Rail**: Compact icon rail with expandable text mode, tooltips, active state pill indicator with smooth Framer Motion transitions.
- **Top Command HUD**: Displays plant status (`PLANT: ONLINE | DEGRADED | CRITICAL`), active scenario dropdown `[Normal Operation ▼]`, UTC clock, and slide-over **Notification Drawer** button (`ALERTS [3]`).

---

## 4. 3D Digital Twin Engine Guidelines
- **Realistic Industrial Assets**:
  - `M01`: 5-Axis CNC Milling Center with worktable and tool turret.
  - `M02`: 400-Ton Hydraulic Stamping Press with dual heavy pillars and ram.
  - `M03`: Rotary Screw Air Compressor with twin-screw casing and pressure vessel.
  - `M04`: Hydraulic Power Distribution Unit with reservoir tank and accumulator.
  - `M05`: Plastic Injection Molder with heated barrel and tie-bar clamp.
  - `M06`: Industrial HVAC Chiller with condenser coils and compressor dome.
  - `M07`: Exhaust & Scrubber Blower with centrifugal volute and ducting.
  - `M08`: Variable Frequency Conveyor with roller bed and product pallets.
  - `M09`: Induction Annealer with electromagnetic coil chamber.
  - `M10`: Robotic Pick & Pack Palletizer with 6-axis articulated arm and safety fence.
- **Camera Presets**: `OVERVIEW (Isometric)`, `BAY 1 - NORTH (M01-M03)`, `CENTRAL FORGE (M02, M04)`, `BAY 2 - EAST (M05, M06)`, `UTILITY LOFT (M07, M08, M09, M10)`.
- **Interactive Contextual HUD**: Clicking any machine smoothly interpolates the camera to that machine, illuminates its localized beacon, and renders a floating contextual telemetry card with quick access to full diagnostic workspace.
