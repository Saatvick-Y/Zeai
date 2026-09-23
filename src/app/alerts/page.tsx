'use client';

import React, { useState } from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { AlertTriangle, ShieldAlert, CheckCircle, Filter, Check, Clock, Radio } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { AlertSeverity } from '@/types/alerts';
import Link from 'next/link';

export default function AlertsPage() {
  const { alerts, acknowledgeAlert } = useTelemetry();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showAcknowledged, setShowAcknowledged] = useState<boolean>(true);

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (!showAcknowledged && a.acknowledged) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && !a.acknowledged).length;
  const infoCount = alerts.filter((a) => a.severity === 'info' && !a.acknowledged).length;

  return (
    <div className="space-y-4">
      {/* 1. Header & Alert Summary Counters */}
      <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h1 className="text-base font-mono font-bold uppercase text-industrial-100">
              INDUSTRIAL INCIDENT & ALERT CENTER
            </h1>
          </div>
          <p className="text-xs text-industrial-400 font-sans mt-0.5">
            Deduplicated Fleet Anomaly Stream, Diagnostic Correlation & Operator Action Verification
          </p>
        </div>

        {/* Severity Counters */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-rose-950/40 border border-rose-800/60 px-3 py-1.5 rounded flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span className="text-rose-300 font-bold">{criticalCount} CRITICAL</span>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-bold">{warningCount} WARNINGS</span>
          </div>

          <div className="bg-industrial-950 border border-industrial-800 px-3 py-1.5 rounded flex items-center gap-2 text-industrial-400">
            <Radio className="w-3 h-3 text-sky-400" />
            <span>{infoCount} TELEMETRY</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-industrial-900/60 p-3 rounded-lg border border-industrial-800 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-industrial-400" />
          <span className="text-industrial-400">SEVERITY:</span>
          {['all', 'critical', 'warning', 'info'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-2.5 py-1 rounded text-xs uppercase font-bold transition-colors ${
                severityFilter === s
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'text-industrial-400 hover:text-industrial-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-industrial-300 select-none">
          <input
            type="checkbox"
            checked={showAcknowledged}
            onChange={(e) => setShowAcknowledged(e.target.checked)}
            className="rounded bg-industrial-950 border-industrial-700 text-sky-500"
          />
          <span>Show Acknowledged Incidents</span>
        </label>
      </div>

      {/* 3. Alerts Stream */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-industrial-900/60 rounded-lg border border-industrial-800 text-industrial-400 font-mono text-xs flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <span className="text-emerald-300 font-bold text-sm">NO ACTIVE ALERTS FOUND</span>
            <span>All monitored parameters are within safe statistical thresholds.</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`bg-industrial-900/90 rounded-lg border p-4 shadow-panel transition-all ${
                  isCritical
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : isWarning
                    ? 'border-amber-500/45 bg-amber-950/10'
                    : 'border-industrial-700/60'
                } ${alert.acknowledged ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  {/* Left: Machine & Severity Badges */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 text-xs">
                        {alert.machineId}
                      </span>
                      <span className="font-semibold text-industrial-100 text-xs">
                        {alert.machineName}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-industrial-800 text-industrial-300 border border-industrial-700'
                        }`}
                      >
                        {alert.severity}
                      </span>

                      {/* Deduplication Counter */}
                      {alert.count > 1 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-industrial-950 text-industrial-300 border border-industrial-800">
                          Ongoing Event (Sampled {alert.count}x)
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-industrial-400 ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Updated: {formatTime(alert.lastUpdated)}
                      </span>
                    </div>

                    {/* Alert Message */}
                    <p className="text-sm font-sans text-industrial-200">
                      {alert.message}
                    </p>

                    {/* Parameter Values Comparison */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-industrial-950/70 p-2 rounded border border-industrial-800 font-mono text-xs">
                      <div>
                        <span className="text-industrial-500 text-[10px] block">PARAMETER:</span>
                        <span className="text-industrial-300 font-bold">{alert.parameter}</span>
                      </div>
                      <div>
                        <span className="text-industrial-500 text-[10px] block">MEASURED:</span>
                        <span className={isCritical ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                          {alert.currentValue} {alert.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-industrial-500 text-[10px] block">BASELINE:</span>
                        <span className="text-industrial-300">{alert.baselineValue} {alert.unit}</span>
                      </div>
                      <div>
                        <span className="text-industrial-500 text-[10px] block">DEVIATION:</span>
                        <span className={alert.deviationPercent > 0 ? 'text-rose-400 font-bold' : 'text-industrial-300'}>
                          {alert.deviationPercent > 0 ? `+${alert.deviationPercent}%` : `${alert.deviationPercent}%`}
                        </span>
                      </div>
                    </div>

                    {/* Suggested Action */}
                    <div className="text-xs font-mono text-sky-300 bg-sky-950/30 p-2 rounded border border-sky-900/40">
                      <strong>AI SUGGESTED ACTION:</strong> {alert.suggestedAction}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row md:flex-col items-center gap-2 shrink-0">
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-industrial-800 hover:bg-industrial-700 text-industrial-200 text-xs font-mono border border-industrial-700 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ACKNOWLEDGE</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-industrial-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" /> Acknowledged
                      </span>
                    )}

                    <Link
                      href={`/machines/${alert.machineId}`}
                      className="px-3 py-1.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 text-xs font-mono border border-sky-800/80 transition-colors"
                    >
                      Machine Diagnostics →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
