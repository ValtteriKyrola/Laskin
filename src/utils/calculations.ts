import type { Investment, InvestmentCalculation, DEDInput, DEDResult } from '../types';
import { materialProperties } from '../data/defaults';

export function calculateInvestment(inv: Investment, discountRate: number): InvestmentCalculation {
  const annualNetCashFlow = inv.annualSavings - inv.annualMaintenanceCost;
  const r = discountRate / 100;

  // Payback period
  const paybackPeriod = inv.cost / annualNetCashFlow;

  // ROI %
  const totalProfit = annualNetCashFlow * inv.lifespan - inv.cost;
  const roi = (totalProfit / inv.cost) * 100;

  // NPV
  let npv = -inv.cost;
  for (let t = 1; t <= inv.lifespan; t++) {
    npv += annualNetCashFlow / Math.pow(1 + r, t);
  }

  // IRR (Newton-Raphson approximation)
  let irr = 0.1;
  for (let iter = 0; iter < 1000; iter++) {
    let f = -inv.cost;
    let df = 0;
    for (let t = 1; t <= inv.lifespan; t++) {
      f += annualNetCashFlow / Math.pow(1 + irr, t);
      df += -t * annualNetCashFlow / Math.pow(1 + irr, t + 1);
    }
    if (Math.abs(f) < 0.01) break;
    irr = irr - f / df;
    if (irr < -0.99) { irr = -0.99; break; }
  }

  return {
    paybackPeriod: Math.max(0, paybackPeriod),
    roi,
    npv,
    irr: irr * 100,
    annualNetCashFlow,
  };
}

export function calculateDED(input: DEDInput): DEDResult {
  const mat = materialProperties[input.material] || materialProperties['316L'];

  // Material score
  const materialScore = mat.dedScore;

  // Geometry score
  const geometryScoreMap: Record<string, number> = {
    'rotationally-symmetric': 70,
    'complex': 95,
    'thin-wall': 80,
    'massive': 60,
  };
  const geometryScore = geometryScoreMap[input.geometry] || 70;

  // Volume/batch score (DED best for small batches)
  let volumeScore = 100;
  if (input.annualVolume > 100) volumeScore = 50;
  else if (input.annualVolume > 50) volumeScore = 70;
  else if (input.annualVolume > 20) volumeScore = 85;

  // Material saving score
  const materialSavingScore = Math.min(100, (input.buyToFly - 1) * 20);

  // Overall score (weighted average)
  const suitabilityScore = Math.round(
    materialScore * 0.35 +
    geometryScore * 0.25 +
    volumeScore * 0.20 +
    materialSavingScore * 0.20
  );

  let recommendation: DEDResult['recommendation'] = 'poor';
  if (suitabilityScore >= 80) recommendation = 'excellent';
  else if (suitabilityScore >= 65) recommendation = 'good';
  else if (suitabilityScore >= 50) recommendation = 'moderate';

  // Cost comparison (simplified)
  const dedMaterialCost = input.weight * mat.costPerKg * 1.15; // 15% wire waste
  const dedMachineTime = (input.weight / 0.3) / 60; // hours (0.3 kg/min deposition rate)
  const dedMachineCost = dedMachineTime * 85; // €/h
  const dedCostPerPart = dedMaterialCost + dedMachineCost + 150; // fixed overhead

  const traditionalMaterialCost = input.weight * input.buyToFly * mat.costPerKg;
  const traditionalMachineTime = (input.weight * (input.buyToFly - 1)) / 0.5; // hours
  const traditionalMachineCost = traditionalMachineTime * 65;
  const traditionalCostPerPart = traditionalMaterialCost + traditionalMachineCost + 80;

  const annualSaving = (traditionalCostPerPart - dedCostPerPart) * input.annualVolume;
  const co2Saving = input.weight * (input.buyToFly - 1.15) * 6.5; // kg CO2/kg steel saved
  const leadTimeReduction = 40; // % typical

  return {
    suitabilityScore,
    materialScore,
    geometryScore,
    volumeScore,
    materialSavingScore,
    recommendation,
    dedCostPerPart: Math.max(0, dedCostPerPart),
    traditionalCostPerPart: Math.max(0, traditionalCostPerPart),
    annualSaving,
    co2Saving: Math.max(0, co2Saving),
    leadTimeReduction,
  };
}

export function generateSPCData(n = 25): { xbar: Array<{sample: number; value: number; ucl: number; lcl: number; cl: number}>; rChart: Array<{sample: number; value: number; ucl: number; lcl: number; cl: number}> } {
  const target = 100.00; // mm
  const sigma = 0.02;
  const subgroupSize = 5;
  const A2 = 0.577;
  const D3 = 0;
  const D4 = 2.114;

  const means: number[] = [];
  const ranges: number[] = [];

  for (let i = 0; i < n; i++) {
    const subgroup = Array.from({ length: subgroupSize }, () => target + (Math.random() - 0.5) * sigma * 6);
    const mean = subgroup.reduce((a, b) => a + b, 0) / subgroupSize;
    const range = Math.max(...subgroup) - Math.min(...subgroup);
    means.push(mean);
    ranges.push(range);
  }

  const grandMean = means.reduce((a, b) => a + b, 0) / n;
  const meanRange = ranges.reduce((a, b) => a + b, 0) / n;

  const xbarUCL = grandMean + A2 * meanRange;
  const xbarLCL = grandMean - A2 * meanRange;
  const rUCL = D4 * meanRange;
  const rLCL = D3 * meanRange;

  const xbar = means.map((v, i) => ({ sample: i + 1, value: +v.toFixed(4), ucl: +xbarUCL.toFixed(4), lcl: +xbarLCL.toFixed(4), cl: +grandMean.toFixed(4) }));
  const rChart = ranges.map((v, i) => ({ sample: i + 1, value: +v.toFixed(4), ucl: +rUCL.toFixed(4), lcl: +rLCL.toFixed(4), cl: +meanRange.toFixed(4) }));

  return { xbar, rChart };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number, decimals = 1): string {
  return new Intl.NumberFormat('fi-FI', { maximumFractionDigits: decimals }).format(value);
}
