'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartContainerProps {
  options: echarts.EChartsOption;
  height?: string | number;
  className?: string;
}

export const EChartContainer: React.FC<EChartContainerProps> = ({
  options,
  height = '300px',
  className = '',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark', {
        renderer: 'canvas',
      });
    }

    chartInstance.current.setOption(
      {
        backgroundColor: 'transparent',
        ...options,
      },
      true
    );

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [options]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height }}
      className={`min-w-0 ${className}`}
    />
  );
};
