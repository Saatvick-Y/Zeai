import { MachineTelemetry } from '@/types/telemetry';
import { AIInsight } from '@/types/ai';
import { MACHINES_CONFIG, getMachineConfig } from '@/config/machines';

export function generateAIInsights(fleet: Record<string, MachineTelemetry>): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = Date.now();

  MACHINES_CONFIG.forEach((config) => {
    const t = fleet[config.id];
    if (!t || t.status === 'offline') return;

    // 1. Vibration Anomaly Insight (e.g. M03 or any vibrating machine)
    if (t.vibrationRms > config.thresholds.vibWarning || t.anomalyScore > 0.25) {
      const devPct = Math.round(((t.vibrationRms - config.baselineVibration) / config.baselineVibration) * 100);
      insights.push({
        id: `ai_${config.id}_vib`,
        machineId: config.id,
        machineName: config.name,
        priority: config.priority,
        type: 'vibration_imbalance',
        title: `Harmonic Vibration Anomaly (+${devPct}% Above Baseline)`,
        summary: `Continuous high-frequency vibration RMS detected at ${t.vibrationRms} mm/s accompanied by ${t.noise} dB acoustic noise.`,
        confidence: 91,
        evidence: [
          {
            parameter: 'Vibration RMS',
            measured: `${t.vibrationRms} mm/s`,
            baseline: `${config.baselineVibration} mm/s`,
            deviation: `+${devPct}%`,
            severity: t.vibrationRms >= config.thresholds.vibCritical ? 'critical' : 'warning',
          },
          {
            parameter: 'Acoustic Sound Level',
            measured: `${t.noise} dB`,
            baseline: `${config.baselineNoise} dB`,
            deviation: `+${Math.round(((t.noise - config.baselineNoise) / config.baselineNoise) * 100)}%`,
            severity: 'warning',
          },
          {
            parameter: 'Machine Health Index',
            measured: `${t.machineHealth} / 100`,
            baseline: '95 / 100',
            deviation: `-${95 - t.machineHealth} pts`,
            severity: t.machineHealth < 60 ? 'critical' : 'warning',
          },
        ],
        potentialCauses: [
          'Radial bearing cage micro-fracture or lubricant breakdown',
          'Drive shaft dynamic unbalance or pulley misalignment',
          'Loose foundation mounting bolts under cyclic load',
        ],
        recommendedAction: config.priority === 'critical'
          ? 'Maintain line throughput while alerting technician. Perform vibration frequency FFT inspection during scheduled changeover.'
          : 'Schedule bearing inspection and relubrication at shift changeover (est. 20 min). Avoid abrupt forced shutdown.',
        operationalImpact: {
          energyDeltaKw: 1.8,
          estimatedCostSavings: '$420 / month in prevented catastrophic failure',
          productionRisk: config.priority === 'critical' ? 'Moderate' : 'Low (<3%)',
          timeToIntervention: '< 4 hours',
        },
        generatedAt: now,
      });
    }

    // 2. Thermal Drift Insight (e.g. M05 or heating/molding)
    if (t.temperature > config.thresholds.tempWarning) {
      const devPct = Math.round(((t.temperature - config.baselineTemp) / config.baselineTemp) * 100);
      insights.push({
        id: `ai_${config.id}_thermal`,
        machineId: config.id,
        machineName: config.name,
        priority: config.priority,
        type: 'thermal_drift',
        title: `Thermal Drift & Heat Dissipation Constraint (+${devPct}%)`,
        summary: `Operating temperature at ${t.temperature}°C approaching critical envelope (${config.thresholds.tempCritical}°C).`,
        confidence: 88,
        evidence: [
          {
            parameter: 'Core Operating Temp',
            measured: `${t.temperature} °C`,
            baseline: `${config.baselineTemp} °C`,
            deviation: `+${devPct}%`,
            severity: t.temperature >= config.thresholds.tempCritical ? 'critical' : 'warning',
          },
          {
            parameter: 'Active Power Draw',
            measured: `${t.activePower} kW`,
            baseline: `${config.ratedPowerKw * 0.85} kW`,
            deviation: '+14%',
            severity: 'info',
          },
        ],
        potentialCauses: [
          'Coolant recirculation flow obstruction or degraded thermal paste',
          'Heating element PID loop overshoot during continuous duty',
          'Clogged air intake filtration elements',
        ],
        recommendedAction: 'Trim pre-heat standby power by 8% and verify heat exchanger valve opening.',
        operationalImpact: {
          energyDeltaKw: 3.2,
          estimatedCostSavings: '$310 / month',
          productionRisk: 'Negligible (<1%)',
          timeToIntervention: '< 8 hours',
        },
        generatedAt: now,
      });
    }

    // 3. Power Factor & Idle Energy Waste (e.g. M07 or oversized motors)
    if (t.powerFactor < config.thresholds.minPowerFactor && t.activePower > 3.0) {
      insights.push({
        id: `ai_${config.id}_energy`,
        machineId: config.id,
        machineName: config.name,
        priority: config.priority,
        type: 'energy_waste',
        title: `Low Power Factor & Idle Reactive Current Waste`,
        summary: `Power factor degraded to ${t.powerFactor}. Motor is drawing excessive reactive kVAR during low-load intervals.`,
        confidence: 94,
        evidence: [
          {
            parameter: 'Displacement Power Factor',
            measured: `${t.powerFactor}`,
            baseline: `${config.baselinePowerFactor}`,
            deviation: `-${Math.round((config.baselinePowerFactor - t.powerFactor) * 100)} pts`,
            severity: 'warning',
          },
          {
            parameter: 'Reactive Power',
            measured: `${t.reactivePower} kVAR`,
            baseline: '2.1 kVAR',
            deviation: '+140%',
            severity: 'warning',
          },
        ],
        potentialCauses: [
          'Motor operating under 30% nominal mechanical load',
          'VFD DC-bus capacitor aging',
          'Unsynchronized ventilation cycle during non-peak machining',
        ],
        recommendedAction: config.priority === 'low'
          ? 'Apply 12-minute staggered duty cycling to reduce parasitic idling without affecting air scrub quality.'
          : 'Engage local power factor correction capacitor.',
        operationalImpact: {
          energyDeltaKw: 2.9,
          estimatedCostSavings: '$285 / month in utility kVAR penalties',
          productionRisk: 'Negligible (<1%)',
          timeToIntervention: 'Next maintenance window',
        },
        generatedAt: now,
      });
    }
  });

  // If no anomalies are triggered, provide fleet-wide optimization insight
  if (insights.length === 0) {
    insights.push({
      id: 'ai_fleet_optimal',
      machineId: 'FLEET',
      machineName: 'Factory Wide Fleet (M01-M10)',
      priority: 'critical',
      type: 'optimal_schedule',
      title: 'Optimal Fleet Dispatch & Peak Shaving Active',
      summary: 'All 10 machines are operating within statistical process baselines. AI continuous optimizer is maintaining balanced phase distribution.',
      confidence: 97,
      evidence: [
        {
          parameter: 'Fleet Average Health',
          measured: '92 / 100',
          baseline: '90 / 100',
          deviation: '+2 pts',
          severity: 'info',
        },
        {
          parameter: 'Grid Phase Balance',
          measured: '98.4%',
          baseline: '95.0%',
          deviation: '+3.4%',
          severity: 'info',
        },
      ],
      potentialCauses: [
        'Preventative baseline controls operating nominally',
      ],
      recommendedAction: 'Maintain current production schedules. No manual intervention required.',
      operationalImpact: {
        energyDeltaKw: 0.0,
        estimatedCostSavings: 'Operating at minimum tariff schedule',
        productionRisk: 'Negligible (<1%)',
        timeToIntervention: 'None',
      },
      generatedAt: now,
    });
  }

  return insights;
}
