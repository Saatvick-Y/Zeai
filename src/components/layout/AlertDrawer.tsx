'use client';

import React from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { ShieldAlert, X, Check, Clock, ChevronRight } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import Link from 'next/link';

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertDrawer: React.FC<AlertDrawerProps> = ({ isOpen, onClose }) => {
  const { alerts, acknowledgeAlert } = useTelemetry();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-industrial-950 border-l border-industrial-800 p-5 flex flex-col justify-between shadow-2xl h-full font-mono animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between border-b border-industrial-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold uppercase text-industrial-100 tracking-wider">
                ACTIVE NOTIFICATIONS ({alerts.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-industrial-400 hover:text-industrial-100 hover:bg-industrial-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alerts List */}
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-industrial-900/60 rounded border border-industrial-800 text-xs text-emerald-400 space-y-2">
                <p className="font-bold">ALL TELEMETRY CHANNELS NOMINAL</p>
                <p className="text-industrial-400 text-[11px]">No active threshold violations.</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isWarning = alert.severity === 'warning';

                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-500/50 text-rose-200'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                        : 'bg-industrial-900 border-industrial-800 text-industrial-300'
                    } ${alert.acknowledged ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sky-400 bg-sky-950 px-1.5 py-0.2 rounded border border-sky-800 text-[11px]">
                          {alert.machineId}
                        </span>
                        <span className="text-[10px] uppercase px-1.5 py-0.2 rounded font-bold bg-industrial-950 border border-industrial-800">
                          {alert.severity}
                        </span>
                      </div>
                      <span className="text-[10px] text-industrial-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(alert.lastUpdated)}
                      </span>
                    </div>

                    <p className="text-[11px] text-industrial-200 font-sans leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-industrial-800/60 text-[10px]">
                      <span>Parameter: <strong>{alert.parameter}</strong></span>
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-2 py-0.5 rounded bg-industrial-800 hover:bg-industrial-700 text-industrial-200 border border-industrial-700 font-bold"
                        >
                          ACK
                        </button>
                      ) : (
                        <span className="text-emerald-400">ACKNOWLEDGED</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="pt-3 border-t border-industrial-800 flex items-center justify-between">
          <Link
            href="/alerts"
            onClick={onClose}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            Open Full Alert Audit Log <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-industrial-900 text-industrial-300 border border-industrial-800 hover:bg-industrial-800 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
