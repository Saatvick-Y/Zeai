'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { MachineTelemetry, TelemetryHistoryPoint } from '@/types/telemetry';
import { AlertItem } from '@/types/alerts';
import { AIInsight } from '@/types/ai';
import { EnergyOverviewMetrics, MachineEnergyProfile } from '@/types/energy';
import { OptimizationResult } from '@/lib/calculations/optimizationEngine';
import { getTelemetryProvider } from '@/lib/telemetry/MockTelemetryProvider';
import { ScenarioId } from '@/lib/simulation/scenarios';
import { AlertManager } from '@/lib/calculations/alertGenerator';
import { generateAIInsights } from '@/lib/calculations/aiInsightsGenerator';
import { calculateFleetEnergyMetrics } from '@/lib/calculations/energyAnalytics';
import { runOptimizationSimulation } from '@/lib/calculations/optimizationEngine';

interface TelemetryContextType {
  fleet: Record<string, MachineTelemetry>;
  activeScenario: ScenarioId;
  setScenario: (scenario: ScenarioId) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  isPaused: boolean;
  togglePause: () => void;
  resetSimulation: () => void;
  alerts: AlertItem[];
  acknowledgeAlert: (alertId: string) => void;
  aiInsights: AIInsight[];
  energyMetrics: {
    overview: EnergyOverviewMetrics;
    profiles: MachineEnergyProfile[];
  };
  optimizationResult: OptimizationResult;
  getMachineHistory: (machineId: string, limit?: number) => TelemetryHistoryPoint[];
  injectAnomaly: (machineId: string, type: 'vibration' | 'thermal' | 'power_factor' | 'packet_drop') => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const alertManager = new AlertManager();

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const provider = useMemo(() => getTelemetryProvider(), []);

  const [fleet, setFleet] = useState<Record<string, MachineTelemetry>>(() => provider.getAllLatest());
  const [activeScenario, setActiveScenarioState] = useState<ScenarioId>(() => provider.getScenario());
  const [simulationSpeed, setSimulationSpeedState] = useState<number>(() => provider.getSimulationSpeed());
  const [isPaused, setIsPaused] = useState<boolean>(() => provider.isPaused());
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  // Subscribe to real-time fleet stream
  useEffect(() => {
    const unsubscribe = provider.subscribeFleet((updatedFleet) => {
      setFleet({ ...updatedFleet });

      // Generate processed alerts & insights
      const currentAlerts = alertManager.processFleetTelemetry(updatedFleet);
      setAlerts([...currentAlerts]);

      const insights = generateAIInsights(updatedFleet);
      setAiInsights(insights);
    });

    return () => {
      unsubscribe();
    };
  }, [provider]);

  const setScenario = useCallback((scenario: ScenarioId) => {
    provider.setScenario(scenario);
    setActiveScenarioState(scenario);
  }, [provider]);

  const setSimulationSpeed = useCallback((speed: number) => {
    provider.setSimulationSpeed(speed);
    setSimulationSpeedState(speed);
  }, [provider]);

  const togglePause = useCallback(() => {
    if (provider.isPaused()) {
      provider.resume();
      setIsPaused(false);
    } else {
      provider.pause();
      setIsPaused(true);
    }
  }, [provider]);

  const resetSimulation = useCallback(() => {
    alertManager.clearAll();
    provider.resetAll();
    setActiveScenarioState('normal');
    setIsPaused(false);
  }, [provider]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    alertManager.acknowledgeAlert(alertId);
    setAlerts([...alertManager.processFleetTelemetry(fleet)]);
  }, [fleet]);

  const getMachineHistory = useCallback((machineId: string, limit: number = 60) => {
    return provider.getHistory(machineId, limit);
  }, [provider]);

  const injectAnomaly = useCallback((machineId: string, type: 'vibration' | 'thermal' | 'power_factor' | 'packet_drop') => {
    provider.injectAnomaly(machineId, type);
  }, [provider]);

  // Derived Energy & Optimization calculations
  const energyMetrics = useMemo(() => {
    return calculateFleetEnergyMetrics(fleet);
  }, [fleet]);

  const optimizationResult = useMemo(() => {
    return runOptimizationSimulation(fleet, activeScenario);
  }, [fleet, activeScenario]);

  return (
    <TelemetryContext.Provider
      value={{
        fleet,
        activeScenario,
        setScenario,
        simulationSpeed,
        setSimulationSpeed,
        isPaused,
        togglePause,
        resetSimulation,
        alerts,
        acknowledgeAlert,
        aiInsights,
        energyMetrics,
        optimizationResult,
        getMachineHistory,
        injectAnomaly,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}
