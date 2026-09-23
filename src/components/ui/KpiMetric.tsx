import React from 'react';

interface KpiMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'normal' | 'warning' | 'critical' | 'neutral';
  icon?: React.ReactNode;
}

export const KpiMetric: React.FC<KpiMetricProps> = ({
  label,
  value,
  unit,
  subValue,
  trend,
  trendValue,
  status = 'neutral',
  icon,
}) => {
  const statusBorder = {
    normal: 'border-industrial-700/60 hover:border-emerald-500/40',
    warning: 'border-amber-500/40 shadow-glow-amber',
    critical: 'border-rose-500/50 shadow-glow-rose',
    neutral: 'border-industrial-700/60 hover:border-industrial-600',
  }[status];

  const statusText = {
    normal: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-rose-400',
    neutral: 'text-industrial-100',
  }[status];

  return (
    <div
      className={`bg-industrial-900/90 rounded-lg p-3.5 border transition-all duration-200 ${statusBorder} flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between text-industrial-400 mb-1.5">
        <span className="text-xs uppercase tracking-wider font-mono font-medium">{label}</span>
        {icon && <span className="text-industrial-400">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1.5 my-0.5">
        <span className={`text-2xl font-mono font-semibold tracking-tight ${statusText}`}>
          {value}
        </span>
        {unit && <span className="text-xs font-mono text-industrial-400">{unit}</span>}
      </div>

      {(subValue || trendValue) && (
        <div className="flex items-center justify-between text-[11px] font-mono text-industrial-400 mt-1 pt-1.5 border-t border-industrial-800/80">
          {subValue && <span>{subValue}</span>}
          {trendValue && (
            <span
              className={
                trend === 'up'
                  ? 'text-amber-400'
                  : trend === 'down'
                  ? 'text-emerald-400'
                  : 'text-industrial-400'
              }
            >
              {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
