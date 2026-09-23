'use client';

import React from 'react';
import { MACHINES_CONFIG } from '@/config/machines';
import { useTelemetry } from '@/context/TelemetryContext';
import { MachineCard } from './MachineCard';

export const MachineFleetGrid: React.FC = () => {
  const { fleet } = useTelemetry();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {MACHINES_CONFIG.map((config) => (
        <MachineCard
          key={config.id}
          config={config}
          telemetry={fleet[config.id]}
        />
      ))}
    </div>
  );
};
