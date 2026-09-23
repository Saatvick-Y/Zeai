export type ScenarioId = 
  | 'normal'
  | 'm03_vibration'
  | 'm05_overheat'
  | 'm07_energy_waste'
  | 'peak_demand'
  | 'multi_anomaly'
  | 'stale_communication';

export interface DemoScenario {
  id: ScenarioId;
  name: string;
  badge: string;
  description: string;
  targetMachines: string[];
  expectedAIAction: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'normal',
    name: 'Normal Factory Baseline',
    badge: 'OPTIMAL',
    description: 'All 10 machines operating within nominal baseline parameters. Balanced thermal, vibration, and power profiles.',
    targetMachines: [],
    expectedAIAction: 'Maintain normal schedule. No interventions required.',
  },
  {
    id: 'm03_vibration',
    name: 'M03 Rotary Compressor Vibration Anomaly',
    badge: 'MECHANICAL ANOMALY',
    description: 'Bearing wear simulation on M03 (High Priority Compressor). Vibration spikes to 5.82 mm/s (+86% over baseline), with elevated acoustic noise (85 dB).',
    targetMachines: ['M03'],
    expectedAIAction: 'Flag mechanical imbalance; recommend inspection during shift changeover rather than immediate disruptive shutdown.',
  },
  {
    id: 'm05_overheat',
    name: 'M05 Injection Molder Thermal Runaway',
    badge: 'THERMAL BREACH',
    description: 'Heater barrel thermal drift on M05 (Medium Priority). Barrel temperature rises to 89.4°C (Warning threshold: 84°C), increasing thermal stress.',
    targetMachines: ['M05'],
    expectedAIAction: 'Detect thermal anomaly; recommend pre-heat optimization and PID coil calibration.',
  },
  {
    id: 'm07_energy_waste',
    name: 'M07 Exhaust Blower Idle Energy Waste',
    badge: 'ENERGY INEFFICIENCY',
    description: 'M07 (Low Priority) operating under continuous high load with degraded Power Factor (0.68) and elevated idle parasitic power during non-peak production.',
    targetMachines: ['M07'],
    expectedAIAction: 'Recommend staggering exhaust blower operation by 12 minutes to reduce non-productive kWh.',
  },
  {
    id: 'peak_demand',
    name: 'Factory Peak Demand Grid Surge',
    badge: 'PEAK TARIFF SURGE',
    description: 'Simultaneous heavy stamping (M02) and induction annealer (M09) load surge pushing factory demand over 175 kW, threatening grid penalty thresholds.',
    targetMachines: ['M02', 'M07', 'M09', 'M10'],
    expectedAIAction: 'Execute peak-shaving: preserve Critical M01/M02, stagger Low Priority M07/M10, ramp smooth M09 to shave 18.5 kW.',
  },
  {
    id: 'multi_anomaly',
    name: 'Cascade Multi-Anomaly Test',
    badge: 'MULTI-ANOMALY',
    description: 'Simultaneous M03 mechanical vibration, M05 thermal drift, and M07 power factor drop to test holistic AI prioritization.',
    targetMachines: ['M03', 'M05', 'M07'],
    expectedAIAction: 'Prioritize by production risk and severity; generate grouped de-duplicated alerts.',
  },
  {
    id: 'stale_communication',
    name: 'M04 RS-485 Gateway Telemetry Latency',
    badge: 'TELEMETRY STALE',
    description: 'Simulates edge sensor packet drop on M04. Status transitions to "Delayed" (3s) then "Telemetry Stale" (30s). Demonstrates missing data ≠ machine breakdown.',
    targetMachines: ['M04'],
    expectedAIAction: 'Flag telemetry connection issue without erroneously reporting machine mechanical failure.',
  },
];
