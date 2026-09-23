# ESPADA: Industrial Digital-Twin & Operations Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.23-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.183-blue?style=flat&logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![ECharts](https://img.shields.io/badge/Apache_ECharts-5.6-red?style=flat&logo=apache-echarts)](https://echarts.apache.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-green?style=flat&logo=vitest)](https://vitest.dev/)

**ESPADA** is a mission-critical AI-driven industrial energy optimization and machine health digital-twin command platform. Designed with progressive disclosure, spatial 3D navigation, and deep telemetry diagnostics across 10 industrial production assets (**M01 through M10**).

---

## 🌟 Key Highlights & Features

### 1. Level 1: Command Center (`/`)
- **65% Viewport 3D Factory Floor**: Interactive procedural Three.js digital twin with realistic models for all 10 machines (CNC 5-axis mills, 400-ton hydraulic stamping presses, rotary screw compressors, injection molders, robotic packaging cells, and exhaust scrubbers).
- **Interactive Click-to-Focus HUD**: Clicking any machine in 3D smoothly animates the camera, activates localized status beacon lighting, and opens a contextual telemetry card with deep drill-down actions.
- **Top Command Strip & Immediate Attention Bar**: Displays only high-level plant demand kW, fleet health, active machine counts, and urgent threshold violations.

### 2. Level 2: Fullscreen Factory Digital Twin (`/twin`)
- Fullscreen spatial digital twin with layer overlays: **Physical Geometry**, **Thermal Heat Map**, **Vibration Severity**, and **Energy Demand Intensity**.
- Pre-configured camera angles (`OVERVIEW`, `BAY 1 NORTH`, `CENTRAL FORGE`, `BAY 2 EAST`, `UTILITY LOFT`).

### 3. Level 3: Machine Intelligence Workspaces (`/machines`, `/machines/[id]`)
- **Machine Dropdown Selector**: Instant asset switching (`[M03 - Rotary Compressor ▼]`) without navigating back to a directory.
- **5 Focused Tabs**:
  - *Overview*: Health score, active power, energy efficiency %, and baseline comparisons.
  - *Live Telemetry*: Multi-channel waveform stream with a **Primary Signal Selector** (`Active Power`, `Temperature`, `Vibration RMS`, `Current`) and customizable time windows (`60s`, `5m`, `1h`, `24h`).
  - *Health Decomposition*: Thermal (30%), Mechanical (35%), Electrical (20%), Efficiency (15%).
  - *Energy Profile*: Cumulative kWh, reactive kVAR, and phase voltage.
  - *AI Diagnostics*: Neural evidence deconstruction and condition recommendations.

### 4. Level 4: Energy Intelligence & Load Topology (`/energy`)
- **3-Tier Plant Energy Flow Diagram**: Live energy path from the 11kV Plant Substation through 3 production bays down to individual machines.
- **Time-Series Energy Intensity Heatmap**: Machine vs Time heat matrix with customizable time resolution (`1h`, `6h`, `24h`, `7d`).
- **4-Quadrant Health vs Active Power Demand Scatter Matrix**: Isolates high-energy + degrading machines requiring immediate operational review.

### 5. Level 5: Machine Health & Condition Ranking (`/health`)
- Fleet-wide condition-based maintenance ranking table sorting machines by health risk with live vibration harmonics and thermal drift indicators.

### 6. Level 6: AI Neural Insights (`/ai`)
- Evidence-based reasoning feed explaining symptoms, empirical measured vs baseline deviations, root cause hypotheses, and production-priority aware recommendations.

### 7. Level 7: Optimization & Shift Dispatch Simulator (`/optimization`)
- **Visual Shift Dispatch Timeline**: Visual scheduling steps (e.g. `08:00 M01 Full Throughput`, `08:10 M03 Bearing Inspection`, `08:22 M07 Staggered Start`, `08:35 M05 Standby Trim`).
- **3-Column Comparative Board**: Measured Baseline vs AI Dispatch vs Projected Post-Dispatch (Peak demand shaved by **-14.3%**, energy reduced by **-8.7%**, with **<0.4% production risk**).

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **3D Graphics**: Three.js WebGL procedural shaders & OrbitControls
- **Charts**: Apache ECharts (`echarts`, `echarts-for-react`)
- **Data Engine**: Decoupled `TelemetryProvider` with multi-variable physics & thermodynamics simulation
- **Testing**: Vitest (`npm run test`)

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Saatvick-Y/Zeai.git
cd Zeai
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Run Automated Tests
```bash
npm run test
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## ⚙️ Monitored Assets (M01 – M10)

| ID | Name | Line / Cell | Priority | Rated kW | Baseline Temp | Baseline Vib |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **M01** | 5-Axis CNC Milling Center | Machining Cell Alpha | Critical | 15.0 kW | 50.0 °C | 2.0 mm/s |
| **M02** | 400-Ton Hydraulic Stamping Press | Press Line 01 | Critical | 22.0 kW | 55.0 °C | 2.8 mm/s |
| **M03** | Rotary Screw Air Compressor | Utility Support Line | High | 18.5 kW | 60.0 °C | 3.0 mm/s |
| **M04** | Hydraulic Power Distribution Unit | Hydraulics Core | High | 12.0 kW | 48.0 °C | 1.8 mm/s |
| **M05** | Electric Plastic Injection Molder | Polymer Extrusion 02 | Medium | 25.0 kW | 72.0 °C | 2.2 mm/s |
| **M06** | Industrial HVAC Chiller Plant | Climate & Process Cooling | Medium | 16.0 kW | 42.0 °C | 1.5 mm/s |
| **M07** | Fume Exhaust & Scrubbing Blower | Environmental Scrubber | Low | 8.5 kW | 45.0 °C | 2.1 mm/s |
| **M08** | Main Assembly Infeed Conveyor | Assembly Transit Line | High | 5.5 kW | 38.0 °C | 1.2 mm/s |
| **M09** | High-Frequency Induction Annealer | Heat Treatment Cell | Medium | 30.0 kW | 68.0 °C | 0.8 mm/s |
| **M10** | Robotic Pick & Pack Palletizer | Packaging Outfeed | Low | 4.2 kW | 36.0 °C | 0.9 mm/s |

---

## 📜 License
MIT License. Developed for Industrial Energy Optimization & Predictive Maintenance.
