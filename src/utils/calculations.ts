import type { Investment, InvestmentCalculation } from '../types';

export function calculateInvestment(inv: Investment, discountRate: number): InvestmentCalculation {
  const annualNetCashFlow = inv.annualSavings - inv.annualMaintenanceCost;
  const r = discountRate / 100;

  // Payback period (guard against division by zero)
  const paybackPeriod = annualNetCashFlow <= 0 ? Infinity : inv.cost / annualNetCashFlow;

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
