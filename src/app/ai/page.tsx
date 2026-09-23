'use client';

import React from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { Sparkles, BrainCircuit, ShieldAlert, Zap, TrendingDown, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { getPriorityBadge } from '@/lib/utils';
import Link from 'next/link';

export default function AIInsightsPage() {
  const { aiInsights } = useTelemetry();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h1 className="text-base font-mono font-bold uppercase text-industrial-100">
              AI DECISION ENGINE & PREDICTIVE HEALTH REASONING
            </h1>
          </div>
          <p className="text-xs text-industrial-400 font-sans mt-0.5">
            Production-Aware Anomaly Correlation, Evidence Deconstruction & Operational Impact Projections
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded border border-purple-800/60">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>ACTIVE REASONING ENGINE: <strong>ONLINE (v2.4)</strong></span>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="space-y-4">
        {aiInsights.map((insight) => {
          const priorityBadge = getPriorityBadge(insight.priority);

          return (
            <div
              key={insight.id}
              className="bg-industrial-900/90 rounded-lg border border-purple-900/40 p-5 shadow-panel space-y-4"
            >
              {/* Top Banner: ID, Title, Confidence, Priority */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-industrial-800 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded border border-sky-800">
                    {insight.machineId}
                  </span>
                  <span className="font-semibold text-industrial-100 text-sm">
                    {insight.machineName}
                  </span>
                  <span className={`px-2 py-0.2 rounded border text-[10px] font-mono font-bold ${priorityBadge.style}`}>
                    {priorityBadge.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    CONFIDENCE: {insight.confidence}%
                  </span>
                </div>
              </div>

              {/* Title & Diagnostic Summary */}
              <div>
                <h3 className="text-sm font-mono font-bold text-amber-300 mb-1">
                  {insight.title}
                </h3>
                <p className="text-xs text-industrial-300 font-sans">
                  {insight.summary}
                </p>
              </div>

              {/* Measured Evidence Matrix (Section 16 requirement) */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-industrial-400">
                  EMPIRICAL TELEMETRY EVIDENCE
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {insight.evidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="bg-industrial-950/80 p-2.5 rounded border border-industrial-800 font-mono text-xs space-y-1"
                    >
                      <div className="text-industrial-400 text-[11px] font-semibold">{ev.parameter}</div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-industrial-100 font-bold">{ev.measured}</span>
                        <span className="text-industrial-500 text-[10px]">Base: {ev.baseline}</span>
                      </div>
                      <div className="text-[10px] pt-1 border-t border-industrial-900 flex justify-between">
                        <span className="text-industrial-400">Deviation:</span>
                        <span className={ev.severity === 'critical' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                          {ev.deviation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Root Cause Hypotheses & Recommended Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Potential Causes */}
                <div className="bg-industrial-950/60 p-3 rounded border border-industrial-800 space-y-1.5 font-mono text-xs">
                  <span className="text-industrial-400 uppercase font-bold text-[11px] block">
                    POTENTIAL CONTRIBUTING FACTORS:
                  </span>
                  <ul className="space-y-1 text-industrial-300 list-disc list-inside">
                    {insight.potentialCauses.map((cause, idx) => (
                      <li key={idx} className="text-[11px]">{cause}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Operational Action */}
                <div className="bg-sky-950/30 p-3 rounded border border-sky-900/50 space-y-1.5 font-mono text-xs flex flex-col justify-between">
                  <div>
                    <span className="text-sky-300 uppercase font-bold text-[11px] block">
                      AI RECOMMENDED ACTION:
                    </span>
                    <p className="text-industrial-200 text-xs mt-1">
                      {insight.recommendedAction}
                    </p>
                  </div>
                  <div className="text-[11px] text-sky-400 pt-2 border-t border-sky-900/40">
                    Intervention Timeframe: <strong>{insight.operationalImpact.timeToIntervention}</strong>
                  </div>
                </div>
              </div>

              {/* Operational & Energy Impact Bar */}
              <div className="bg-industrial-950 p-3 rounded border border-industrial-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-industrial-500 text-[10px] block">ESTIMATED BENEFIT:</span>
                    <span className="text-emerald-400 font-bold">{insight.operationalImpact.estimatedCostSavings}</span>
                  </div>
                  <div className="h-6 w-px bg-industrial-800 hidden sm:block" />
                  <div>
                    <span className="text-industrial-500 text-[10px] block">PRODUCTION RISK:</span>
                    <span className="text-sky-300 font-bold">{insight.operationalImpact.productionRisk}</span>
                  </div>
                </div>

                {insight.machineId !== 'FLEET' && (
                  <Link
                    href={`/machines/${insight.machineId}`}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 underline self-end sm:self-auto"
                  >
                    Inspect Channel <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
