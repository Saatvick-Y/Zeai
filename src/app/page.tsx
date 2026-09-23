'use client';

import React, { useState } from 'react';
import { DigitalTwinCanvas } from '@/components/digitaltwin/DigitalTwinCanvas';
import { useTelemetry } from '@/context/TelemetryContext';
import { formatKw, formatKwh } from '@/lib/utils';
import {
  Zap,
  HeartPulse,
  Cpu,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';

export default function CommandCenterPage() {
  const { fleet, alerts, aiInsights, energyMetrics, optimizationResult } = useTelemetry();
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  const activeCount = Object.values(fleet).filter((t) => t.status !== 'offline').length;
  const criticalCount = Object.values(fleet).filter((t) => t.status === 'critical').length;
  const warningCount = Object.values(fleet).filter((t) => t.status === 'warning').length;
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  const avgHealth = Math.round(
    Object.values(fleet).reduce((sum, t) => sum + t.machineHealth, 0) / Math.max(1, Object.values(fleet).length)
  );

  return (
    <div className="space-y-4">
      {/* 1. Top Plant Command Telemetry Strip (Focused & High Level) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {/* Total Power Demand */}
        <div className="bg-industrial-900/90 p-3 rounded-lg border border-industrial-700/60 shadow-panel flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-industrial-400 block font-semibold">
              TOTAL DEMAND
            </span>
            <span className="text-xl font-bold text-amber-300">
              {formatKw(energyMetrics.overview.totalDemandKw)}
            </span>
            <span className="text-[10px] text-industrial-500 block">
              Peak: {formatKw(energyMetrics.overview.peakDemandTodayKw)}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Fleet Health */}
        <div className="bg-industrial-900/90 p-3 rounded-lg border border-industrial-700/60 shadow-panel flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-industrial-400 block font-semibold">
              FLEET HEALTH
            </span>
            <span className={`text-xl font-bold ${avgHealth < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {avgHealth} / 100
            </span>
            <span className="text-[10px] text-industrial-500 block">
              {criticalCount > 0 ? `${criticalCount} Critical Risk` : warningCount > 0 ? `${warningCount} Warning` : 'All Channels Nominal'}
            </span>
          </div>
          <div className={`p-2.5 rounded-lg border ${avgHealth < 75 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>

        {/* Production Assets */}
        <div className="bg-industrial-900/90 p-3 rounded-lg border border-industrial-700/60 shadow-panel flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-industrial-400 block font-semibold">
              ACTIVE ASSETS
            </span>
            <span className="text-xl font-bold text-sky-300">
              {activeCount} / 10
            </span>
            <span className="text-[10px] text-industrial-500 block">
              Efficiency: {energyMetrics.overview.fleetEfficiencyPct}%
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* AI Optimization Status */}
        <div className="bg-industrial-900/90 p-3 rounded-lg border border-industrial-700/60 shadow-panel flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-industrial-400 block font-semibold">
              AI DISPATCH
            </span>
            <span className="text-xl font-bold text-purple-300">
              OPTIMIZED
            </span>
            <span className="text-[10px] text-emerald-400 block">
              -{optimizationResult.projectedResult.peakReductionPct}% Shaved Peak
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Main 3D Spatial Digital Twin Workspace (65% Viewport Priority) */}
      <section className="relative">
        <DigitalTwinCanvas
          height="540px"
          selectedMachineId={selectedMachineId}
          onSelectMachine={setSelectedMachineId}
          showControlsBar={true}
        />
      </section>

      {/* 3. High-Priority Attention & AI Recommendation Bar */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 font-mono">
        {/* Attention Box: Immediate Anomalies & Critical Alerts */}
        <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase text-industrial-100">
                  ATTENTION REQUIRED ({activeAlerts.length})
                </h3>
              </div>
              <Link href="/alerts" className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-0.5">
                Full Log <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {activeAlerts.length === 0 ? (
                <div className="p-3.5 text-center bg-industrial-950/40 rounded border border-industrial-800/60 text-xs text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All plant channels operating within nominal baselines</span>
                </div>
              ) : (
                activeAlerts.slice(0, 2).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded bg-industrial-950/70 border border-amber-500/30 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-400">{alert.machineId}</span>
                        <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800">
                          {alert.parameter}
                        </span>
                      </div>
                      <p className="text-[11px] text-industrial-300 font-sans line-clamp-1">{alert.message}</p>
                    </div>

                    <Link
                      href={`/machines/${alert.machineId}`}
                      className="px-2 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 text-[11px] border border-sky-800 shrink-0"
                    >
                      Inspect →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI Optimization Dispatch Card */}
        <div className="bg-industrial-900/90 rounded-lg border border-purple-900/40 p-4 shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase text-industrial-100">
                  ACTIVE AI OPTIMIZATION DISPATCH
                </h3>
              </div>
              <Link href="/optimization" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-0.5">
                Simulate <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-3 rounded bg-industrial-950/70 border border-industrial-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-purple-300 font-bold">Production-Aware Peak Shaving</span>
                <span className="text-emerald-400 font-bold text-[11px]">PROJECTED -8.7% kWh</span>
              </div>
              <p className="text-[11px] text-industrial-300 font-sans leading-relaxed">
                Staggering Low-Priority M07 Blower by 12 mins while maintaining 100% throughput on Critical M01 & M02 lines.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-industrial-800/80 text-[11px] text-industrial-400">
            <span>Production Risk: <strong className="text-emerald-400">&lt;0.4%</strong></span>
            <span>Monthly Cost Benefit: <strong className="text-emerald-400">${optimizationResult.projectedResult.projectedSavingsPerMonthUsd}</strong></span>
          </div>
        </div>
      </section>
    </div>
  );
}
