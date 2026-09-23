import { MachineTelemetry, TelemetryHistoryPoint } from '@/types/telemetry';
import { ScenarioId } from '../simulation/scenarios';

export type TelemetryCallback = (telemetry: MachineTelemetry) => void;
export type FleetTelemetryCallback = (fleetMap: Record<string, MachineTelemetry>) => void;

export interface ITelemetryProvider {
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(callback: TelemetryCallback): () => void;
  subscribeFleet(callback: FleetTelemetryCallback): () => void;
  getLatestTelemetry(machineId: string): MachineTelemetry | undefined;
  getAllLatest(): Record<string, MachineTelemetry>;
  getHistory(machineId: string, limitPoints?: number): TelemetryHistoryPoint[];
  setScenario(scenario: ScenarioId): void;
  getScenario(): ScenarioId;
  setSimulationSpeed(speedMultiplier: number): void;
  getSimulationSpeed(): number;
  pause(): void;
  resume(): void;
  isPaused(): boolean;
  resetAll(): void;
  injectAnomaly(machineId: string, anomalyType: 'vibration' | 'thermal' | 'power_factor' | 'packet_drop'): void;
}
