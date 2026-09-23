import { ProductionPriority } from './telemetry';

export interface MachineEnergyProfile {
  machineId: string;
  name: string;
  line: string;
  priority: ProductionPriority;
  activePowerKw: number;
  energyConsumedTodayKwh: number;
  efficiencyIndex: number; // 0 - 100%
  healthScore: number;
  powerFactor: number;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  peakContributionKw: number;
}

export interface EnergyOverviewMetrics {
  totalDemandKw: number;
  peakDemandTodayKw: number;
  peakDemandTime: string;
  averageDemandKw: number;
  energyTodayKwh: number;
  energyThisWeekKwh: number;
  fleetEfficiencyPct: number;
  estimatedMonthlyCostSavings: number;
  gridCarbonIntensityGCo2Kwh: number;
  powerFactorAverage: number;
}
