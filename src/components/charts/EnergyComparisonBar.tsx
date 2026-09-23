'use client';

import React, { useMemo } from 'react';
import { EChartContainer } from './EChartContainer';
import { MachineEnergyProfile } from '@/types/energy';
import * as echarts from 'echarts';

interface EnergyComparisonBarProps {
  profiles: MachineEnergyProfile[];
  height?: string | number;
}

export const EnergyComparisonBar: React.FC<EnergyComparisonBarProps> = ({
  profiles,
  height = '300px',
}) => {
  const options: echarts.EChartsOption = useMemo(() => {
    const ids = profiles.map((p) => p.machineId);
    const activeKw = profiles.map((p) => p.activePowerKw);
    const dailyKwh = profiles.map((p) => p.energyConsumedTodayKwh);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontFamily: 'Fira Code', fontSize: 11 },
      },
      legend: {
        data: ['Active Demand (kW)', 'Energy Today (kWh)'],
        textStyle: { color: '#94a3b8', fontFamily: 'Fira Code', fontSize: 11 },
        top: 0,
        right: '4%',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '16%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: ids,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#cbd5e1', fontFamily: 'Fira Code', fontSize: 11 },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Demand (kW)',
          nameTextStyle: { color: '#94a3b8', fontFamily: 'Fira Code', fontSize: 10 },
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontFamily: 'Fira Code', fontSize: 9 },
          splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
        },
        {
          type: 'value',
          name: 'Energy (kWh)',
          nameTextStyle: { color: '#94a3b8', fontFamily: 'Fira Code', fontSize: 10 },
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontFamily: 'Fira Code', fontSize: 9 },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Active Demand (kW)',
          type: 'bar',
          data: activeKw,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#38bdf8' },
              { offset: 1, color: '#0284c7' },
            ]),
            borderRadius: [3, 3, 0, 0],
          },
        },
        {
          name: 'Energy Today (kWh)',
          type: 'bar',
          yAxisIndex: 1,
          data: dailyKwh,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#047857' },
            ]),
            borderRadius: [3, 3, 0, 0],
          },
        },
      ],
    };
  }, [profiles]);

  return <EChartContainer options={options} height={height} />;
};
