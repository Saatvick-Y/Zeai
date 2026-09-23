'use client';

import React, { useState } from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { DEMO_SCENARIOS, ScenarioId } from '@/lib/simulation/scenarios';
import { Play, Pause, RotateCcw, FastForward, Sliders, ChevronDown, ChevronUp, Radio } from 'lucide-react';

export const DemoToolbar: React.FC = () => {
  const {
    activeScenario,
    setScenario,
    simulationSpeed,
    setSimulationSpeed,
    isPaused,
    togglePause,
    resetSimulation,
  } = useTelemetry();

  const [isOpen, setIsOpen] = useState<boolean>(true);

  const activeScenarioObj = DEMO_SCENARIOS.find((s) => s.id === activeScenario);

  return (
    <div className="bg-industrial-950/90 border-b border-sky-900/30 px-4 lg:px-6 py-2 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Scenario Header & Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-950/70 border border-sky-700/50 text-sky-300 font-mono text-[11px] font-semibold">
            <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
            <span>HACKATHON DEMO CONTROL</span>
          </div>

          <span className="text-industrial-500 hidden sm:inline">|</span>

          {/* Quick Scenario Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {DEMO_SCENARIOS.map((scenario) => {
              const isActive = activeScenario === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => setScenario(scenario.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all whitespace-nowrap border ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/80 font-bold shadow-sm shadow-sky-500/20'
                      : 'bg-industrial-900 text-industrial-400 border-industrial-800 hover:text-industrial-200 hover:border-industrial-700'
                  }`}
                  title={scenario.description}
                >
                  {scenario.name.split(' ')[0]} {scenario.name.split(' ')[1] || ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Speed & Playback Controls */}
        <div className="flex items-center gap-3 self-end lg:self-auto">
          {/* Simulation Speed */}
          <div className="flex items-center gap-1 bg-industrial-900 px-2 py-0.5 rounded border border-industrial-800 text-xs font-mono text-industrial-300">
            <FastForward className="w-3 h-3 text-amber-400" />
            <span className="text-industrial-400">SPEED:</span>
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  simulationSpeed === speed
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-industrial-400 hover:text-industrial-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Pause / Resume */}
          <button
            onClick={togglePause}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-mono font-medium transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-industrial-900 text-industrial-300 border-industrial-700 hover:bg-industrial-800'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3 fill-amber-300" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-industrial-900 text-industrial-400 border border-industrial-800 hover:text-rose-400 hover:border-rose-900/60 text-xs font-mono transition-all"
            title="Reset telemetry to nominal baseline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Active Scenario Context Banner */}
      {activeScenarioObj && activeScenario !== 'normal' && (
        <div className="mt-2 pt-2 border-t border-industrial-800/80 flex items-start gap-2 text-xs font-mono">
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] uppercase font-bold shrink-0">
            {activeScenarioObj.badge}
          </span>
          <p className="text-industrial-300 flex-1">
            <strong className="text-industrial-100">{activeScenarioObj.name}:</strong> {activeScenarioObj.description}
          </p>
          <span className="text-sky-400 text-[11px] hidden md:inline">
            Expected AI Action: {activeScenarioObj.expectedAIAction}
          </span>
        </div>
      )}
    </div>
  );
};
