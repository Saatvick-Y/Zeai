import { ITelemetryProvider, TelemetryCallback, FleetTelemetryCallback } from './TelemetryProvider';
import { MachineTelemetry, TelemetryHistoryPoint } from '@/types/telemetry';
import { MACHINES_CONFIG, getMachineConfig } from '@/config/machines';
import { IndustrialPhysicsEngine } from '../simulation/physicsEngine';
import { ScenarioId } from '../simulation/scenarios';

const MAX_HISTORY_POINTS = 300;

export class MockTelemetryProvider implements ITelemetryProvider {
  private engine: IndustrialPhysicsEngine;
  private latestMap: Record<string, MachineTelemetry> = {};
  private historyMap: Map<string, TelemetryHistoryPoint[]> = new Map();
  private subscribers: Set<TelemetryCallback> = new Set();
  private fleetSubscribers: Set<FleetTelemetryCallback> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private activeScenario: ScenarioId = 'normal';
  private speedMultiplier: number = 1.0;
  private paused: boolean = false;
  private isConnected: boolean = false;

  constructor() {
    this.engine = new IndustrialPhysicsEngine(MACHINES_CONFIG);
    this.seedInitialHistory();
  }

  private seedInitialHistory() {
    const now = Date.now();
    const seedSeconds = 60; // 60 seconds of initial historical data

    MACHINES_CONFIG.forEach((config) => {
      const historyList: TelemetryHistoryPoint[] = [];
      for (let i = seedSeconds; i >= 0; i--) {
        const pastTs = now - i * 1000;
        const packet = this.engine.tick(config, 'normal', 1.0, pastTs);
        historyList.push({
          timestamp: pastTs,
          temperature: packet.temperature,
          vibrationRms: packet.vibrationRms,
          current: packet.current,
          voltage: packet.voltage,
          powerFactor: packet.powerFactor,
          activePower: packet.activePower,
          machineHealth: packet.machineHealth,
          anomalyScore: packet.anomalyScore,
          noise: packet.noise,
          rpm: packet.rpm,
        });
        if (i === 0) {
          this.latestMap[config.id] = packet;
        }
      }
      this.historyMap.set(config.id, historyList);
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    this.isConnected = true;
    this.startLoop();
  }

  public disconnect(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isConnected = false;
  }

  private startLoop() {
    if (this.timer) clearInterval(this.timer);
    const intervalMs = Math.max(200, Math.round(1000 / this.speedMultiplier));
    
    this.timer = setInterval(() => {
      if (this.paused) return;
      this.tick();
    }, intervalMs);
  }

  private tick() {
    const now = Date.now();
    const updatedFleet: Record<string, MachineTelemetry> = {};

    MACHINES_CONFIG.forEach((config) => {
      const packet = this.engine.tick(config, this.activeScenario, 1.0 * this.speedMultiplier, now);
      this.latestMap[config.id] = packet;
      updatedFleet[config.id] = packet;

      // Append to history buffer
      let history = this.historyMap.get(config.id);
      if (!history) {
        history = [];
        this.historyMap.set(config.id, history);
      }

      history.push({
        timestamp: now,
        temperature: packet.temperature,
        vibrationRms: packet.vibrationRms,
        current: packet.current,
        voltage: packet.voltage,
        powerFactor: packet.powerFactor,
        activePower: packet.activePower,
        machineHealth: packet.machineHealth,
        anomalyScore: packet.anomalyScore,
        noise: packet.noise,
        rpm: packet.rpm,
      });

      if (history.length > MAX_HISTORY_POINTS) {
        history.shift();
      }

      // Notify single packet subscribers
      this.subscribers.forEach((cb) => {
        try {
          cb(packet);
        } catch (err) {
          console.error("Telemetry callback error", err);
        }
      });
    });

    // Notify fleet subscribers
    this.fleetSubscribers.forEach((cb) => {
      try {
        cb(updatedFleet);
      } catch (err) {
        console.error("Fleet telemetry callback error", err);
      }
    });
  }

  public subscribe(callback: TelemetryCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public subscribeFleet(callback: FleetTelemetryCallback): () => void {
    this.fleetSubscribers.add(callback);
    // Send immediate initial state
    callback(this.latestMap);
    return () => {
      this.fleetSubscribers.delete(callback);
    };
  }

  public getLatestTelemetry(machineId: string): MachineTelemetry | undefined {
    return this.latestMap[machineId];
  }

  public getAllLatest(): Record<string, MachineTelemetry> {
    return { ...this.latestMap };
  }

  public getHistory(machineId: string, limitPoints: number = 60): TelemetryHistoryPoint[] {
    const list = this.historyMap.get(machineId) || [];
    return list.slice(-limitPoints);
  }

  public setScenario(scenario: ScenarioId): void {
    this.activeScenario = scenario;
    // Trigger immediate tick to reflect scenario changes swiftly
    this.tick();
  }

  public getScenario(): ScenarioId {
    return this.activeScenario;
  }

  public setSimulationSpeed(speedMultiplier: number): void {
    this.speedMultiplier = Math.max(0.2, Math.min(10.0, speedMultiplier));
    this.startLoop();
  }

  public getSimulationSpeed(): number {
    return this.speedMultiplier;
  }

  public pause(): void {
    this.paused = true;
  }

  public resume(): void {
    this.paused = false;
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public resetAll(): void {
    this.activeScenario = 'normal';
    this.engine = new IndustrialPhysicsEngine(MACHINES_CONFIG);
    this.seedInitialHistory();
    this.tick();
  }

  public injectAnomaly(machineId: string, anomalyType: 'vibration' | 'thermal' | 'power_factor' | 'packet_drop'): void {
    const cfg = getMachineConfig(machineId);
    if (!cfg) return;

    if (anomalyType === 'vibration') this.setScenario('m03_vibration');
    else if (anomalyType === 'thermal') this.setScenario('m05_overheat');
    else if (anomalyType === 'power_factor') this.setScenario('m07_energy_waste');
    else if (anomalyType === 'packet_drop') this.setScenario('stale_communication');
  }
}

// Global singleton instance for the mock provider
let providerInstance: MockTelemetryProvider | null = null;

export function getTelemetryProvider(): MockTelemetryProvider {
  if (!providerInstance) {
    providerInstance = new MockTelemetryProvider();
    providerInstance.connect();
  }
  return providerInstance;
}
