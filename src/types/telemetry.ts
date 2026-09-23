export type MachineStatus = 'normal' | 'warning' | 'critical' | 'offline';
export type ConnectionState = 'connected' | 'delayed' | 'stale' | 'offline';
export type ProductionPriority = 'critical' | 'high' | 'medium' | 'low';

export interface MachineTelemetry {
  machineId: string;
  timestamp: number; // Unix epoch ms

  // Thermal & Mechanical
  temperature: number; // °C
  vibrationRms: number; // mm/s
  noise: number; // dB
  rpm: number; // RPM

  // Electrical & Power
  current: number; // Amperes (A)
  voltage: number; // Volts (V)
  powerFactor: number; // 0.00 - 1.00
  activePower: number; // kW
  reactivePower: number; // kVAR
  energyConsumption: number; // Cumulative kWh

  // Calculated Metrics
  machineHealth: number; // 0 - 100
  anomalyScore: number; // 0.00 - 1.00
  energyEfficiency: number; // kWh / unit production index (0 - 100%)
  utilization: number; // % (0 - 100%)

  // Status indicators
  status: MachineStatus;
  connectionState: ConnectionState;
}

export interface TelemetryHistoryPoint {
  timestamp: number;
  temperature: number;
  vibrationRms: number;
  current: number;
  voltage: number;
  powerFactor: number;
  activePower: number;
  machineHealth: number;
  anomalyScore: number;
  noise: number;
  rpm: number;
}
