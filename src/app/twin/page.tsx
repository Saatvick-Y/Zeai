'use client';

import React, { useState } from 'react';
import { DigitalTwinCanvas } from '@/components/digitaltwin/DigitalTwinCanvas';
import { useTelemetry } from '@/context/TelemetryContext';
import { MACHINES_CONFIG } from '@/config/machines';
import { Box, Layers, Thermometer, Activity, Zap, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FactoryTwinPage() {
  const { fleet } = useTelemetry();
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'physical' | 'thermal' | 'vibration' | 'energy'>('physical');

  return (
    <div className="space-y-4">
      {/* Header & Spatial Layer Selector */}
      <div className="bg-industrial-900/90 rounded-lg border border-industrial-700/60 p-4 shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-sky-400" />
            <h1 className="text-base font-bold uppercase text-industrial-100">
              FACTORY SPATIAL DIGITAL TWIN
            </h1>
          </div>
          <p className="text-xs text-industrial-400 font-sans mt-0.5">
            Interactive 3D Plant Model • 10-Machine Real-Time Spatial Telemetry & Environmental Overlays
          </p>
        </div>

        {/* Spatial Layers Switcher */}
        <div className="flex items-center gap-1.5 bg-industrial-950 p-1 rounded-lg border border-industrial-800 text-xs">
          <Layers className="w-3.5 h-3.5 text-industrial-400 ml-1.5" />
          <span className="text-industrial-500 text-[10px]">LAYER:</span>
          {[
            { id: 'physical', label: 'PHYSICAL', icon: <Cpu className="w-3 h-3" /> },
            { id: 'thermal', label: 'THERMAL', icon: <Thermometer className="w-3 h-3" /> },
            { id: 'vibration', label: 'VIBRATION', icon: <Activity className="w-3 h-3" /> },
            { id: 'energy', label: 'ENERGY', icon: <Zap className="w-3 h-3" /> },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as any)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                activeLayer === layer.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'text-industrial-400 hover:text-industrial-200'
              }`}
            >
              {layer.icon}
              <span>{layer.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Full Viewport 3D Canvas */}
      <div className="relative">
        <DigitalTwinCanvas
          height="680px"
          selectedMachineId={selectedMachineId}
          onSelectMachine={setSelectedMachineId}
          showControlsBar={true}
        />
      </div>
    </div>
  );
}
