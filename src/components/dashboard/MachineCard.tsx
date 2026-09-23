'use client';

import React from 'react';
import Link from 'next/link';
import { MachineConfig } from '@/types/machine';
import { MachineTelemetry } from '@/types/telemetry';
import { StatusBadge } from '../ui/StatusBadge';
import { getPriorityBadge, formatKw, formatTemp, formatVibration, getStatusColor } from '@/lib/utils';
import { Zap, Flame, Activity, ChevronRight, AlertTriangle } from 'lucide-react';

interface MachineCardProps {
  config: MachineConfig;
  telemetry?: MachineTelemetry;
}

export const MachineCard: React.FC<MachineCardProps> = ({ config, telemetry }) => {
  const status = telemetry ? telemetry.status : 'offline';
  const connectionState = telemetry ? telemetry.connectionState : 'offline';
  const priorityBadge = getPriorityBadge(config.priority);
  const statusColors = getStatusColor(status);

  const health = telemetry ? telemetry.machineHealth : 100;
  const activePower = telemetry ? telemetry.activePower : 0;
  const temp = telemetry ? telemetry.temperature : config.baselineTemp;
  const vib = telemetry ? telemetry.vibrationRms : config.baselineVibration;
  const anomalyScore = telemetry ? telemetry.anomalyScore : 0;

  // Determine health bar color
  let healthBarColor = 'bg-emerald-500';
  if (health < 60) healthBarColor = 'bg-rose-500';
  else if (health < 80) healthBarColor = 'bg-amber-500';

  return (
    <Link
      href={`/machines/${config.id}`}
      className={`group bg-industrial-900/90 rounded-lg border p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-panel-hover flex flex-col justify-between ${statusColors.border} ${status === 'critical' ? 'bg-rose-950/10 shadow-glow-rose' : ''}`}
    >
      {/* Top Bar: ID, Name, Badges */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
              {config.id}
            </span>
            <div>
              <h3 className="text-xs font-semibold text-industrial-100 group-hover:text-sky-300 transition-colors line-clamp-1">
                {config.name}
              </h3>
              <span className="text-[10px] font-mono text-industrial-400">{config.line}</span>
            </div>
          </div>
          <StatusBadge status={status} connectionState={connectionState} size="sm" />
        </div>

        {/* Priority & Anomaly Pill */}
        <div className="flex items-center justify-between gap-1 text-[10px] font-mono mb-3">
          <span className={`px-1.5 py-0.2 rounded border font-semibold ${priorityBadge.style}`}>
            {priorityBadge.label}
          </span>
          {anomalyScore > 0.25 && (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-800/60 font-bold">
              <AlertTriangle className="w-3 h-3" />
              ANOMALY: {Math.round(anomalyScore * 100)}%
            </span>
          )}
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-industrial-950/60 rounded p-2.5 border border-industrial-800/80 mb-3">
          {/* Power */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-industrial-400 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" /> PWR
            </span>
            <span className="font-mono text-xs font-semibold text-amber-300 mt-0.5">
              {formatKw(activePower)}
            </span>
          </div>

          {/* Temperature */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-industrial-400 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-rose-400" /> TEMP
            </span>
            <span className={`font-mono text-xs font-semibold mt-0.5 ${temp > config.thresholds.tempWarning ? 'text-rose-400 font-bold' : 'text-industrial-200'}`}>
              {formatTemp(temp)}
            </span>
          </div>

          {/* Vibration */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-industrial-400 flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-purple-400" /> VIB
            </span>
            <span className={`font-mono text-xs font-semibold mt-0.5 ${vib > config.thresholds.vibWarning ? 'text-amber-400 font-bold' : 'text-industrial-200'}`}>
              {formatVibration(vib)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Health Bar & Drilldown CTA */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-industrial-300">
          <span className="text-industrial-400">Machine Health:</span>
          <span className="font-bold text-industrial-100">{health} / 100</span>
        </div>
        <div className="w-full bg-industrial-950 h-2 rounded-full overflow-hidden border border-industrial-800">
          <div
            className={`h-full transition-all duration-300 ${healthBarColor}`}
            style={{ width: `${health}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-industrial-400 mt-2.5 pt-1.5 border-t border-industrial-800/60">
          <span>Util: {telemetry ? `${telemetry.utilization}%` : '0%'}</span>
          <span className="text-sky-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Diagnostics <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
};
