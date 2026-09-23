import { MachineConfig } from '@/types/machine';
import { MachineTelemetry, MachineStatus, ConnectionState } from '@/types/telemetry';
import { calculateMachineHealth } from '../calculations/healthScore';
import { ScenarioId } from './scenarios';

export interface MachineInternalState {
  currentTemp: number;
  targetTemp: number;
  currentVibration: number;
  targetVibration: number;
  currentCurrent: number;
  powerFactor: number;
  cumulativeKwh: number;
  noiseDb: number;
  rpm: number;
  lastHeartbeatTs: number;
  customAnomalyActive: boolean;
  forcedStatus?: MachineStatus;
  packetDropMode?: boolean;
}

export class IndustrialPhysicsEngine {
  private states: Map<string, MachineInternalState> = new Map();
  private stepCount: number = 0;

  constructor(configs: MachineConfig[]) {
    configs.forEach((cfg) => {
      this.states.set(cfg.id, {
        currentTemp: cfg.baselineTemp + (Math.random() - 0.5) * 2,
        targetTemp: cfg.baselineTemp,
        currentVibration: cfg.baselineVibration + (Math.random() - 0.5) * 0.2,
        targetVibration: cfg.baselineVibration,
        currentCurrent: cfg.baselineCurrent,
        powerFactor: cfg.baselinePowerFactor,
        cumulativeKwh: 120 + Math.random() * 300,
        noiseDb: cfg.baselineNoise,
        rpm: cfg.ratedRpm,
        lastHeartbeatTs: Date.now(),
        customAnomalyActive: false,
      });
    });
  }

  public tick(
    config: MachineConfig,
    activeScenario: ScenarioId,
    dtSeconds: number = 1.0,
    currentTimeMs: number = Date.now()
  ): MachineTelemetry {
    let state = this.states.get(config.id);
    if (!state) {
      state = {
        currentTemp: config.baselineTemp,
        targetTemp: config.baselineTemp,
        currentVibration: config.baselineVibration,
        targetVibration: config.baselineVibration,
        currentCurrent: config.baselineCurrent,
        powerFactor: config.baselinePowerFactor,
        cumulativeKwh: 150,
        noiseDb: config.baselineNoise,
        rpm: config.ratedRpm,
        lastHeartbeatTs: currentTimeMs,
        customAnomalyActive: false,
      };
      this.states.set(config.id, state);
    }

    this.stepCount++;
    const t = this.stepCount * 0.1;

    // Base noise and sinusoidal harmonic variations
    const cycleFactor = 1.0 + 0.04 * Math.sin(t * 0.5 + config.id.charCodeAt(1));
    const smallNoise = (Math.random() - 0.5) * 0.02;

    let targetTemp = config.baselineTemp * cycleFactor;
    let targetVib = config.baselineVibration * cycleFactor;
    let targetCurrent = config.baselineCurrent * cycleFactor;
    let targetPf = config.baselinePowerFactor;
    let targetNoise = config.baselineNoise;
    let isStaleSimulated = false;

    // Apply Scenario Injections
    switch (activeScenario) {
      case 'm03_vibration':
        if (config.id === 'M03') {
          targetVib = 5.82 + Math.sin(t * 2) * 0.45; // Spike vibration +86%
          targetNoise = 86.5 + Math.random() * 2; // High acoustic screech
          targetTemp = 67.5 + Math.sin(t * 0.2) * 1.5; // Bearing friction heating
        }
        break;

      case 'm05_overheat':
        if (config.id === 'M05') {
          targetTemp = 89.8 + Math.sin(t * 0.3) * 3.0; // Thermal runaway
          targetCurrent = config.baselineCurrent * 1.18; // Heating coil current draw
        }
        break;

      case 'm07_energy_waste':
        if (config.id === 'M07') {
          targetCurrent = config.baselineCurrent * 1.45; // High continuous idle
          targetPf = 0.65 - Math.random() * 0.05; // Terrible power factor
          targetNoise = 82.0;
        }
        break;

      case 'peak_demand':
        if (config.id === 'M02' || config.id === 'M09' || config.id === 'M05') {
          targetCurrent = config.ratedCurrent * 1.08; // High load simultaneously
          targetTemp = config.baselineTemp * 1.15;
        }
        break;

      case 'multi_anomaly':
        if (config.id === 'M03') {
          targetVib = 5.65 + Math.sin(t * 2) * 0.4;
          targetNoise = 85.0;
        }
        if (config.id === 'M05') {
          targetTemp = 88.5 + Math.sin(t * 0.4) * 2.5;
        }
        if (config.id === 'M07') {
          targetPf = 0.68;
          targetCurrent = config.baselineCurrent * 1.35;
        }
        break;

      case 'stale_communication':
        if (config.id === 'M04') {
          isStaleSimulated = true;
        }
        break;

      case 'normal':
      default:
        // Nominal steady state
        break;
    }

    // Thermal inertia damping: temperatures change gradually
    state.currentTemp += (targetTemp - state.currentTemp) * Math.min(1.0, 0.08 * dtSeconds) + (Math.random() - 0.5) * 0.1;
    // Vibration responds faster with dynamic mechanical jitter
    state.currentVibration += (targetVib - state.currentVibration) * Math.min(1.0, 0.25 * dtSeconds) + (Math.random() - 0.5) * 0.08;
    state.currentVibration = Math.max(0.1, state.currentVibration);

    // Current & Power factor
    state.currentCurrent += (targetCurrent - state.currentCurrent) * Math.min(1.0, 0.3 * dtSeconds) + (Math.random() - 0.5) * 0.15;
    state.powerFactor = Math.max(0.5, Math.min(0.99, targetPf + smallNoise));

    // Electrical equations: 3-Phase Active Power P = sqrt(3) * V * I * PF / 1000
    const voltage = 400 + (Math.random() - 0.5) * 4.0; // 400V 3-phase grid
    const activePowerKw = Math.max(0.1, (Math.sqrt(3) * voltage * state.currentCurrent * state.powerFactor) / 1000.0);
    const reactivePowerKvar = activePowerKw * Math.tan(Math.acos(state.powerFactor));

    // Monotonic Energy Integration: kWh = kW * dt(hours)
    const dtHours = dtSeconds / 3600.0;
    state.cumulativeKwh += activePowerKw * dtHours;

    // RPM & Noise
    state.noiseDb = Math.max(40, targetNoise + (Math.random() - 0.5) * 1.2);
    state.rpm = config.ratedRpm > 0 ? Math.round(config.ratedRpm * (1 + (Math.random() - 0.5) * 0.015)) : 0;

    // Calculate Health & Anomaly metrics
    const healthResult = calculateMachineHealth(config, {
      temperature: state.currentTemp,
      vibrationRms: state.currentVibration,
      currentAmps: state.currentCurrent,
      powerFactor: state.powerFactor,
      activePower: activePowerKw,
    });

    // Connection State Logic:
    let connectionState: ConnectionState = 'connected';
    if (isStaleSimulated) {
      connectionState = 'stale';
    } else if (state.forcedStatus === 'offline') {
      connectionState = 'offline';
    }

    // Machine Status Logic:
    let status: MachineStatus = 'normal';
    if (connectionState === 'offline' || state.forcedStatus === 'offline') {
      status = 'offline';
    } else if (
      state.currentTemp >= config.thresholds.tempCritical ||
      state.currentVibration >= config.thresholds.vibCritical ||
      healthResult.overallScore < 50
    ) {
      status = 'critical';
    } else if (
      state.currentTemp >= config.thresholds.tempWarning ||
      state.currentVibration >= config.thresholds.vibWarning ||
      state.powerFactor < config.thresholds.minPowerFactor ||
      healthResult.overallScore < 78
    ) {
      status = 'warning';
    }

    // Energy Efficiency Index: ratio of useful work to consumed power
    const theoreticalMinKw = (config.ratedPowerKw * 0.7);
    const energyEfficiency = Math.max(50, Math.min(99, Math.round((theoreticalMinKw / Math.max(1, activePowerKw)) * 95)));

    return {
      machineId: config.id,
      timestamp: currentTimeMs,
      temperature: Number(state.currentTemp.toFixed(1)),
      vibrationRms: Number(state.currentVibration.toFixed(2)),
      noise: Number(state.noiseDb.toFixed(1)),
      rpm: state.rpm,
      current: Number(state.currentCurrent.toFixed(1)),
      voltage: Number(voltage.toFixed(1)),
      powerFactor: Number(state.powerFactor.toFixed(2)),
      activePower: Number(activePowerKw.toFixed(1)),
      reactivePower: Number(reactivePowerKvar.toFixed(1)),
      energyConsumption: Number(state.cumulativeKwh.toFixed(2)),
      machineHealth: healthResult.overallScore,
      anomalyScore: healthResult.anomalyScore,
      energyEfficiency,
      utilization: Math.min(98, Math.round((activePowerKw / config.ratedPowerKw) * 100)),
      status,
      connectionState,
    };
  }

  public resetMachineState(config: MachineConfig) {
    this.states.set(config.id, {
      currentTemp: config.baselineTemp,
      targetTemp: config.baselineTemp,
      currentVibration: config.baselineVibration,
      targetVibration: config.baselineVibration,
      currentCurrent: config.baselineCurrent,
      powerFactor: config.baselinePowerFactor,
      cumulativeKwh: 150,
      noiseDb: config.baselineNoise,
      rpm: config.ratedRpm,
      lastHeartbeatTs: Date.now(),
      customAnomalyActive: false,
    });
  }
}
