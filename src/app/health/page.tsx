'use client';

import React from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { MACHINES_CONFIG } from '@/config/machines';
import { HeartPulse, Activity, Flame, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatTemp, formatVibration, getPriorityBadge } from '@/lib/utils';
import Link from 'next/link';

export default function MachineHealthWorkspace() {
  const { fleet, alerts } = useTelemetry();

  // Sort machines by health (lowest health first to prioritize attention)
  const rankedMachines = [...MACHINES_CONFIG].sort((a, b) => {
    const tA = fleet[a.id];
    const tB = fleet[b.id];
    return (tA ? tA.machineHealth : 100) - (tB ? tB.machineHealth : 100);
  });

  const avgHealth = Math.round(
    Object.values(fleet).reduce((sum, t) => sum + t.machineHealth, 0) / Math.max(1, Object.values(fleet).length)
  );

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-400" />
            <h1 className="text-base font-bold uppercase text-industrial-100">
              FLEET MACHINE HEALTH & CONDITION INTELLIGENCE
            </h1>
          </div>
          <p className="text-xs text-industrial-400 font-sans mt-0.5">
            Multi-Sensor Health Degradation Matrix • Vibration Harmonics & Thermal Stress Diagnostics
          </p>
        </div>

        <div className="flex items-center gap-2 bg-industrial-950 px-3 py-1.5 rounded border border-industrial-800 text-xs">
          <span className="text-industrial-400">FLEET AVERAGE:</span>
          <span className={`font-bold ${avgHealth < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {avgHealth} / 100
          </span>
        </div>
      </div>

      {/* Health Ranking Matrix (Compact & High Information Density) */}
      <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel space-y-3">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
          <h2 className="text-xs font-bold uppercase text-industrial-200">
            FLEET CONDITION-BASED MAINTENANCE RANKING
          </h2>
          <span className="text-[11px] text-industrial-400">
            Ranked by degradation risk (Lowest health prioritized)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-industrial-800 text-industrial-400 text-[11px] bg-industrial-950/60">
                <th className="py-2 px-3">ASSET</th>
                <th className="py-2 px-3">LINE</th>
                <th className="py-2 px-3">PRIORITY</th>
                <th className="py-2 px-3">HEALTH SCORE</th>
                <th className="py-2 px-3">TEMPERATURE</th>
                <th className="py-2 px-3">VIBRATION RMS</th>
                <th className="py-2 px-3">ANOMALY INDEX</th>
                <th className="py-2 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/60">
              {rankedMachines.map((m) => {
                const t = fleet[m.id];
                const health = t ? t.machineHealth : 100;
                const temp = t ? t.temperature : m.baselineTemp;
                const vib = t ? t.vibrationRms : m.baselineVibration;
                const anomaly = t ? t.anomalyScore : 0;
                const priorityBadge = getPriorityBadge(m.priority);

                let healthColor = 'text-emerald-400';
                let barColor = 'bg-emerald-500';
                if (health < 60) {
                  healthColor = 'text-rose-400';
                  barColor = 'bg-rose-500';
                } else if (health < 80) {
                  healthColor = 'text-amber-400';
                  barColor = 'bg-amber-500';
                }

                return (
                  <tr key={m.id} className="hover:bg-industrial-850/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-400 bg-sky-950 px-1.5 py-0.2 rounded border border-sky-800 text-[11px]">
                          {m.id}
                        </span>
                        <span className="font-semibold text-industrial-100 truncate max-w-[170px]">
                          {m.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-industrial-400 text-[11px]">{m.line}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${priorityBadge.style}`}>
                        {priorityBadge.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-industrial-950 h-2 rounded overflow-hidden">
                          <div className={`h-full ${barColor}`} style={{ width: `${health}%` }} />
                        </div>
                        <span className={`font-bold ${healthColor}`}>{health}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={temp > m.thresholds.tempWarning ? 'text-rose-400 font-bold' : 'text-industrial-300'}>
                        {formatTemp(temp)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={vib > m.thresholds.vibWarning ? 'text-amber-400 font-bold' : 'text-industrial-300'}>
                        {formatVibration(vib)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={anomaly > 0.25 ? 'text-amber-400 font-bold' : 'text-industrial-400'}>
                        {anomaly}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/machines/${m.id}`}
                        className="text-sky-400 hover:text-sky-300 underline text-[11px]"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
