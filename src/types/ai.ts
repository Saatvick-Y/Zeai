import { ProductionPriority } from './telemetry';

export interface AnomalyEvidence {
  parameter: string;
  measured: string;
  baseline: string;
  deviation: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface AIInsight {
  id: string;
  machineId: string;
  machineName: string;
  priority: ProductionPriority;
  type: 'vibration_imbalance' | 'thermal_drift' | 'energy_waste' | 'power_factor_drop' | 'predictive_bearing_wear' | 'optimal_schedule';
  title: string;
  summary: string;
  confidence: number; // 0 - 100%
  evidence: AnomalyEvidence[];
  potentialCauses: string[];
  recommendedAction: string;
  operationalImpact: {
    energyDeltaKw: number;
    estimatedCostSavings: string;
    productionRisk: 'Negligible (<1%)' | 'Low (<3%)' | 'Moderate' | 'High';
    timeToIntervention: string;
  };
  generatedAt: number;
}

export interface OptimizationScenario {
  id: string;
  name: string;
  description: string;
  actions: {
    machineId: string;
    action: string;
    delayMinutes?: number;
    powerReductionPct?: number;
    maintainProduction: boolean;
  }[];
  baselineDemandKw: number;
  projectedDemandKw: number;
  peakDemandReductionPct: number;
  energySavingsPct: number;
  productionThroughputImpactPct: number;
  machineRiskReductionPct: number;
  annualizedSavingsEstimated: number;
}
