'use client';

import React from 'react';
import Link from 'next/link';
import { useTelemetry } from '@/context/TelemetryContext';
import { AlertTriangle, Sparkles, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export const QuickAlerts: React.FC = () => {
  const { alerts, aiInsights, acknowledgeAlert } = useTelemetry();

  const activeAlerts = alerts.filter((a) => !a.acknowledged).slice(0, 3);
  const topInsights = aiInsights.slice(0, 2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* Active Incident Feed */}
      <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-industrial-800/80 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-industrial-200 tracking-wider">
                ACTIVE INCIDENT LOG ({alerts.length})
              </h3>
            </div>
            <Link
              href="/alerts"
              className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {activeAlerts.length === 0 ? (
              <div className="p-4 text-center rounded bg-industrial-950/40 border border-industrial-800/60 text-xs font-mono text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>All 10 machine channels within normal operating limits</span>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded border text-xs font-mono flex items-start justify-between gap-2 transition-all ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-industrial-950 border-industrial-800 text-industrial-300'
                  }`}
                >
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sky-300">{alert.machineId}</span>
                      <span className="text-[10px] px-1.5 rounded uppercase font-bold bg-industrial-950/60 border border-industrial-700">
                        {alert.severity}
                      </span>
                      {alert.count > 1 && (
                        <span className="text-[10px] text-industrial-400">
                          (Repeated {alert.count}x)
                        </span>
                      )}
                      <span className="text-[10px] text-industrial-400 ml-auto">
                        {formatTime(alert.lastUpdated)}
                      </span>
                    </div>
                    <p className="text-[11px] text-industrial-200 line-clamp-1">{alert.message}</p>
                  </div>

                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-industrial-800 hover:bg-industrial-700 text-industrial-300 border border-industrial-700 shrink-0"
                  >
                    ACK
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Real-time AI Reasoning Highlights */}
      <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-industrial-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-industrial-200 tracking-wider">
                AI DECISION SUPPORT INSIGHTS
              </h3>
            </div>
            <Link
              href="/ai"
              className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
            >
              Full Reasoning Feed <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {topInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-2.5 rounded bg-industrial-950/60 border border-purple-900/40 text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sky-400">{insight.machineId}</span>
                    <span className="text-purple-300 font-semibold text-[11px] truncate max-w-[200px]">
                      {insight.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60 font-bold">
                    {insight.confidence}% CONFIDENCE
                  </span>
                </div>
                <p className="text-[11px] text-industrial-300 line-clamp-1">{insight.recommendedAction}</p>
                <div className="flex items-center justify-between text-[10px] text-industrial-400 pt-0.5 border-t border-industrial-800/50">
                  <span>Impact: {insight.operationalImpact.estimatedCostSavings}</span>
                  <span className="text-sky-400">Risk: {insight.operationalImpact.productionRisk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
