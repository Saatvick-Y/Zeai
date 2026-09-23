'use client';

import React, { useState } from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { SlidersHorizontal, ArrowRight, Zap, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign, Play, Clock } from 'lucide-react';
import { formatKw } from '@/lib/utils';

export default function OptimizationSimulatorPage() {
  const { optimizationResult } = useTelemetry();
  const { baselineState, proposedSchedule, projectedResult } = optimizationResult;

  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Scenario Timeline Steps (Visual Timeline per section specification)
  const timelineSteps = [
    { time: '08:00', machine: 'M01', label: 'MAINTAIN FULL THROUGHPUT', status: 'CRITICAL', color: 'border-purple-600 text-purple-300' },
    { time: '08:10', machine: 'M03', label: 'INTER-SHIFT BEARING INSPECTION', status: 'HIGH', color: 'border-amber-500 text-amber-300' },
    { time: '08:22', machine: 'M07', label: '12-MIN STAGGERED BLOWER START', status: 'LOW', color: 'border-sky-500 text-sky-300' },
    { time: '08:35', machine: 'M05', label: 'TRIM PRE-HEAT THERMAL STANDBY', status: 'MEDIUM', color: 'border-emerald-500 text-emerald-300' },
    { time: '09:00', machine: 'M09', label: 'INRUSH RAMP SMOOTHING (15%)', status: 'MEDIUM', color: 'border-indigo-500 text-indigo-300' },
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-sky-400" />
            <h1 className="text-base font-bold uppercase text-industrial-100">
              PRODUCTION-AWARE OPTIMIZATION & DISPATCH SIMULATOR
            </h1>
          </div>
          <p className="text-xs text-industrial-400 font-sans mt-0.5">
            Interactive Peak-Demand Shaving • Production Priority Preservation • Shift Timeline Modeling
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded border border-amber-800/60">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>SIMULATION MODE • ALL VALUES PROJECTED</span>
        </div>
      </div>

      {/* Visual Scenario Timeline (Section specification) */}
      <div className="bg-industrial-950/80 rounded-lg border border-industrial-800 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-industrial-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-bold uppercase text-industrial-200">
              OPTIMIZED DISPATCH SHIFT TIMELINE
            </h2>
          </div>
          <span className="text-[11px] text-industrial-400">
            Automated peak-shaving staggering schedule
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {timelineSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded bg-industrial-900 border ${step.color} space-y-1`}
            >
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-industrial-100">{step.time}</span>
                <span className="font-bold px-1 rounded bg-industrial-950 border border-industrial-800">
                  {step.machine}
                </span>
              </div>
              <div className="text-[11px] font-bold truncate">{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Column Comparative Board: CURRENT STATE -> PROPOSED ACTIONS -> PROJECTED RESULT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. CURRENT STATE */}
        <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel flex flex-col justify-between space-y-4">
          <div className="border-b border-industrial-800 pb-2">
            <span className="text-[10px] uppercase tracking-wider text-industrial-500 block">
              BASELINE STATE
            </span>
            <h2 className="text-sm font-bold text-industrial-100">
              CURRENT MEASURED LOAD
            </h2>
          </div>

          <div className="space-y-3">
            <div className="bg-industrial-950/70 p-3 rounded border border-industrial-800">
              <span className="text-industrial-400 text-xs block">TOTAL CURRENT DEMAND:</span>
              <span className="text-2xl font-bold text-amber-400">
                {formatKw(baselineState.totalDemandKw)}
              </span>
            </div>

            <div className="bg-industrial-950/70 p-3 rounded border border-industrial-800">
              <span className="text-industrial-400 text-xs block">PEAK DEMAND RECORDED:</span>
              <span className="text-xl font-bold text-rose-400">
                {formatKw(baselineState.peakDemandKw)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-industrial-950/50 p-2 rounded border border-industrial-800">
                <span className="text-industrial-500 text-[10px] block">EFFICIENCY:</span>
                <span className="text-industrial-200 font-bold">{baselineState.productionEfficiencyPct}%</span>
              </div>
              <div className="bg-industrial-950/50 p-2 rounded border border-industrial-800">
                <span className="text-industrial-500 text-[10px] block">FLEET HEALTH:</span>
                <span className="text-emerald-400 font-bold">{baselineState.fleetHealthScore} / 100</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-industrial-500 text-center pt-2 border-t border-industrial-800">
            Real-time aggregate across all 10 machines
          </div>
        </div>

        {/* 2. PROPOSED OPTIMIZATION ACTIONS */}
        <div className="bg-industrial-900/90 rounded-lg border border-sky-800/60 p-4 shadow-panel flex flex-col justify-between space-y-3">
          <div className="border-b border-industrial-800 pb-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-sky-400 block">
                AI SCHEDULING PLAN
              </span>
              <h2 className="text-sm font-bold text-industrial-100">
                RECOMMENDED DISPATCH
              </h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              Production Aware
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 text-xs">
            {proposedSchedule.map((item, idx) => (
              <div
                key={idx}
                className="bg-industrial-950/80 p-2.5 rounded border border-industrial-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sky-400">{item.machineId}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded border font-bold ${
                      item.priority === 'CRITICAL' ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-industrial-900 text-industrial-400 border-industrial-700'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  {item.energyImpactKw !== 0 && (
                    <span className="text-emerald-400 font-bold text-[11px]">
                      {item.energyImpactKw} kW
                    </span>
                  )}
                </div>

                <div className="font-bold text-industrial-200 text-[11px]">
                  {item.action}
                </div>
                <p className="text-[10px] text-industrial-400 font-sans">{item.rationale}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsApplied(true)}
            disabled={isApplied}
            className={`w-full py-2.5 px-4 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isApplied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-sky-600 hover:bg-sky-500 text-industrial-950 shadow-lg shadow-sky-500/20'
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OPTIMIZATION DISPATCH SIMULATED</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-industrial-950" />
                <span>APPLY OPTIMIZATION IN SIMULATOR</span>
              </>
            )}
          </button>
        </div>

        {/* 3. PROJECTED RESULT */}
        <div className="bg-industrial-900/90 rounded-lg border border-emerald-800/60 p-4 shadow-panel flex flex-col justify-between space-y-4">
          <div className="border-b border-industrial-800 pb-2">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 block">
              SIMULATED OUTCOME
            </span>
            <h2 className="text-sm font-bold text-industrial-100">
              PROJECTED POST-DISPATCH
            </h2>
          </div>

          <div className="space-y-3">
            {/* Shaved Peak Demand */}
            <div className="bg-industrial-950/70 p-3 rounded border border-industrial-800">
              <span className="text-industrial-400 text-xs block">PROJECTED PEAK DEMAND:</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-emerald-400">
                  {formatKw(projectedResult.peakDemandKw)}
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  (-{projectedResult.peakReductionPct}%)
                </span>
              </div>
              <span className="text-[10px] text-industrial-500">
                Previous: {formatKw(baselineState.peakDemandKw)} (Shaved {projectedResult.peakReductionKw} kW)
              </span>
            </div>

            {/* Projected Savings & Throughput */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-industrial-950/70 p-2.5 rounded border border-industrial-800">
                <span className="text-industrial-400 text-[10px] block">ENERGY SAVED:</span>
                <span className="text-lg font-bold text-emerald-400">
                  -{projectedResult.energySavingsPct}%
                </span>
              </div>
              <div className="bg-industrial-950/70 p-2.5 rounded border border-industrial-800">
                <span className="text-industrial-400 text-[10px] block">PRODUCTION IMPACT:</span>
                <span className="text-lg font-bold text-sky-300">
                  &lt; {projectedResult.productionImpactPct}%
                </span>
              </div>
            </div>

            {/* Monthly Benefit */}
            <div className="bg-industrial-950/70 p-3 rounded border border-industrial-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-industrial-400">PROJECTED SAVINGS:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ${projectedResult.projectedSavingsPerMonthUsd} / mo
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-emerald-400/80 bg-emerald-950/30 p-2 rounded border border-emerald-900/40 text-center">
            Zero disruption to Critical M01 & M02 lines.
          </div>
        </div>
      </div>
    </div>
  );
}
