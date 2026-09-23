import { describe, it, expect } from 'vitest';
import { runOptimizationSimulation } from '../lib/calculations/optimizationEngine';
import { MockTelemetryProvider } from '../lib/telemetry/MockTelemetryProvider';

describe('OptimizationEngine', () => {
  it('preserves Critical priority machines (M01, M02) without forced shutdown or delays', () => {
    const provider = new MockTelemetryProvider();
    const fleet = provider.getAllLatest();

    const result = runOptimizationSimulation(fleet);

    const m01Action = result.proposedSchedule.find((s) => s.machineId === 'M01');
    const m02Action = result.proposedSchedule.find((s) => s.machineId === 'M02');

    expect(m01Action).toBeDefined();
    expect(m01Action!.action).toContain('Maintain Full Production');
    expect(m01Action!.energyImpactKw).toBe(0);

    expect(m02Action).toBeDefined();
    expect(m02Action!.action).toContain('Maintain');
  });

  it('calculates positive peak demand reduction with negligible production impact', () => {
    const provider = new MockTelemetryProvider();
    const fleet = provider.getAllLatest();

    const result = runOptimizationSimulation(fleet);

    expect(result.projectedResult.peakReductionKw).toBeGreaterThan(0);
    expect(result.projectedResult.peakReductionPct).toBeGreaterThan(5);
    expect(result.projectedResult.productionImpactPct).toBeLessThan(1.0); // < 1% impact requirement
    expect(result.projectedResult.projectedSavingsPerMonthUsd).toBeGreaterThan(0);
  });
});
