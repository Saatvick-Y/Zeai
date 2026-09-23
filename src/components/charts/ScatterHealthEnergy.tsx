'use client';

import React, { useMemo } from 'react';
import { EChartContainer } from './EChartContainer';
import { MachineEnergyProfile } from '@/types/energy';
import * as echarts from 'echarts';

interface ScatterHealthEnergyProps {
  profiles: MachineEnergyProfile[];
  height?: string | number;
}

export const ScatterHealthEnergy: React.FC<ScatterHealthEnergyProps> = ({
  profiles,
  height = '340px',
}) => {
  const options: echarts.EChartsOption = useMemo(() => {
    // Data points: [ActivePowerKw, HealthScore, MachineId, Name, Priority, Status]
    const data = profiles.map((p) => [
      p.activePowerKw,
      p.healthScore,
      p.machineId,
      p.name,
      p.priority,
      p.status,
    ]);

    const maxPower = Math.max(35, ...profiles.map((p) => p.activePowerKw * 1.2));
    const midPower = maxPower / 2;

    return {
      title: {
        text: 'MACHINE HEALTH vs ACTIVE POWER DEMAND',
        subtext: 'Identifies high energy + low health machines requiring immediate operational review',
        textStyle: { color: '#f1f5f9', fontSize: 13, fontFamily: 'Fira Code' },
        subtextStyle: { color: '#94a3b8', fontSize: 11, fontFamily: 'sans-serif' },
        left: 0,
        top: 0,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontFamily: 'Fira Code', fontSize: 11 },
        formatter: (params: any) => {
          const d = params.data;
          const power = d[0];
          const health = d[1];
          const id = d[2];
          const name = d[3];
          const priority = d[4];
          const status = d[5];

          let statusColor = '#10b981';
          if (status === 'warning') statusColor = '#f59e0b';
          if (status === 'critical') statusColor = '#ef4444';

          return `<div class="p-1 font-mono text-xs">
            <div class="font-bold text-sky-400 text-sm mb-1">${id}: ${name}</div>
            <div>Power Demand: <span class="text-amber-400 font-semibold">${power} kW</span></div>
            <div>Health Score: <span style="color:${statusColor}" class="font-semibold">${health} / 100</span></div>
            <div>Priority: <span class="text-purple-300 uppercase">${priority}</span></div>
            <div>Status: <span style="color:${statusColor}" class="uppercase font-bold">${status}</span></div>
          </div>`;
        },
      },
      grid: {
        left: '5%',
        right: '6%',
        bottom: '10%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        name: 'Active Power (kW)',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: '#94a3b8', fontFamily: 'Fira Code', fontSize: 11 },
        type: 'value',
        min: 0,
        max: Math.ceil(maxPower),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontFamily: 'Fira Code', fontSize: 10, formatter: '{value} kW' },
        splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
      },
      yAxis: {
        name: 'Machine Health Score',
        nameLocation: 'middle',
        nameGap: 36,
        nameTextStyle: { color: '#94a3b8', fontFamily: 'Fira Code', fontSize: 11 },
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontFamily: 'Fira Code', fontSize: 10, formatter: '{value}' },
        splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
      },
      series: [
        {
          type: 'scatter',
          symbolSize: (val: any) => 24,
          data: data,
          itemStyle: {
            color: (params: any) => {
              const status = params.data[5];
              const health = params.data[1];
              if (status === 'critical' || health < 60) return '#ef4444';
              if (status === 'warning' || health < 80) return '#f59e0b';
              return '#10b981';
            },
            borderColor: '#ffffff',
            borderWidth: 1.5,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
          label: {
            show: true,
            formatter: (params: any) => params.data[2],
            position: 'top',
            color: '#f8fafc',
            fontFamily: 'Fira Code',
            fontSize: 10,
            fontWeight: 'bold',
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { type: 'dashed', color: '#475569', width: 1 },
            data: [
              { yAxis: 75, name: 'Health Threshold' },
              { xAxis: midPower, name: 'Power Midpoint' },
            ],
          },
          markArea: {
            silent: true,
            itemStyle: { opacity: 0.08 },
            data: [
              [
                {
                  name: 'CRITICAL ATTENTION (High Power + Low Health)',
                  xAxis: midPower,
                  yAxis: 0,
                  itemStyle: { color: '#ef4444' },
                  label: {
                    position: 'insideBottomRight',
                    color: '#ef4444',
                    fontSize: 10,
                    fontFamily: 'Fira Code',
                  },
                },
                {
                  xAxis: maxPower,
                  yAxis: 75,
                },
              ],
              [
                {
                  name: 'OPTIMAL PRODUCTION (High Power + High Health)',
                  xAxis: midPower,
                  yAxis: 75,
                  itemStyle: { color: '#10b981' },
                  label: {
                    position: 'insideTopRight',
                    color: '#10b981',
                    fontSize: 10,
                    fontFamily: 'Fira Code',
                  },
                },
                {
                  xAxis: maxPower,
                  yAxis: 100,
                },
              ],
            ],
          },
        },
      ],
    };
  }, [profiles]);

  return <EChartContainer options={options} height={height} />;
};
