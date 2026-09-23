import { MachineTelemetry } from '@/types/telemetry';
import { AlertItem, AlertSeverity, AlertCategory } from '@/types/alerts';
import { MACHINES_CONFIG, getMachineConfig } from '@/config/machines';

export class AlertManager {
  private activeAlerts: Map<string, AlertItem> = new Map();

  public processFleetTelemetry(fleet: Record<string, MachineTelemetry>): AlertItem[] {
    const now = Date.now();

    MACHINES_CONFIG.forEach((config) => {
      const t = fleet[config.id];
      if (!t) return;

      // 1. Check Vibration Anomaly
      const vibKey = `${config.id}_vibration`;
      if (t.vibrationRms >= config.thresholds.vibCritical || t.vibrationRms >= config.thresholds.vibWarning) {
        const severity: AlertSeverity = t.vibrationRms >= config.thresholds.vibCritical ? 'critical' : 'warning';
        const deviation = Math.round(((t.vibrationRms - config.baselineVibration) / config.baselineVibration) * 100);
        
        const existing = this.activeAlerts.get(vibKey);
        if (existing && existing.active) {
          existing.count += 1;
          existing.lastUpdated = now;
          existing.currentValue = t.vibrationRms;
          existing.severity = severity;
        } else {
          this.activeAlerts.set(vibKey, {
            id: vibKey,
            machineId: config.id,
            machineName: config.name,
            timestamp: now,
            lastUpdated: now,
            count: 1,
            severity,
            category: 'vibration',
            parameter: 'Vibration RMS',
            currentValue: t.vibrationRms,
            baselineValue: config.baselineVibration,
            unit: 'mm/s',
            deviationPercent: deviation,
            message: `${config.name} vibration is +${deviation}% above baseline. Possible mechanical imbalance or bearing wear.`,
            suggestedAction: config.priority === 'critical' 
              ? 'Schedule immediate technician inspection during next tooling cycle.'
              : 'Inspect bearings during shift changeover.',
            acknowledged: false,
            active: true,
          });
        }
      } else {
        if (this.activeAlerts.has(vibKey)) {
          const item = this.activeAlerts.get(vibKey)!;
          item.active = false;
        }
      }

      // 2. Check Thermal Anomaly
      const tempKey = `${config.id}_thermal`;
      if (t.temperature >= config.thresholds.tempCritical || t.temperature >= config.thresholds.tempWarning) {
        const severity: AlertSeverity = t.temperature >= config.thresholds.tempCritical ? 'critical' : 'warning';
        const deviation = Math.round(((t.temperature - config.baselineTemp) / config.baselineTemp) * 100);

        const existing = this.activeAlerts.get(tempKey);
        if (existing && existing.active) {
          existing.count += 1;
          existing.lastUpdated = now;
          existing.currentValue = t.temperature;
          existing.severity = severity;
        } else {
          this.activeAlerts.set(tempKey, {
            id: tempKey,
            machineId: config.id,
            machineName: config.name,
            timestamp: now,
            lastUpdated: now,
            count: 1,
            severity,
            category: 'thermal',
            parameter: 'Operating Temperature',
            currentValue: t.temperature,
            baselineValue: config.baselineTemp,
            unit: '°C',
            deviationPercent: deviation,
            message: `${config.name} temperature elevated to ${t.temperature}°C (Threshold: ${config.thresholds.tempWarning}°C).`,
            suggestedAction: 'Verify cooling fluid pressure and inspect heat dissipation fins.',
            acknowledged: false,
            active: true,
          });
        }
      } else {
        if (this.activeAlerts.has(tempKey)) {
          this.activeAlerts.get(tempKey)!.active = false;
        }
      }

      // 3. Check Power Factor & Electrical Stress
      const pfKey = `${config.id}_powerfactor`;
      if (t.powerFactor < config.thresholds.minPowerFactor && t.status !== 'offline') {
        const existing = this.activeAlerts.get(pfKey);
        if (existing && existing.active) {
          existing.count += 1;
          existing.lastUpdated = now;
          existing.currentValue = t.powerFactor;
        } else {
          this.activeAlerts.set(pfKey, {
            id: pfKey,
            machineId: config.id,
            machineName: config.name,
            timestamp: now,
            lastUpdated: now,
            count: 1,
            severity: 'warning',
            category: 'electrical',
            parameter: 'Power Factor',
            currentValue: t.powerFactor,
            baselineValue: config.baselinePowerFactor,
            unit: '',
            deviationPercent: Math.round(((config.baselinePowerFactor - t.powerFactor) / config.baselinePowerFactor) * 100),
            message: `${config.name} Power Factor degraded to ${t.powerFactor} (Baseline: ${config.baselinePowerFactor}). Reactive power penalty active.`,
            suggestedAction: 'Engage local capacitor bank or adjust inverter VFD switching frequency.',
            acknowledged: false,
            active: true,
          });
        }
      } else {
        if (this.activeAlerts.has(pfKey)) {
          this.activeAlerts.get(pfKey)!.active = false;
        }
      }

      // 4. Check Connection Stale / Delayed
      const connKey = `${config.id}_connection`;
      if (t.connectionState === 'delayed' || t.connectionState === 'stale') {
        const existing = this.activeAlerts.get(connKey);
        if (existing && existing.active) {
          existing.count += 1;
          existing.lastUpdated = now;
        } else {
          this.activeAlerts.set(connKey, {
            id: connKey,
            machineId: config.id,
            machineName: config.name,
            timestamp: now,
            lastUpdated: now,
            count: 1,
            severity: t.connectionState === 'stale' ? 'warning' : 'info',
            category: 'connectivity',
            parameter: 'RS-485 Gateway Telemetry',
            currentValue: t.connectionState.toUpperCase(),
            baselineValue: 'CONNECTED',
            unit: '',
            deviationPercent: 0,
            message: `Telemetry packet delay on ${config.id} (${t.connectionState.toUpperCase()}). Machine operating normally.`,
            suggestedAction: 'Inspect RS-485 termination resistor and gateway Wi-Fi signal.',
            acknowledged: false,
            active: true,
          });
        }
      } else {
        if (this.activeAlerts.has(connKey)) {
          this.activeAlerts.get(connKey)!.active = false;
        }
      }
    });

    return Array.from(this.activeAlerts.values()).sort((a, b) => {
      // Sort critical first, then most recent
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      return b.lastUpdated - a.lastUpdated;
    });
  }

  public acknowledgeAlert(alertId: string) {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  public clearAll() {
    this.activeAlerts.clear();
  }
}
