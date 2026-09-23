'use client';

import React from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { KpiMetric } from '../ui/KpiMetric';
import { Zap, Cpu, HeartPulse, DollarSign, TrendingUp, AlertOctagon } from 'lucide-react';
import { formatKw, formatKwh } from '@/lib/utils';

export const FleetKpiGrid: React.FC = () => {
  const { fleet, energyMetrics, alerts } = useTelemetry();

  const activeCount = Object.values(fleet).filter((t) => t.status !== 'offline').length;
  const warningCount = Object.values(fleet).filter((t) => t.status === 'warning').length;
  const criticalCount = Object.values(fleet).filter((t) => t.status === 'critical').length;

  const avgHealth = Math.round(
    Object.values(fleet).reduce((sum, t) => sum + t.machineHealth, 0) / Math.max(1, Object.values(fleet).length)
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <KpiMetric
        label="Active Demand"
        value={energyMetrics.overview.totalDemandKw}
        unit="kW"
        subValue={`Peak: ${energyMetrics.overview.peakDemandTodayKw} kW`}
        trend="neutral"
        status={energyMetrics.overview.totalDemandKw > 165 ? 'warning' : 'normal'}
        icon={<Zap className="w-4 h-4 text-amber-400" />}
      />

      <KpiMetric
        label="Energy Today"
        value={formatKwh(energyMetrics.overview.energyTodayKwh)}
        subValue={`Week: ${formatKwh(energyMetrics.overview.energyThisWeekKwh)}`}
        trend="neutral"
        status="neutral"
        icon={<TrendingUp className="w-4 h-4 text-sky-400" />}
      />

      <KpiMetric
        label="Fleet Health"
        value={`${avgHealth}`}
        unit="/ 100"
        subValue={criticalCount > 0 ? `${criticalCount} Critical Failure Risk` : warningCount > 0 ? `${warningCount} Warning Lines` : 'All Systems Nominal'}
        status={criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'normal'}
        icon={<HeartPulse className="w-4 h-4 text-rose-400" />}
      />

      <KpiMetric
        label="Active Machines"
        value={`${activeCount}`}
        unit="/ 10"
        subValue={`Normal: ${activeCount - warningCount - criticalCount} | Warn: ${warningCount}`}
        status={criticalCount > 0 ? 'critical' : 'normal'}
        icon={<Cpu className="w-4 h-4 text-emerald-400" />}
      />

      <KpiMetric
        label="Efficiency Index"
        value={`${energyMetrics.overview.fleetEfficiencyPct}%`}
        subValue={`Avg PF: ${energyMetrics.overview.powerFactorAverage}`}
        trend="up"
        trendValue="Target 92%"
        status={energyMetrics.overview.fleetEfficiencyPct < 80 ? 'warning' : 'normal'}
        icon={<TrendingUp className="w-4 h-4 text-purple-400" />}
      />

      <KpiMetric
        label="Est. Mo. Savings"
        value={`$${energyMetrics.overview.estimatedMonthlyCostSavings}`}
        subValue="Via Peak Shaving & AI"
        trend="down"
        trendValue="Grid Tariff -9%"
        status="normal"
        icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
      />
    </div>
  );
};
