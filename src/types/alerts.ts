export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertCategory = 'thermal' | 'vibration' | 'electrical' | 'efficiency' | 'connectivity';

export interface AlertItem {
  id: string;
  machineId: string;
  machineName: string;
  timestamp: number;
  lastUpdated: number;
  count: number; // For grouping repeated events
  severity: AlertSeverity;
  category: AlertCategory;
  parameter: string; // e.g., 'Vibration RMS', 'Winding Temp', 'Power Factor'
  currentValue: number | string;
  baselineValue: number | string;
  unit: string;
  deviationPercent: number;
  message: string;
  suggestedAction: string;
  acknowledged: boolean;
  active: boolean;
}
