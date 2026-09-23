import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MachineStatus, ConnectionState, ProductionPriority } from "@/types/telemetry";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKw(kw: number): string {
  if (isNaN(kw) || kw === undefined || kw === null) return "0.0 kW";
  return `${kw.toFixed(1)} kW`;
}

export function formatKwh(kwh: number): string {
  if (isNaN(kwh) || kwh === undefined || kwh === null) return "0.0 kWh";
  if (kwh >= 1000) {
    return `${(kwh / 1000).toFixed(2)} MWh`;
  }
  return `${kwh.toFixed(1)} kWh`;
}

export function formatTemp(c: number): string {
  if (isNaN(c) || c === undefined || c === null) return "0.0 °C";
  return `${c.toFixed(1)} °C`;
}

export function formatVibration(v: number): string {
  if (isNaN(v) || v === undefined || v === null) return "0.00 mm/s";
  return `${v.toFixed(2)} mm/s`;
}

export function formatCurrent(a: number): string {
  if (isNaN(a) || a === undefined || a === null) return "0.0 A";
  return `${a.toFixed(1)} A`;
}

export function formatPercent(val: number): string {
  if (isNaN(val) || val === undefined || val === null) return "0%";
  return `${Math.round(val)}%`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function getStatusColor(status: MachineStatus) {
  switch (status) {
    case 'normal':
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        border: 'border-emerald-500/40',
        glow: 'shadow-glow-emerald',
      };
    case 'warning':
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/35',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
        border: 'border-amber-500/45',
        glow: 'shadow-glow-amber',
      };
    case 'critical':
      return {
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse',
        text: 'text-rose-400',
        dot: 'bg-rose-400',
        border: 'border-rose-500/50',
        glow: 'shadow-glow-rose',
      };
    case 'offline':
    default:
      return {
        badge: 'bg-slate-800/40 text-slate-400 border-slate-700/60',
        text: 'text-slate-400',
        dot: 'bg-slate-500',
        border: 'border-slate-700/50',
        glow: '',
      };
  }
}

export function getConnectionLabel(state: ConnectionState): { label: string; color: string } {
  switch (state) {
    case 'connected':
      return { label: 'LIVE RS-485', color: 'text-emerald-400' };
    case 'delayed':
      return { label: 'DELAYED (3s)', color: 'text-amber-400' };
    case 'stale':
      return { label: 'TELEMETRY STALE', color: 'text-orange-400' };
    case 'offline':
      return { label: 'NO SIGNAL', color: 'text-slate-500' };
  }
}

export function getPriorityBadge(priority: ProductionPriority) {
  switch (priority) {
    case 'critical':
      return { label: 'CRITICAL', style: 'bg-purple-950/50 text-purple-300 border-purple-800/60' };
    case 'high':
      return { label: 'HIGH PRIORITY', style: 'bg-blue-950/50 text-blue-300 border-blue-800/60' };
    case 'medium':
      return { label: 'MEDIUM', style: 'bg-slate-800/60 text-slate-300 border-slate-700' };
    case 'low':
      return { label: 'FLEXIBLE', style: 'bg-slate-900/60 text-slate-400 border-slate-800' };
  }
}
