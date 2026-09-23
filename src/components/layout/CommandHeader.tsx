'use client';

import React, { useState, useEffect } from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { Activity, Zap, AlertTriangle, ShieldCheck, Cpu, Clock, RefreshCw } from 'lucide-react';
import { formatTime, formatKw, formatKwh } from '@/lib/utils';
import { MACHINES_CONFIG } from '@/config/machines';

export const CommandHeader: React.FC = () => {
  const { fleet, alerts, energyMetrics, activeScenario, isPaused, togglePause, resetSimulation } = useTelemetry();
  const [time, setTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // System status calculation
  const criticalCount = Object.values(fleet).filter((t) => t.status === 'critical').length;
  const warningCount = Object.values(fleet).filter((t) => t.status === 'warning').length;
  const onlineCount = Object.values(fleet).filter((t) => t.status !== 'offline').length;

  let systemStatus: 'ONLINE' | 'DEGRADED' | 'CRITICAL' = 'ONLINE';
  let statusColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let statusDot = 'bg-emerald-400';

  if (criticalCount > 0) {
    systemStatus = 'CRITICAL';
    statusColor = 'text-rose-400 border-rose-500/40 bg-rose-500/10 animate-pulse';
    statusDot = 'bg-rose-400';
  } else if (warningCount > 0) {
    systemStatus = 'DEGRADED';
    statusColor = 'text-amber-400 border-amber-500/35 bg-amber-500/10';
    statusDot = 'bg-amber-400';
  }

  return (
    <header className="border-b border-industrial-800 bg-industrial-950/95 sticky top-0 z-40 backdrop-blur-md px-4 lg:px-6 py-2.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand & Plant Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5 text-industrial-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-wider text-industrial-50">
                  INDU-SAVE
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-industrial-800 text-industrial-400 border border-industrial-700">
                  v2.4 RT-EDGE
                </span>
              </div>
              <p className="text-[11px] text-industrial-400 font-sans">
                Industrial Energy & Machine Intelligence Command Center
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-industrial-800 hidden sm:block" />

          {/* Plant Health Status Pill */}
          <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border font-mono text-xs ${statusColor}`}>
            <span className={`w-2 h-2 rounded-full ${statusDot}`} />
            <span className="font-semibold tracking-wider">PLANT: {systemStatus}</span>
          </div>
        </div>

        {/* Right: Quick Telemetry Pulse & Clock */}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          {/* Active Demand */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-industrial-400">DEMAND:</span>
            <span className="text-amber-400 font-semibold">{formatKw(energyMetrics.overview.totalDemandKw)}</span>
          </div>

          {/* Fleet Online Count */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-industrial-400">MACHINES:</span>
            <span className="text-emerald-400 font-semibold">{onlineCount}/10</span>
          </div>

          {/* Active Alerts Badge */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <AlertTriangle className={`w-3.5 h-3.5 ${alerts.length > 0 ? 'text-rose-400' : 'text-industrial-500'}`} />
            <span className="text-industrial-400">ALERTS:</span>
            <span className={`font-semibold ${alerts.length > 0 ? 'text-rose-400' : 'text-industrial-300'}`}>
              {alerts.length}
            </span>
          </div>

          {/* UTC/Local Time */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-xs text-industrial-300 bg-industrial-900 px-2.5 py-1 rounded border border-industrial-800">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>{formatTime(time)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
