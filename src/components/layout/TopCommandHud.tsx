'use client';

import React, { useState, useEffect } from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { DEMO_SCENARIOS, ScenarioId } from '@/lib/simulation/scenarios';
import { formatTime, formatKw } from '@/lib/utils';
import {
  Bell,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { AlertDrawer } from './AlertDrawer';

export const TopCommandHud: React.FC = () => {
  const {
    fleet,
    alerts,
    energyMetrics,
    activeScenario,
    setScenario,
    simulationSpeed,
    setSimulationSpeed,
    isPaused,
    togglePause,
    resetSimulation,
  } = useTelemetry();

  const [time, setTime] = useState<number>(Date.now());
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const criticalCount = Object.values(fleet).filter((t) => t.status === 'critical').length;
  const warningCount = Object.values(fleet).filter((t) => t.status === 'warning').length;
  const activeAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  let plantStatus = 'ONLINE';
  let statusBadgeStyle = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
  let statusDotStyle = 'bg-emerald-400';

  if (criticalCount > 0) {
    plantStatus = 'CRITICAL ALERT';
    statusBadgeStyle = 'text-rose-400 bg-rose-950/60 border-rose-500/50 animate-pulse';
    statusDotStyle = 'bg-rose-400';
  } else if (warningCount > 0) {
    plantStatus = 'DEGRADED';
    statusBadgeStyle = 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    statusDotStyle = 'bg-amber-400';
  }

  return (
    <>
      <header className="bg-industrial-950/95 border-b border-industrial-800/80 px-4 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-30 backdrop-blur-md font-mono select-none">
        {/* Left: Plant Status Pill & Demand */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-bold ${statusBadgeStyle}`}>
            <span className={`w-2 h-2 rounded-full ${statusDotStyle}`} />
            <span>PLANT: {plantStatus}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-industrial-300 bg-industrial-900 px-3 py-1 rounded border border-industrial-800">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-industrial-500">DEMAND:</span>
            <span className="text-amber-300 font-bold">{formatKw(energyMetrics.overview.totalDemandKw)}</span>
          </div>
        </div>

        {/* Center: Scenario Dropdown Selector (Reduces clutter) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-industrial-900/90 px-3 py-1 rounded-lg border border-industrial-700/80 text-xs">
            <span className="text-industrial-400 text-[11px]">SCENARIO:</span>
            <select
              value={activeScenario}
              onChange={(e) => setScenario(e.target.value as ScenarioId)}
              className="bg-transparent text-sky-300 font-bold outline-none cursor-pointer text-xs"
            >
              {DEMO_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id} className="bg-industrial-950 text-industrial-100">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Speed Selector */}
          <div className="hidden md:flex items-center gap-1 bg-industrial-900 px-2 py-1 rounded border border-industrial-800 text-xs text-industrial-300">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${
                  simulationSpeed === speed
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-industrial-400 hover:text-industrial-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Play/Pause */}
          <button
            onClick={togglePause}
            className={`p-1.5 rounded border text-xs transition-colors ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-industrial-900 text-industrial-300 border-industrial-800 hover:bg-industrial-800'
            }`}
            title={isPaused ? 'Resume Telemetry' : 'Pause Telemetry'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-amber-300" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Reset */}
          <button
            onClick={resetSimulation}
            className="p-1.5 rounded bg-industrial-900 text-industrial-400 border border-industrial-800 hover:text-rose-400 hover:border-rose-900 transition-colors"
            title="Reset Simulation to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Clock & Notification Drawer Button */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-industrial-300 bg-industrial-900 px-3 py-1 rounded border border-industrial-800">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{formatTime(time)}</span>
          </div>

          {/* Alert Drawer Trigger */}
          <button
            onClick={() => setIsAlertDrawerOpen(true)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold border transition-all ${
              activeAlertsCount > 0
                ? 'bg-rose-950/60 text-rose-300 border-rose-600/50 animate-pulse shadow-sm shadow-rose-500/20'
                : 'bg-industrial-900 text-industrial-300 border-industrial-800 hover:bg-industrial-850'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>NOTIFICATIONS ({activeAlertsCount})</span>
          </button>
        </div>
      </header>

      {/* Slide-over Notification Drawer */}
      <AlertDrawer isOpen={isAlertDrawerOpen} onClose={() => setIsAlertDrawerOpen(false)} />
    </>
  );
};
