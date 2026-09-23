'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MACHINES_CONFIG, getMachineConfig } from '@/config/machines';
import { useTelemetry } from '@/context/TelemetryContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RealtimeWaveChart } from '@/components/charts/RealtimeWaveChart';
import {
  formatKw,
  formatKwh,
  formatTemp,
  formatVibration,
  formatCurrent,
  formatTime,
  getPriorityBadge,
  getConnectionLabel,
  getStatusColor,
} from '@/lib/utils';
import { calculateMachineHealth } from '@/lib/calculations/healthScore';
import {
  ChevronLeft,
  ChevronDown,
  Zap,
  Flame,
  Activity,
  Gauge,
  Volume2,
  Clock,
  ShieldCheck,
  Sparkles,
  Sliders,
  Layers,
  Radio,
  BarChart2,
  Cpu,
} from 'lucide-react';

export default function MachineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const machineId = (params?.id as string) || 'M01';
  const config = getMachineConfig(machineId);

  const { fleet, getMachineHistory, aiInsights } = useTelemetry();
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'health' | 'energy' | 'ai'>('overview');
  const [selectedSignal, setSelectedSignal] = useState<'activePower' | 'temperature' | 'vibrationRms' | 'current'>('activePower');
  const [selectedRange, setSelectedRange] = useState<number>(60);

  if (!config) {
    return (
      <div className="p-8 text-center bg-industrial-900 rounded-lg border border-industrial-800 font-mono">
        <h2 className="text-lg text-rose-400">MACHINE ASSET NOT FOUND: {machineId}</h2>
        <Link href="/machines" className="text-sky-400 mt-4 inline-block text-sm underline">
          Return to Fleet Directory
        </Link>
      </div>
    );
  }

  const telemetry = fleet[config.id];
  const history = getMachineHistory(config.id, selectedRange);
  const status = telemetry ? telemetry.status : 'offline';
  const connState = telemetry ? telemetry.connectionState : 'offline';
  const connLabel = getConnectionLabel(connState);
  const priorityBadge = getPriorityBadge(config.priority);

  const healthBreakdown = calculateMachineHealth(config, {
    temperature: telemetry ? telemetry.temperature : config.baselineTemp,
    vibrationRms: telemetry ? telemetry.vibrationRms : config.baselineVibration,
    currentAmps: telemetry ? telemetry.current : config.baselineCurrent,
    powerFactor: telemetry ? telemetry.powerFactor : config.baselinePowerFactor,
    activePower: telemetry ? telemetry.activePower : 0,
  });

  const machineInsights = aiInsights.filter((ai) => ai.machineId === config.id);

  return (
    <div className="space-y-4 font-mono">
      {/* 1. Header with Machine Dropdown Switcher */}
      <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/machines"
              className="p-2 rounded bg-industrial-950 border border-industrial-800 text-industrial-400 hover:text-industrial-100 hover:border-industrial-700 transition-colors"
              title="Back to All Machines"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            {/* Machine Dropdown Switcher (Clean & Uncluttered) */}
            <div className="relative">
              <select
                value={config.id}
                onChange={(e) => router.push(`/machines/${e.target.value}`)}
                className="bg-industrial-950 text-sky-400 font-mono font-bold text-sm px-3 py-1.5 rounded-md border border-industrial-700 cursor-pointer outline-none hover:border-sky-500 transition-colors"
              >
                {MACHINES_CONFIG.map((m) => (
                  <option key={m.id} value={m.id} className="bg-industrial-950 text-industrial-100">
                    [{m.id}] {m.name} ({m.priority.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <StatusBadge status={status} connectionState={connState} size="md" />
          </div>

          {/* Location & Bus Status */}
          <div className="flex items-center gap-3 text-xs text-industrial-400">
            <span>LINE: <strong className="text-industrial-200">{config.line}</strong></span>
            <span>•</span>
            <span>BUS: <strong className={connLabel.color}>{connLabel.label}</strong></span>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="flex items-center gap-1 border-t border-industrial-800 pt-3 mt-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'OVERVIEW', icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: 'telemetry', label: 'LIVE TELEMETRY', icon: <Activity className="w-3.5 h-3.5" /> },
            { id: 'health', label: 'HEALTH DECOMPOSITION', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: 'energy', label: 'ENERGY & EFFICIENCY', icon: <Zap className="w-3.5 h-3.5" /> },
            { id: 'ai', label: 'AI DIAGNOSTICS', icon: <Sparkles className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
                  : 'text-industrial-400 hover:text-industrial-200 hover:bg-industrial-950'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW (Progressive Disclosure - Clean & Concise) */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-industrial-900/90 p-3.5 rounded-lg border border-industrial-700/60 shadow-panel">
              <span className="text-[10px] uppercase text-industrial-400 block">HEALTH SCORE</span>
              <span className={`text-2xl font-bold my-1 block ${healthBreakdown.overallScore < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {healthBreakdown.overallScore} / 100
              </span>
              <span className="text-[10px] text-industrial-500">Anomaly Index: {healthBreakdown.anomalyScore}</span>
            </div>

            <div className="bg-industrial-900/90 p-3.5 rounded-lg border border-industrial-700/60 shadow-panel">
              <span className="text-[10px] uppercase text-industrial-400 block">ACTIVE POWER</span>
              <span className="text-2xl font-bold text-amber-300 my-1 block">
                {formatKw(telemetry?.activePower || 0)}
              </span>
              <span className="text-[10px] text-industrial-500">Rated: {config.ratedPowerKw} kW</span>
            </div>

            <div className="bg-industrial-900/90 p-3.5 rounded-lg border border-industrial-700/60 shadow-panel">
              <span className="text-[10px] uppercase text-industrial-400 block">ENERGY EFFICIENCY</span>
              <span className="text-2xl font-bold text-emerald-400 my-1 block">
                {telemetry?.energyEfficiency || 92}%
              </span>
              <span className="text-[10px] text-industrial-500">Utilization: {telemetry?.utilization || 0}%</span>
            </div>

            <div className="bg-industrial-900/90 p-3.5 rounded-lg border border-industrial-700/60 shadow-panel">
              <span className="text-[10px] uppercase text-industrial-400 block">RISK ASSESSMENT</span>
              <span className="text-sm font-bold text-sky-300 my-1 block truncate">
                {healthBreakdown.primaryRiskFactor}
              </span>
              <span className="text-[10px] text-industrial-500">Priority: {config.priority.toUpperCase()}</span>
            </div>
          </div>

          {/* Quick Telemetry Summary & Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-industrial-900/90 p-4 rounded-lg border border-industrial-700/60 shadow-panel space-y-3">
              <h3 className="text-xs font-bold uppercase text-industrial-200 border-b border-industrial-800 pb-2">
                MEASURED SENSORY BASELINES
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-industrial-800/60">
                  <span className="text-industrial-400">Core Operating Temp:</span>
                  <span className={(telemetry?.temperature || 0) > config.thresholds.tempWarning ? 'text-rose-400 font-bold' : 'text-industrial-100'}>
                    {formatTemp(telemetry?.temperature || config.baselineTemp)} (Base: {config.baselineTemp}°C)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-800/60">
                  <span className="text-industrial-400">Vibration Harmonics RMS:</span>
                  <span className={(telemetry?.vibrationRms || 0) > config.thresholds.vibWarning ? 'text-amber-400 font-bold' : 'text-industrial-100'}>
                    {formatVibration(telemetry?.vibrationRms || config.baselineVibration)} (Base: {config.baselineVibration} mm/s)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-800/60">
                  <span className="text-industrial-400">3-Phase Current Draw:</span>
                  <span className="text-sky-300 font-bold">
                    {formatCurrent(telemetry?.current || config.baselineCurrent)} (Rated: {config.ratedCurrent} A)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-industrial-400">Displacement Power Factor:</span>
                  <span className="text-emerald-300 font-bold">
                    {telemetry?.powerFactor || config.baselinePowerFactor} (Target: {config.baselinePowerFactor})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="bg-industrial-900/90 p-4 rounded-lg border border-industrial-700/60 shadow-panel space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase text-industrial-200 border-b border-industrial-800 pb-2">
                  DEEP DIAGNOSTIC NAVIGATION
                </h3>
                <p className="text-xs text-industrial-400 font-sans mt-2">
                  Progressively inspect multi-channel waveform telemetry, thermal health degradation, or neural reasoning.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className="p-2.5 rounded bg-industrial-950 border border-industrial-800 text-sky-400 hover:border-sky-500 text-left font-bold"
                >
                  [ VIEW LIVE TELEMETRY ]
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="p-2.5 rounded bg-industrial-950 border border-industrial-800 text-purple-400 hover:border-purple-500 text-left font-bold"
                >
                  [ VIEW AI DIAGNOSTICS ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE TELEMETRY (Parameter Selector Grid) */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Signal & Time Range Dropdowns */}
          <div className="flex items-center justify-between gap-3 bg-industrial-900/90 p-3 rounded-lg border border-industrial-700/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-industrial-400">PRIMARY SIGNAL:</span>
              <select
                value={selectedSignal}
                onChange={(e) => setSelectedSignal(e.target.value as any)}
                className="bg-industrial-950 text-sky-300 font-bold px-3 py-1 rounded border border-industrial-800 cursor-pointer outline-none"
              >
                <option value="activePower">Active Power (kW)</option>
                <option value="temperature">Temperature (°C)</option>
                <option value="vibrationRms">Vibration RMS (mm/s)</option>
                <option value="current">Current Draw (A)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-industrial-400">TIME WINDOW:</span>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(Number(e.target.value))}
                className="bg-industrial-950 text-industrial-200 px-3 py-1 rounded border border-industrial-800 cursor-pointer outline-none"
              >
                <option value={60}>Live Stream (60s)</option>
                <option value={120}>Last 5 Minutes</option>
                <option value={180}>Last 1 Hour</option>
                <option value={240}>Last 24 Hours</option>
              </select>
            </div>
          </div>

          {/* Primary Large Waveform */}
          <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel">
            <RealtimeWaveChart
              history={history}
              metric={selectedSignal}
              title={`${selectedSignal.toUpperCase()} REAL-TIME STREAM`}
              unit={selectedSignal === 'temperature' ? '°C' : selectedSignal === 'vibrationRms' ? 'mm/s' : selectedSignal === 'current' ? 'A' : 'kW'}
              color={selectedSignal === 'temperature' ? '#ef4444' : selectedSignal === 'vibrationRms' ? '#a855f7' : selectedSignal === 'current' ? '#38bdf8' : '#f59e0b'}
              height="280px"
            />
          </div>

          {/* Secondary 3 Waveforms in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['temperature', 'vibrationRms', 'current']
              .filter((s) => s !== selectedSignal)
              .slice(0, 3)
              .map((sig) => (
                <div key={sig} className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-3 shadow-panel">
                  <RealtimeWaveChart
                    history={history}
                    metric={sig as any}
                    title={sig.toUpperCase()}
                    height="170px"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH DECOMPOSITION */}
      {activeTab === 'health' && (
        <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-5 shadow-panel space-y-4 animate-in fade-in duration-150">
          <div className="border-b border-industrial-800 pb-3">
            <h2 className="text-sm font-bold uppercase text-industrial-100">
              MULTI-SENSOR HEALTH MATRIX & DEGRADATION
            </h2>
            <p className="text-xs text-industrial-400 font-sans mt-0.5">
              Weighted sensor sub-score decomposition for predictive condition-based maintenance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-industrial-950 p-3 rounded border border-industrial-800 space-y-1">
              <span className="text-industrial-400 text-[11px] block">Thermal Health (30%)</span>
              <span className="text-xl font-bold text-rose-400">{healthBreakdown.thermalHealth}%</span>
              <div className="w-full bg-industrial-900 h-1.5 rounded overflow-hidden mt-1">
                <div className="bg-rose-500 h-full" style={{ width: `${healthBreakdown.thermalHealth}%` }} />
              </div>
            </div>

            <div className="bg-industrial-950 p-3 rounded border border-industrial-800 space-y-1">
              <span className="text-industrial-400 text-[11px] block">Mechanical Health (35%)</span>
              <span className="text-xl font-bold text-purple-400">{healthBreakdown.mechanicalHealth}%</span>
              <div className="w-full bg-industrial-900 h-1.5 rounded overflow-hidden mt-1">
                <div className="bg-purple-500 h-full" style={{ width: `${healthBreakdown.mechanicalHealth}%` }} />
              </div>
            </div>

            <div className="bg-industrial-950 p-3 rounded border border-industrial-800 space-y-1">
              <span className="text-industrial-400 text-[11px] block">Electrical Health (20%)</span>
              <span className="text-xl font-bold text-sky-400">{healthBreakdown.electricalHealth}%</span>
              <div className="w-full bg-industrial-900 h-1.5 rounded overflow-hidden mt-1">
                <div className="bg-sky-500 h-full" style={{ width: `${healthBreakdown.electricalHealth}%` }} />
              </div>
            </div>

            <div className="bg-industrial-950 p-3 rounded border border-industrial-800 space-y-1">
              <span className="text-industrial-400 text-[11px] block">Efficiency Health (15%)</span>
              <span className="text-xl font-bold text-emerald-400">{healthBreakdown.efficiencyHealth}%</span>
              <div className="w-full bg-industrial-900 h-1.5 rounded overflow-hidden mt-1">
                <div className="bg-emerald-500 h-full" style={{ width: `${healthBreakdown.efficiencyHealth}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ENERGY */}
      {activeTab === 'energy' && (
        <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-5 shadow-panel space-y-4 animate-in fade-in duration-150">
          <div className="border-b border-industrial-800 pb-3">
            <h2 className="text-sm font-bold uppercase text-industrial-100">
              ELECTRICAL POWER & CONSUMPTION PROFILE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-industrial-950 p-3.5 rounded border border-industrial-800">
              <span className="text-industrial-400 block">Cumulative Energy Today:</span>
              <span className="text-xl font-bold text-amber-300 mt-1 block">
                {formatKwh(telemetry?.energyConsumption || 0)}
              </span>
            </div>

            <div className="bg-industrial-950 p-3.5 rounded border border-industrial-800">
              <span className="text-industrial-400 block">Reactive Power Draw:</span>
              <span className="text-xl font-bold text-purple-300 mt-1 block">
                {telemetry?.reactivePower || 0} kVAR
              </span>
            </div>

            <div className="bg-industrial-950 p-3.5 rounded border border-industrial-800">
              <span className="text-industrial-400 block">Supply Voltage:</span>
              <span className="text-xl font-bold text-sky-300 mt-1 block">
                {telemetry?.voltage || 400} V AC
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI DIAGNOSTICS */}
      {activeTab === 'ai' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {machineInsights.length === 0 ? (
            <div className="p-8 text-center bg-industrial-900/60 rounded-lg border border-industrial-800 text-xs text-emerald-400">
              No active neural anomalies flagged for {config.id}. Machine operating within nominal baselines.
            </div>
          ) : (
            machineInsights.map((insight) => (
              <div key={insight.id} className="bg-industrial-900/90 rounded-lg border border-purple-900/40 p-5 shadow-panel space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-300">{insight.title}</span>
                  <span className="text-xs text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    Confidence: {insight.confidence}%
                  </span>
                </div>
                <p className="text-xs text-industrial-300 font-sans">{insight.summary}</p>
                <div className="p-3 rounded bg-sky-950/30 border border-sky-900/50 text-xs text-sky-300">
                  <strong>AI RECOMMENDED ACTION:</strong> {insight.recommendedAction}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
