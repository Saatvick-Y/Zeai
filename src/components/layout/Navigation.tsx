'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Server, Zap, AlertTriangle, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { alerts, aiInsights } = useTelemetry();

  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;

  const navItems = [
    {
      href: '/',
      label: 'Command Center',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      href: '/machines',
      label: 'Machines (10)',
      icon: <Server className="w-4 h-4" />,
    },
    {
      href: '/energy',
      label: 'Energy Intelligence',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      href: '/alerts',
      label: 'Alert Center',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      href: '/ai',
      label: 'AI Insights',
      icon: <Sparkles className="w-4 h-4" />,
      badge: aiInsights.length > 0 ? aiInsights.length : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      href: '/optimization',
      label: 'Optimization Sim',
      icon: <SlidersHorizontal className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="bg-industrial-900 border-b border-industrial-800/80 px-4 lg:px-6">
      <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-industrial-800 text-industrial-50 border border-industrial-700 shadow-sm'
                  : 'text-industrial-400 hover:text-industrial-200 hover:bg-industrial-850'
              }`}
            >
              <span className={isActive ? 'text-sky-400' : 'text-industrial-400'}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full border font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
