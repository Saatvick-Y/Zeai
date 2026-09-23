import React from 'react';
import { MachineStatus, ConnectionState } from '@/types/telemetry';
import { getStatusColor, getConnectionLabel } from '@/lib/utils';

interface StatusBadgeProps {
  status: MachineStatus;
  connectionState?: ConnectionState;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  connectionState = 'connected',
  size = 'md',
  showLabel = true,
}) => {
  const colors = getStatusColor(status);
  const conn = getConnectionLabel(connectionState);

  const isDisconnected = connectionState !== 'connected';
  const displayStatus = isDisconnected && connectionState === 'stale' ? 'STALE' : status.toUpperCase();

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div
      className={`inline-flex items-center rounded-md border font-mono tracking-wider transition-all duration-200 ${colors.badge} ${sizeStyles[size]}`}
    >
      <span className={`rounded-full ${colors.dot} ${dotSizes[size]} ${status === 'critical' ? 'animate-ping' : ''}`} />
      {showLabel && <span>{displayStatus}</span>}
    </div>
  );
};
