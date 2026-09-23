import { describe, it, expect } from 'vitest';
import { AlertManager } from '../lib/calculations/alertGenerator';
import { MockTelemetryProvider } from '../lib/telemetry/MockTelemetryProvider';

describe('AlertManager', () => {
  it('groups and deduplicates repeated anomaly packets without spamming', () => {
    const alertManager = new AlertManager();
    const provider = new MockTelemetryProvider();

    // Trigger M03 vibration scenario and simulate a few ticks for vibration to rise above threshold
    provider.setScenario('m03_vibration');
    for (let i = 0; i < 5; i++) {
      (provider as any).tick();
    }

    const fleet1 = provider.getAllLatest();
    const alerts1 = alertManager.processFleetTelemetry(fleet1);
    const m03Alert1 = alerts1.find((a) => a.machineId === 'M03' && a.category === 'vibration');
    expect(m03Alert1).toBeDefined();
    expect(m03Alert1!.count).toBe(1);

    // Process a second packet for the same ongoing anomaly
    (provider as any).tick();
    const fleet2 = provider.getAllLatest();
    const alerts2 = alertManager.processFleetTelemetry(fleet2);
    const m03Alert2 = alerts2.find((a) => a.machineId === 'M03' && a.category === 'vibration');
    expect(m03Alert2).toBeDefined();
    expect(m03Alert2!.count).toBe(2);
    // Should NOT create separate duplicate alerts
    expect(alerts2.filter((a) => a.machineId === 'M03' && a.category === 'vibration').length).toBe(1);
  });

  it('allows acknowledging active alerts', () => {
    const alertManager = new AlertManager();
    const provider = new MockTelemetryProvider();
    provider.setScenario('m05_overheat');
    for (let i = 0; i < 15; i++) {
      (provider as any).tick();
    }

    const fleet = provider.getAllLatest();
    const alerts = alertManager.processFleetTelemetry(fleet);
    const m05Alert = alerts.find((a) => a.machineId === 'M05');
    expect(m05Alert).toBeDefined();
    expect(m05Alert!.acknowledged).toBe(false);

    alertManager.acknowledgeAlert(m05Alert!.id);
    const updatedAlerts = alertManager.processFleetTelemetry(fleet);
    const updatedM05Alert = updatedAlerts.find((a) => a.id === m05Alert!.id);
    expect(updatedM05Alert!.acknowledged).toBe(true);
  });
});
