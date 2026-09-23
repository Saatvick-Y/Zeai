'use client';

import React, { useState } from 'react';
import { MACHINES_CONFIG } from '@/config/machines';
import { useTelemetry } from '@/context/TelemetryContext';
import { MachineCard } from '@/components/dashboard/MachineCard';
import { Server, Filter, ArrowUpDown } from 'lucide-react';
import { ProductionPriority } from '@/types/telemetry';

export default function MachinesPage() {
  const { fleet } = useTelemetry();
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'health' | 'power' | 'temp' | 'vib'>('id');

  const filteredMachines = MACHINES_CONFIG.filter((m) => {
    const t = fleet[m.id];
    const status = t ? t.status : 'offline';

    if (filterPriority !== 'all' && m.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    return true;
  }).sort((a, b) => {
    const tA = fleet[a.id];
    const tB = fleet[b.id];

    if (sortBy === 'health') {
      return (tA ? tA.machineHealth : 100) - (tB ? tB.machineHealth : 100);
    }
    if (sortBy === 'power') {
      return (tB ? tB.activePower : 0) - (tA ? tA.activePower : 0);
    }
    if (sortBy === 'temp') {
      return (tB ? tB.temperature : 0) - (tA ? tA.temperature : 0);
    }
    if (sortBy === 'vib') {
      return (tB ? tB.vibrationRms : 0) - (tA ? tA.vibrationRms : 0);
    }
    return a.id.localeCompare(b.id);
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-industrial-900/90 p-4 rounded-lg border border-industrial-700/60 shadow-panel">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-sky-400" />
            <h1 className="text-base font-mono font-bold uppercase text-industrial-100">
              INDUSTRIAL MACHINE FLEET DIRECTORY
            </h1>
          </div>
          <p className="text-xs text-industrial-400 font-sans mt-0.5">
            10 Modular Edge-monitored Production Assets (RS-485 Modbus Telemetry)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-industrial-950 px-2.5 py-1 rounded border border-industrial-800">
            <Filter className="w-3 h-3 text-industrial-400" />
            <span className="text-industrial-400">PRIORITY:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-industrial-200 outline-none cursor-pointer"
            >
              <option value="all">ALL (10)</option>
              <option value="critical">CRITICAL</option>
              <option value="high">HIGH</option>
              <option value="medium">MEDIUM</option>
              <option value="low">LOW</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-industrial-950 px-2.5 py-1 rounded border border-industrial-800">
            <span className="text-industrial-400">STATUS:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-industrial-200 outline-none cursor-pointer"
            >
              <option value="all">ALL STATUSES</option>
              <option value="normal">NORMAL</option>
              <option value="warning">WARNING</option>
              <option value="critical">CRITICAL</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-industrial-950 px-2.5 py-1 rounded border border-industrial-800">
            <ArrowUpDown className="w-3 h-3 text-industrial-400" />
            <span className="text-industrial-400">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-industrial-200 outline-none cursor-pointer"
            >
              <option value="id">Machine ID</option>
              <option value="health">Lowest Health</option>
              <option value="power">Highest Power</option>
              <option value="temp">Highest Temp</option>
              <option value="vib">Highest Vibration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {filteredMachines.map((config) => (
          <MachineCard
            key={config.id}
            config={config}
            telemetry={fleet[config.id]}
          />
        ))}
      </div>
    </div>
  );
}
