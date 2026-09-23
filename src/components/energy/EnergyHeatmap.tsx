'use client';

import React, { useState } from 'react';
import { MACHINES_CONFIG } from '@/config/machines';
import { useTelemetry } from '@/context/TelemetryContext';
import { Layers } from 'lucide-react';

export const EnergyHeatmap: React.FC = () => {
  const { fleet } = useTelemetry();
  const [resolution, setResolution] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  // Time buckets representation (e.g. 12 time intervals)
  const timeBuckets = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
  ];

  const getHeatmapColor = (machineId: string, bucketIdx: number) => {
    const t = fleet[machineId];
    const power = t ? t.activePower : 10;
    // Calculate synthetic historical load pattern for each bucket
    const factor = Math.sin((bucketIdx / 12) * Math.PI) * 0.4 + 0.6;
    const loadRatio = Math.min(1.0, (power * factor) / 30);

    if (loadRatio > 0.75) return 'bg-amber-500 text-industrial-950 font-bold';
    if (loadRatio > 0.45) return 'bg-sky-500/70 text-industrial-950 font-bold';
    if (loadRatio > 0.2) return 'bg-sky-900/60 text-sky-200';
    return 'bg-industrial-950 text-industrial-600';
  };

  return (
    <div className="bg-industrial-950/80 rounded-lg border border-industrial-800 p-4 font-mono space-y-3">
      <div className="flex items-center justify-between border-b border-industrial-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase text-industrial-100">
            TIME-SERIES ENERGY CONSUMPTION HEATMAP
          </h3>
        </div>

        {/* Time Resolution Dropdown */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-industrial-500 text-[10px]">WINDOW:</span>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as any)}
            className="bg-industrial-900 text-sky-300 font-bold px-2.5 py-1 rounded border border-industrial-700 outline-none cursor-pointer"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr>
              <th className="py-1.5 px-2 text-left text-industrial-500 text-[10px] w-28">ASSET</th>
              {timeBuckets.map((bucket, i) => (
                <th key={i} className="py-1.5 px-1 text-[10px] text-industrial-400">
                  {bucket}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-900">
            {MACHINES_CONFIG.map((m) => (
              <tr key={m.id}>
                <td className="py-1 px-2 text-left font-bold text-sky-400 text-[11px]">
                  {m.id}
                </td>
                {timeBuckets.map((_, bucketIdx) => {
                  const colorClass = getHeatmapColor(m.id, bucketIdx);
                  return (
                    <td key={bucketIdx} className="p-0.5">
                      <div className={`h-6 rounded text-[10px] flex items-center justify-center ${colorClass}`}>
                        {Math.round((fleet[m.id]?.activePower || 5) * (0.6 + bucketIdx * 0.03))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[10px] text-industrial-500 pt-2 border-t border-industrial-900">
        <span>Values in Active Power (kW)</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-industrial-950 border border-industrial-700" /> Low</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-900/60" /> Nominal</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-500/70" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Peak</span>
        </div>
      </div>
    </div>
  );
};
