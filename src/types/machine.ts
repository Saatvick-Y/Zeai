import { ProductionPriority } from './telemetry';

export interface MachineThresholds {
  tempWarning: number;
  tempCritical: number;
  vibWarning: number;
  vibCritical: number;
  currentMax: number;
  minPowerFactor: number;
}

export interface MachineConfig {
  id: string; // 'M01' - 'M10'
  name: string;
  type: string;
  category: 'milling' | 'stamping' | 'compressor' | 'hydraulic' | 'molding' | 'chiller' | 'blower' | 'conveyor' | 'heating' | 'robotics';
  line: string;
  location: string;
  priority: ProductionPriority;
  ratedPowerKw: number;
  ratedVoltage: number;
  ratedCurrent: number;
  ratedRpm: number;
  
  // Baselines for anomaly detection
  baselineTemp: number; // °C
  baselineVibration: number; // mm/s
  baselineCurrent: number; // A
  baselineNoise: number; // dB
  baselinePowerFactor: number;
  
  thresholds: MachineThresholds;
  
  // Logical Floor Map Coordinates (Row, Col)
  mapPosition: {
    row: number;
    col: number;
  };
}
