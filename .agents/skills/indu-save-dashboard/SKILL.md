---
name: indu-save-dashboard
description: Lead software architecture, UI/UX design, telemetry engine, and AI decision support guidelines for INDU-SAVE Industrial Energy & Machine Intelligence Platform.
---

# INDU-SAVE: Industrial Energy & Machine Intelligence Architecture & UI Guidelines

## 1. System Overview & Core Objective
INDU-SAVE is an industrial command-center and AI-driven decision-support platform designed for real-time telemetry from up to 10 industrial machines (M01 to M10) equipped with modular ESP32 edge sensors via RS-485 to Gateway to Cloud.

### Core Philosophy: Holistic Production-Aware Decision Support
The platform unites:
1. **Energy Monitoring & Peak Demand Management** (Active Power kW, Power Factor, Voltage, Current, kWh, Peak Load).
2. **Machine Health & Predictive Maintenance** (Temperature, Vibration RMS, Noise dB, RPM, Anomaly Scores, Baseline Drift).
3. **Production Priority Constraints** (Critical, High, Medium, Low priority lines).
4. **AI Reasoning & Optimization Simulation** (Simulate projected demand reductions and risk mitigation before applying actions).

> **Rule:** Never recommend blunt shutdowns of critical machinery during peak pricing if machine health is sound and production priority is critical. Optimization recommendations must weigh health + energy + production priority + operational risk.

---

## 2. Design System & Aesthetics (Industrial Command Center)
- **Aesthetic**: Deep industrial dark mode (slate/zinc `hsl(222, 47%, 11%)` to `hsl(224, 71%, 4%)`), high information density, crisp typography, clean borders (`hsl(217, 33%, 17%)`).
- **No Gimmicks**: Avoid generic SaaS templates, bloated hero sections, cryptocurrency styles, rainbow gradients, and excessive neon glassmorphism.
- **Semantic Status Hierarchy**:
  - **NORMAL (Green)**: `text-emerald-400`, `bg-emerald-500/10`, `border-emerald-500/30`
  - **WARNING (Amber)**: `text-amber-400`, `bg-amber-500/10`, `border-amber-500/30`
  - **CRITICAL (Red)**: `text-rose-400`, `bg-rose-500/10`, `border-rose-500/30`
  - **OFFLINE (Slate/Muted)**: `text-slate-400`, `bg-slate-800/40`, `border-slate-700`
  - **STALE / DELAYED (Orange/Yellow Accent)**: Telemetry delayed (3s) vs Telemetry Stale (30s). Missing packets ≠ immediate machine failure.
- **Typography**: Precision monospace (`Fira Code` / `JetBrains Mono`) for telemetry values, coordinates, and metrics; clean sans-serif (`Inter` / `Fira Sans`) for navigation and narrative evidence.
- **Icons**: Lucide icons exclusively. No emojis as operational icons.

---

## 3. Data Model & Telemetry Contract
Every machine produces structured `MachineTelemetry`:
```typescript
export type MachineStatus = 'normal' | 'warning' | 'critical' | 'offline';
export type ConnectionState = 'connected' | 'delayed' | 'stale' | 'offline';
export type ProductionPriority = 'critical' | 'high' | 'medium' | 'low';

export interface MachineTelemetry {
  machineId: string;           // 'M01' - 'M10'
  timestamp: number;           // Unix epoch ms
  temperature: number;         // °C
  vibrationRms: number;        // mm/s
  current: number;             // Amperes (A)
  voltage: number;             // Volts (V)
  powerFactor: number;         // 0.00 - 1.00
  activePower: number;         // kW
  energyConsumption: number;   // kWh cumulative
  noise: number;               // dB
  rpm: number;                 // Revolutions per minute
  machineHealth: number;       // 0 - 100 score
  anomalyScore: number;        // 0.00 - 1.00
  status: MachineStatus;
  connectionState: ConnectionState;
}
```

---

## 4. Architecture & Data Flow
```
[Physical ESP32 Gateway / WebSocket / REST]
                    │
                    ▼
     [TelemetryProvider Interface]
                    │
   ┌────────────────┴────────────────┐
   ▼                                 ▼
[MockTelemetryProvider]   [WebSocket/Mqtt Provider]
   (With Realistic Physics,
    Noise & Drift Engine)
                    │
                    ▼
     [Telemetry Store / Context]
   (Partitioned, Memoized, Sub-second)
                    │
   ┌────────────────┼────────────────┐
   ▼                ▼                ▼
[Command Center] [Machine Details] [Energy Intelligence]
   ▼                ▼                ▼
[Alert Center]   [AI Insights]    [Optimization Simulator]
```

### Key Components:
- **`TelemetryProvider` Interface**: Fully decoupled data layer supporting Mock, WebSocket, MQTT, and REST.
- **Real-Time Performance**: Partitioned updates; chart throttling; memoized machine cards; time-series buffer slicing.
- **Simulator & Demo Scenarios**:
  - Realistic time-series physics with load correlation (Current ∝ Power ∝ Temp rise; Mechanical degradation ∝ Vibration ∝ Noise ∝ Efficiency loss).
  - Injectable scenarios: Normal, M03 Vibration Anomaly, M05 Overheating, M07 Energy Waste, Peak Demand Event, Multiple Anomalies.

---

## 5. UI Views & Requirements
1. **Command Center (`/`)**: High-level operational overview, fleet KPI grid (online, warnings, total demand kW, daily kWh, fleet health), 10-machine live status cards, factory logical map, quick alert feeds.
2. **Machine Detail (`/machines/[id]`)**: Detailed telemetry gauges/charts, real-time wave/trend lines, health decomposition, baseline deviation, electrical parameters, vibration spectrum analysis, historical buffer.
3. **Energy Intelligence (`/energy`)**: Total demand kW vs time, peak period analysis, machine-by-machine energy efficiency comparison table, energy vs health 4-quadrant scatter matrix.
4. **Alert Center (`/alerts`)**: Grouped de-duplicated alerts, parameter threshold breaches, severity filters, acknowledgment actions, historical alert timeline.
5. **AI Insights & Recommendations (`/ai`)**: Anomaly detection, root cause hypothesis (with evidence & confidence), production impact calculations, predictive maintenance timeline.
6. **Optimization Simulator (`/optimization` or interactive modal/view)**: Interactive baseline vs proposed schedule comparison, peak demand shaving projection, estimated kWh & cost reduction with zero disruption to critical lines.
