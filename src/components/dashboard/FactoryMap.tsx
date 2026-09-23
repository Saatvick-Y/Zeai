'use client';

import React from 'react';
import Link from 'next/link';
import { MACHINES_CONFIG } from '@/config/machines';
import { useTelemetry } from '@/context/TelemetryContext';
import { getStatusColor, formatKw } from '@/lib/utils';
import { MapPin, Zap, Activity } from 'lucide-react';

export const FactoryMap: React.FC = () => {
  const { fleet } = useTelemetry();

  // Layout arrangement per section 14:
  // Row 1: M01, M02, M03
  // Row 2: M04, [corridor/empty], M05
  // Row 3: M06, M07, M08, M09
  // Row 4: M10
  const row1 = MACHINES_CONFIG.filter((m) => ['M01', 'M02', 'M03'].includes(m.id));
  const m04 = MACHINES_CONFIG.find((m) => m.id === 'M04')!;
  const m05 = MACHINES_CONFIG.find((m) => m.id === 'M05')!;
  const row3 = MACHINES_CONFIG.filter((m) => ['M06', 'M07', 'M08', 'M09'].includes(m.id));
  const m10 = MACHINES_CONFIG.find((m) => m.id === 'M10')!;

  const renderNode = (config: typeof MACHINES_CONFIG[0]) => {
    const t = fleet[config.id];
    const status = t ? t.status : 'offline';
    const colors = getStatusColor(status);
    const power = t ? t.activePower : 0;
    const health = t ? t.machineHealth : 100;

    return (
      <Link
        key={config.id}
        href={`/machines/${config.id}`}
        className={`bg-industrial-950/90 rounded-md border p-2.5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg flex flex-col justify-between ${colors.border} ${status === 'critical' ? 'bg-rose-950/20 shadow-glow-rose' : ''}`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-800/60">
            {config.id}
          </span>
          <span className={`w-2 h-2 rounded-full ${colors.dot} ${status === 'critical' ? 'animate-ping' : ''}`} />
        </div>

        <div className="text-[11px] font-semibold text-industrial-200 truncate mb-1" title={config.name}>
          {config.name.split(' ')[0]} {config.name.split(' ')[1] || ''}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-industrial-400 pt-1 border-t border-industrial-800">
          <span className="text-amber-300 flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" /> {formatKw(power)}
          </span>
          <span className={health < 75 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
            {health}%
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel">
      <div className="flex items-center justify-between mb-3 border-b border-industrial-800/80 pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-mono font-bold uppercase text-industrial-200 tracking-wider">
            FACTORY FLOOR LOGICAL MAP
          </h3>
        </div>
        <span className="text-[10px] font-mono text-industrial-400">
          BAY 1 - CENTRAL - BAY 2 - UTILITY
        </span>
      </div>

      <div className="space-y-3 bg-industrial-950/40 p-3 rounded border border-industrial-800/60">
        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-3">
          {row1.map(renderNode)}
        </div>

        {/* Row 2 with central production corridor */}
        <div className="grid grid-cols-3 gap-3 items-center">
          {renderNode(m04)}
          <div className="border border-dashed border-industrial-800 rounded p-2 text-center text-[10px] font-mono text-industrial-500 bg-industrial-950/20">
            --- MAIN PRODUCTION CORRIDOR & AGV TRANSIT ---
          </div>
          {renderNode(m05)}
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-4 gap-3">
          {row3.map(renderNode)}
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1" />
          <div className="col-span-2">
            {renderNode(m10)}
          </div>
          <div className="col-span-1" />
        </div>
      </div>
    </div>
  );
};
