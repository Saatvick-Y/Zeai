import { MachineTelemetry } from '@/types/telemetry';
import { MACHINES_CONFIG, getMachineConfig } from '@/config/machines';
import { MachineEnergyProfile, EnergyOverviewMetrics } from '@/types/energy';

export function calculateFleetEnergyMetrics(
  telemetryMap: Record<string, MachineTelemetry>,
  historySummary?: { peakTodayKw: number; peakTimeStr: string }
): {
  overview: EnergyOverviewMetrics;
  profiles: MachineEnergyProfile[];
} {
  let totalDemandKw = 0;
  let totalDailyKwh = 0;
  let totalPfSum = 0;
  let activeMachineCount = 0;
  let totalHealthSum = 0;

  const profiles: MachineEnergyProfile[] = MACHINES_CONFIG.map((config) => {
    const t = telemetryMap[config.id];
    const isOnline = t && t.status !== 'offline';
    const activeKw = isOnline ? t.activePower : 0;
    const dailyKwh = t ? t.energyConsumption : 0;
    const health = t ? t.machineHealth : 100;
    const pf = t ? t.powerFactor : config.baselinePowerFactor;
    const eff = t ? t.energyEfficiency : 90;

    if (isOnline) {
      totalDemandKw += activeKw;
      totalPfSum += pf;
      activeMachineCount += 1;
      totalHealthSum += health;
    }
    totalDailyKwh += dailyKwh;

    return {
      machineId: config.id,
      name: config.name,
      line: config.line,
      priority: config.priority,
      activePowerKw: Number(activeKw.toFixed(1)),
      energyConsumedTodayKwh: Number(dailyKwh.toFixed(1)),
      efficiencyIndex: Math.round(eff),
      healthScore: health,
      powerFactor: Number(pf.toFixed(2)),
      status: t ? t.status : 'offline',
      peakContributionKw: Number((activeKw * 1.08).toFixed(1)),
    };
  });

  const avgDemandKw = Number((totalDemandKw * 0.88).toFixed(1));
  const peakKw = historySummary ? Math.max(historySummary.peakTodayKw, totalDemandKw) : totalDemandKw * 1.15;
  const avgPf = activeMachineCount > 0 ? totalPfSum / activeMachineCount : 0.92;
  const avgHealth = activeMachineCount > 0 ? totalHealthSum / activeMachineCount : 90;

  // Estimated savings based on peak shaving and energy efficiency
  const estimatedSavings = Math.round(totalDemandKw * 24 * 0.12 * 30 * 0.09); // in USD

  const overview: EnergyOverviewMetrics = {
    totalDemandKw: Number(totalDemandKw.toFixed(1)),
    peakDemandTodayKw: Number(peakKw.toFixed(1)),
    peakDemandTime: historySummary?.peakTimeStr || '14:25:00',
    averageDemandKw: avgDemandKw,
    energyTodayKwh: Number(totalDailyKwh.toFixed(1)),
    energyThisWeekKwh: Number((totalDailyKwh * 6.4).toFixed(1)),
    fleetEfficiencyPct: Math.round(avgHealth * 0.95),
    estimatedMonthlyCostSavings: estimatedSavings,
    gridCarbonIntensityGCo2Kwh: 412, // Average industrial grid baseline
    powerFactorAverage: Number(avgPf.toFixed(2)),
  };

  return { overview, profiles };
}
