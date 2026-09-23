'use client';

import React, { useMemo } from 'react';
import { EChartContainer } from './EChartContainer';
import { TelemetryHistoryPoint } from '@/types/telemetry';
import { formatTime } from '@/lib/utils';
import * as echarts from 'echarts';

interface RealtimeWaveChartProps {
  history: TelemetryHistoryPoint[];
  metric: 'temperature' | 'vibrationRms' | 'activePower' | 'current' | 'powerFactor';
  title?: string;
  unit?: string;
  color?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  height?: string | number;
}

export const RealtimeWaveChart: React.FC<RealtimeWaveChartProps> = ({
  history,
  metric,
  title,
  unit = '',
  color = '#38bdf8',
  warningThreshold,
  criticalThreshold,
  height = '240px',
}) => {
  const options: echarts.EChartsOption = useMemo(() => {
    const times = history.map((h) => formatTime(h.timestamp));
    const values = history.map((h) => h[metric] as number);

    const markLines: echarts.MarkLineComponentOption['data'] = [];
    if (warningThreshold !== undefined) {
      markLines.push({
        yAxis: warningThreshold,
        name: 'Warning',
        lineStyle: { color: '#f59e0b', type: 'dashed', width: 1.5 },
        label: { formatter: 'Warn: {c}', position: 'end', color: '#f59e0b', fontSize: 10 },
      });
    }
    if (criticalThreshold !== undefined) {
      markLines.push({
        yAxis: criticalThreshold,
        name: 'Critical',
        lineStyle: { color: '#ef4444', type: 'dashed', width: 1.5 },
        label: { formatter: 'Crit: {c}', position: 'end', color: '#ef4444', fontSize: 10 },
      });
    }

    return {
      title: title
        ? {
            text: title,
            textStyle: { color: '#cbd5e1', fontSize: 12, fontFamily: 'Fira Code' },
            left: 0,
            top: 0,
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontFamily: 'Fira Code', fontSize: 11 },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `<div class="font-mono text-xs">
            <span class="text-slate-400">${p.name}</span><br/>
            <span style="color:${color}" class="font-bold">${p.value} ${unit}</span>
          </div>`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: title ? '18%' : '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: times,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 9, fontFamily: 'Fira Code' },
        splitLine: { show: true, lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 9,
          fontFamily: 'Fira Code',
          formatter: `{value} ${unit}`,
        },
        splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
      },
      series: [
        {
          name: title || metric,
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: values,
          itemStyle: { color },
          lineStyle: { width: 2, color },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${color}40` },
              { offset: 1, color: `${color}00` },
            ]),
          },
          markLine: markLines.length > 0 ? { data: markLines, symbol: 'none' } : undefined,
        },
      ],
      animationDuration: 300,
    };
  }, [history, metric, title, unit, color, warningThreshold, criticalThreshold]);

  return <EChartContainer options={options} height={height} />;
};
