'use client';

import React from 'react';
import { MACHINES_CONFIG } from '@/config/machines';
import { useTelemetry } from '@/context/TelemetryContext';
import { formatKw } from '@/lib/utils';
import { Zap, ArrowDown, Activity } from 'lucide-react';

export const EnergyFlowDiagram: React.FC = () => {
  const { fleet, energyMetrics } = useTelemetry();

  // Zone groups
  const bay1Machines = MACHINES_CONFIG.filter((m) => ['M01', 'M02', 'M03'].includes(m.id));
  const bay2Machines = MACHINES_CONFIG.filter((m) => ['M04', 'M05', 'M06'].includes(m.id));
  const bay3Machines = MACHINES_CONFIG.filter((m) => ['M07', 'M08', 'M09', 'M10'].includes(m.id));

  const getZoneTotalKw = (machines: typeof MACHINES_CONFIG) => {
    return machines.reduce((sum, m) => {
      const t = fleet[m.id];
      return sum + (t && t.status !== 'offline' ? t.activePower : 0);
    }, 0);
  };

  const bay1Kw = getZoneTotalKw(bay1Machines);
  const bay2Kw = getZoneTotalKw(bay2Machines);
  const bay3Kw = getZoneTotalKw(bay3Machines);

  return (
    <div className="bg-industrial-950/80 rounded-lg border border-industrial-800 p-4 font-mono space-y-4">
      <div className="flex items-center justify-between border-b border-industrial-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase text-industrial-100">
            PLANT ENERGY FLOW TOPOLOGY
          </h3>
        </div>
        <span className="text-[11px] text-industrial-400">
          Grid Intake: <strong>{formatKw(energyMetrics.overview.totalDemandKw)}</strong>
        </span>
      </div>

      {/* 3-Tier Flow Diagram */}
      <div className="space-y-3 text-xs">
        {/* Tier 1: Main High-Voltage Substation */}
        <div className="p-3 rounded bg-industrial-900 border border-sky-600/50 text-center max-w-sm mx-auto shadow-lg shadow-sky-950/40">
          <div className="flex items-center justify-center gap-2 text-sky-300 font-bold">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>PRIMARY 11kV / 400V PLANT SUBSTATION</span>
          </div>
          <div className="text-amber-300 text-sm font-bold mt-1">
            Total Demand: {formatKw(energyMetrics.overview.totalDemandKw)}
          </div>
        </div>

        {/* Downward Pulse Vectors */}
        <div className="flex justify-around text-industrial-600 text-[10px]">
          <span>↓↓↓ BUS A ↓↓↓</span>
          <span>↓↓↓ BUS B ↓↓↓</span>
          <span>↓↓↓ BUS C ↓↓↓</span>
        </div>

        {/* Tier 2: 3 Production Bays */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Bay 1 North */}
          <div className="bg-industrial-900/90 p-3 rounded border border-industrial-700 space-y-2">
            <div className="flex justify-between items-center text-sky-400 font-bold border-b border-industrial-800 pb-1">
              <span>BAY 1: PRIMARY MILLING</span>
              <span className="text-amber-300">{formatKw(bay1Kw)}</span>
            </div>
            <div className="space-y-1 text-[11px]">
              {bay1Machines.map((m) => (
                <div key={m.id} className="flex justify-between text-industrial-300">
                  <span>{m.id}: {m.name.split(' ')[0]}</span>
                  <span className="text-amber-400 font-bold">{formatKw(fleet[m.id]?.activePower || 0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bay 2 East */}
          <div className="bg-industrial-900/90 p-3 rounded border border-industrial-700 space-y-2">
            <div className="flex justify-between items-center text-sky-400 font-bold border-b border-industrial-800 pb-1">
              <span>BAY 2: MOLDING & FORGE</span>
              <span className="text-amber-300">{formatKw(bay2Kw)}</span>
            </div>
            <div className="space-y-1 text-[11px]">
              {bay2Machines.map((m) => (
                <div key={m.id} className="flex justify-between text-industrial-300">
                  <span>{m.id}: {m.name.split(' ')[0]}</span>
                  <span className="text-amber-400 font-bold">{formatKw(fleet[m.id]?.activePower || 0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bay 3 Utility */}
          <div className="bg-industrial-900/90 p-3 rounded border border-industrial-700 space-y-2">
            <div className="flex justify-between items-center text-sky-400 font-bold border-b border-industrial-800 pb-1">
              <span>BAY 3: UTILITY & LOGISTICS</span>
              <span className="text-amber-300">{formatKw(bay3Kw)}</span>
            </div>
            <div className="space-y-1 text-[11px]">
              {bay3Machines.map((m) => (
                <div key={m.id} className="flex justify-between text-industrial-300">
                  <span>{m.id}: {m.name.split(' ')[0]}</span>
                  <span className="text-amber-400 font-bold">{formatKw(fleet[m.id]?.activePower || 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
