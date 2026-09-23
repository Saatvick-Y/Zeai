import { describe, it, expect } from 'vitest';
import { IndustrialPhysicsEngine } from '../lib/simulation/physicsEngine';
import { MACHINES_CONFIG } from '../config/machines';

describe('IndustrialPhysicsEngine', () => {
  it('initializes states for all 10 machines (M01-M10)', () => {
    const engine = new IndustrialPhysicsEngine(MACHINES_CONFIG);
    expect(MACHINES_CONFIG.length).toBe(10);

    MACHINES_CONFIG.forEach((config) => {
      const packet = engine.tick(config, 'normal', 1.0, Date.now());
      expect(packet.machineId).toBe(config.id);
      expect(packet.activePower).toBeGreaterThan(0);
      expect(packet.voltage).toBeGreaterThan(380);
      expect(packet.temperature).toBeGreaterThan(20);
      expect(packet.machineHealth).toBeGreaterThanOrEqual(80);
      expect(packet.status).toBe('normal');
    });
  });

  it('correctly simulates M03 bearing vibration anomaly scenario', () => {
    const engine = new IndustrialPhysicsEngine(MACHINES_CONFIG);
    const m03Config = MACHINES_CONFIG.find((m) => m.id === 'M03')!;

    // Run 10 ticks under m03_vibration scenario
    let lastPacket;
    for (let i = 0; i < 10; i++) {
      lastPacket = engine.tick(m03Config, 'm03_vibration', 1.0, Date.now());
    }

    expect(lastPacket).toBeDefined();
    // Vibration should exceed warning threshold
    expect(lastPacket!.vibrationRms).toBeGreaterThan(m03Config.thresholds.vibWarning);
    // Health score should degrade
    expect(lastPacket!.machineHealth).toBeLessThan(80);
  });

  it('correctly simulates M05 thermal runaway scenario', () => {
    const engine = new IndustrialPhysicsEngine(MACHINES_CONFIG);
    const m05Config = MACHINES_CONFIG.find((m) => m.id === 'M05')!;

    let lastPacket;
    for (let i = 0; i < 15; i++) {
      lastPacket = engine.tick(m05Config, 'm05_overheat', 1.0, Date.now());
    }

    expect(lastPacket!.temperature).toBeGreaterThan(m05Config.thresholds.tempWarning);
  });

  it('maintains monotonic energy accumulation over time', () => {
    const engine = new IndustrialPhysicsEngine(MACHINES_CONFIG);
    const m01Config = MACHINES_CONFIG.find((m) => m.id === 'M01')!;

    const p1 = engine.tick(m01Config, 'normal', 1.0, Date.now());
    const p2 = engine.tick(m01Config, 'normal', 10.0, Date.now() + 10000);

    expect(p2.energyConsumption).toBeGreaterThanOrEqual(p1.energyConsumption);
  });
});
