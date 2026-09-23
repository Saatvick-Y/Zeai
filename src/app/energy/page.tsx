'use client';

import React from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { EnergyFlowDiagram } from '@/components/energy/EnergyFlowDiagram';
import { EnergyHeatmap } from '@/components/energy/EnergyHeatmap';
import { ScatterHealthEnergy } from '@/components/charts/ScatterHealthEnergy';
import { formatKw, formatKwh } from '@/lib/utils';
import { Zap, Activity, DollarSign, Award, TrendingUp } from 'lucide-react';

export default function EnergyIntelligencePage() {
  const { energyMetrics } = useTelemetry();
  const { overview, profiles } = energyMetrics;

  return (
    <div className="space-y-4 font-mono">
      {/* 1. Header & Quick Energy Demand Indicators */}
      <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h1 className="text-base font-bold uppercase text-industrial-100">
              ENERGY INTELLIGENCE & LOAD TOPOLOGY
            </h1>
          </div>
          <p className="text-xs text-industrial-400 font-sans mt-0.5">
            Spatial Energy Distribution • 3-Tier Plant Topology • Time-Series Intensity Heatmap
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-industrial-950 px-3 py-1.5 rounded border border-industrial-800">
            TOTAL DEMAND: <strong className="text-amber-300">{formatKw(overview.totalDemandKw)}</strong>
          </div>
          <div className="bg-industrial-950 px-3 py-1.5 rounded border border-industrial-800">
            PEAK TODAY: <strong className="text-rose-400">{formatKw(overview.peakDemandTodayKw)}</strong>
          </div>
        </div>
      </div>

      {/* 2. Plant Energy Flow Topology (3-Tier Diagram) */}
      <section>
        <EnergyFlowDiagram />
      </section>

      {/* 3. Heatmap & 4-Quadrant Scatter Matrix in 2-column layout */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Time-Series Energy Intensity Heatmap */}
        <div>
          <EnergyHeatmap />
        </div>

        {/* 4-Quadrant Health vs Active Power Scatter Matrix */}
        <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel">
          <ScatterHealthEnergy profiles={profiles} height="300px" />
        </div>
      </section>
    </div>
  );
}
