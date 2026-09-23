'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  Server,
  Zap,
  HeartPulse,
  BrainCircuit,
  SlidersHorizontal,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';

interface LeftNavRailProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const LeftNavRail: React.FC<LeftNavRailProps> = ({ isCollapsed, onToggleCollapse }) => {
  const pathname = usePathname();
  const { alerts, aiInsights } = useTelemetry();

  const activeAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  const navItems = [
    {
      href: '/',
      label: 'COMMAND CENTER',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      tag: 'LVL 1',
    },
    {
      href: '/twin',
      label: 'FACTORY TWIN 3D',
      icon: <Box className="w-5 h-5 shrink-0" />,
      tag: 'SPATIAL',
    },
    {
      href: '/machines',
      label: 'MACHINES (M01-M10)',
      icon: <Server className="w-5 h-5 shrink-0" />,
      tag: 'ASSETS',
    },
    {
      href: '/energy',
      label: 'ENERGY INTELLIGENCE',
      icon: <Zap className="w-5 h-5 shrink-0" />,
      tag: 'FLOW',
    },
    {
      href: '/health',
      label: 'MACHINE HEALTH',
      icon: <HeartPulse className="w-5 h-5 shrink-0" />,
      tag: 'FLEET',
    },
    {
      href: '/ai',
      label: 'AI NEURAL INSIGHTS',
      icon: <BrainCircuit className="w-5 h-5 shrink-0" />,
      badge: aiInsights.length > 0 ? aiInsights.length : undefined,
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
    {
      href: '/optimization',
      label: 'OPTIMIZATION SIM',
      icon: <SlidersHorizontal className="w-5 h-5 shrink-0" />,
      tag: 'PREDICTIVE',
    },
    {
      href: '/alerts',
      label: 'ALERT AUDIT LOG',
      icon: <ShieldAlert className="w-5 h-5 shrink-0" />,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse',
    },
  ];

  return (
    <aside
      className={`bg-industrial-950 border-r border-industrial-800/80 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-[70px]' : 'w-[250px]'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="p-3.5 border-b border-industrial-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
              <Activity className="w-5 h-5 text-industrial-950 font-bold" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-mono text-base font-bold tracking-widest text-industrial-50">
                  ESPADA
                </div>
                <div className="text-[10px] font-mono text-sky-400 tracking-wider">
                  INDUSTRIAL DIGITAL TWIN
                </div>
              </div>
            )}
          </Link>

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-industrial-400 hover:text-industrial-100 hover:bg-industrial-900 transition-colors"
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all group relative ${
                  isActive
                    ? 'bg-industrial-900 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-industrial-400 hover:text-industrial-200 hover:bg-industrial-900/60'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active side indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-400 rounded-r" />
                )}

                <span className={isActive ? 'text-sky-400' : 'text-industrial-400 group-hover:text-industrial-200'}>
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}

                {!isCollapsed && item.badge === undefined && item.tag && (
                  <span className="text-[9px] text-industrial-600 font-mono tracking-tighter">
                    {item.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Plant Status Pill */}
      <div className="p-3 border-t border-industrial-800/80 bg-industrial-950/60">
        {!isCollapsed ? (
          <div className="space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between text-industrial-400 text-[11px]">
              <span>SYSTEM KERNEL:</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="text-[10px] text-industrial-500">
              ESPADA v3.0 Digital Twin
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
