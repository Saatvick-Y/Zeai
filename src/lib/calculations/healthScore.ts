import { MachineConfig } from '@/types/machine';

export interface HealthBreakdown {
  overallScore: number; // 0 - 100
  anomalyScore: number; // 0.00 - 1.00
  thermalHealth: number; // 0 - 100
  mechanicalHealth: number; // 0 - 100
  electricalHealth: number; // 0 - 100
  efficiencyHealth: number; // 0 - 100
  primaryRiskFactor: string;
}

export function calculateMachineHealth(
  config: MachineConfig,
  current: {
    temperature: number;
    vibrationRms: number;
    currentAmps: number;
    powerFactor: number;
    activePower: number;
  }
): HealthBreakdown {
  // 1. Thermal Health (Weight: 30%)
  const tempDelta = Math.max(0, current.temperature - config.baselineTemp);
  const tempMaxAllowedDelta = config.thresholds.tempCritical - config.baselineTemp;
  const thermalRatio = Math.min(1.5, tempDelta / (tempMaxAllowedDelta || 1));
  const thermalHealth = Math.max(0, Math.min(100, 100 - thermalRatio * 75));

  // 2. Mechanical / Vibration Health (Weight: 35%)
  const vibDelta = Math.max(0, current.vibrationRms - config.baselineVibration);
  const vibMaxAllowedDelta = config.thresholds.vibCritical - config.baselineVibration;
  const vibRatio = Math.min(2.0, vibDelta / (vibMaxAllowedDelta || 1));
  const mechanicalHealth = Math.max(0, Math.min(100, 100 - vibRatio * 85));

  // 3. Electrical Stress Health (Weight: 20%)
  const currentOverloadRatio = Math.max(0, (current.currentAmps - config.ratedCurrent) / config.ratedCurrent);
  const electricalHealth = Math.max(0, Math.min(100, 100 - currentOverloadRatio * 150));

  // 4. Power Factor / Efficiency Health (Weight: 15%)
  const pfDeficit = Math.max(0, config.baselinePowerFactor - current.powerFactor);
  const efficiencyHealth = Math.max(0, Math.min(100, 100 - pfDeficit * 200));

  // Weighted Overall Health Score (0 - 100)
  const overallScore = Math.round(
    thermalHealth * 0.30 +
    mechanicalHealth * 0.35 +
    electricalHealth * 0.20 +
    efficiencyHealth * 0.15
  );

  // Anomaly Score (0.00 to 1.00)
  const anomalyScore = Number((Math.max(0, (100 - overallScore) / 100)).toFixed(2));

  // Determine Primary Risk Factor
  let primaryRiskFactor = 'Optimal Condition';
  const lowest = Math.min(thermalHealth, mechanicalHealth, electricalHealth, efficiencyHealth);
  if (lowest < 80) {
    if (lowest === mechanicalHealth) primaryRiskFactor = 'Vibration & Mechanical Imbalance';
    else if (lowest === thermalHealth) primaryRiskFactor = 'Thermal Elevation / Overheating';
    else if (lowest === electricalHealth) primaryRiskFactor = 'Current Overload / Phase Stress';
    else primaryRiskFactor = 'Power Factor Degradation';
  }

  return {
    overallScore,
    anomalyScore,
    thermalHealth: Math.round(thermalHealth),
    mechanicalHealth: Math.round(mechanicalHealth),
    electricalHealth: Math.round(electricalHealth),
    efficiencyHealth: Math.round(efficiencyHealth),
    primaryRiskFactor,
  };
}
