import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useStore } from '../../store/useStore';
import { calculateDED, formatCurrency, formatNumber } from '../../utils/calculations';
import type { DEDInput, DEDResult } from '../../types';
import { materialProperties } from '../../data/defaults';
import { Card, Badge, Button, Slider, Select } from '../ui';
import { useTheme } from '../../hooks/useTheme';

const presets: { label: string; input: DEDInput }[] = [
  { label: 'Turbiinin siipi (Inconel625)', input: { material: 'Inconel625', geometry: 'complex', sizeX: 300, sizeY: 80, sizeZ: 200, weight: 3.2, annualVolume: 8, currentProcess: 'forging', buyToFly: 6.5 } },
  { label: 'KL-300 kiinnitinlevy (316L)', input: { material: '316L', geometry: 'complex', sizeX: 300, sizeY: 200, sizeZ: 60, weight: 8.5, annualVolume: 4, currentProcess: 'machining', buyToFly: 3.8 } },
  { label: 'Kulumissuoja (Stellite6)', input: { material: 'Stellite6', geometry: 'rotationally-symmetric', sizeX: 120, sizeY: 120, sizeZ: 60, weight: 1.8, annualVolume: 30, currentProcess: 'welding', buyToFly: 2.0 } },
  { label: 'Korjaustuloste (Ti6Al4V)', input: { material: 'Ti6Al4V', geometry: 'complex', sizeX: 150, sizeY: 100, sizeZ: 80, weight: 0.9, annualVolume: 5, currentProcess: 'machining', buyToFly: 8.0 } },
];

const geometryOptions = [
  { value: 'rotationally-symmetric', label: 'Pyörähdyskappale' },
  { value: 'complex', label: 'Monimutkainen geometria' },
  { value: 'thin-wall', label: 'Ohut seinämä' },
  { value: 'massive', label: 'Massiivinen kappale' },
];

const processOptions = [
  { value: 'machining', label: 'Koneistus aihiosta' },
  { value: 'casting', label: 'Valu' },
  { value: 'forging', label: 'Takominen' },
  { value: 'welding', label: 'Hitsaus' },
  { value: 'purchased', label: 'Ostokomponentti' },
];

type RecVariant = 'success' | 'info' | 'warning' | 'danger';
const recBadge: Record<DEDResult['recommendation'], { label: string; variant: RecVariant; headerClass: string }> = {
  excellent: { label: 'Erinomainen sopivuus', variant: 'success',  headerClass: 'bg-success/10 border-success/30' },
  good:      { label: 'Hyvä sopivuus',        variant: 'info',     headerClass: 'bg-info/10 border-info/30' },
  moderate:  { label: 'Kohtalainen sopivuus', variant: 'warning',  headerClass: 'bg-warning/10 border-warning/30' },
  poor:      { label: 'Heikko sopivuus',      variant: 'danger',   headerClass: 'bg-danger/10 border-danger/30' },
};

const scoreColor = (v: number) =>
  v >= 80 ? 'bg-success' : v >= 65 ? 'bg-info' : v >= 50 ? 'bg-warning' : 'bg-danger';

const gridStroke = (dark: boolean) => dark ? '#343A40' : '#E9ECEF';
const tickFill   = (dark: boolean) => dark ? '#ADB5BD' : '#6C757D';
const tooltipStyle = (dark: boolean) => ({
  background: dark ? '#212529' : '#fff',
  border: `1px solid ${dark ? '#343A40' : '#DEE2E6'}`,
  borderRadius: 8,
  fontSize: 12,
  color: dark ? '#F8F9FA' : '#212529',
});

export default function DEDUseCaseTool() {
  const { dedInput, setDEDInput } = useStore();
  const { isDark } = useTheme();
  const [result, setResult] = useState<DEDResult | null>(() => calculateDED(dedInput));

  const handleChange = (key: keyof DEDInput, value: string | number) => {
    const updated = { ...dedInput, [key]: value };
    setDEDInput(updated);
    setResult(calculateDED(updated));
  };

  const applyPreset = (preset: typeof presets[0]) => { setDEDInput(preset.input); setResult(calculateDED(preset.input)); };

  const radarData = result ? [
    { subject: 'Materiaali', A: result.materialScore },
    { subject: 'Geometria', A: result.geometryScore },
    { subject: 'Eräkoko', A: result.volumeScore },
    { subject: 'Mat. säästö', A: result.materialSavingScore },
    { subject: 'Kokonais', A: result.suitabilityScore },
  ] : [];

  const costData = result ? [
    { name: 'DED', kustannus: Math.round(result.dedCostPerPart) },
    { name: 'Perinteinen', kustannus: Math.round(result.traditionalCostPerPart) },
  ] : [];

  const rec = result ? recBadge[result.recommendation] : null;
  const matProps = materialProperties[dedInput.material];

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Meltio DED – Use Case -työkalu</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">DED-soveltuvuusarviointi ja kustannusvertailu perinteiseen valmistukseen</p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Button key={p.label} variant="secondary" size="sm" onClick={() => applyPreset(p)}>{p.label}</Button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Input */}
        <div className="xl:col-span-1 space-y-3">
          <Card title="Kappaleen parametrit" accent>
            <div className="space-y-3">
              <Select
                label="Materiaali"
                value={dedInput.material}
                onChange={(e) => handleChange('material', e.target.value)}
                options={Object.entries(materialProperties).map(([key, val]) => ({ value: key, label: `${key} – ${val.printability}` }))}
              />
              {matProps && (
                <p className="text-xs text-neutral-400 -mt-2">
                  Tiheys {matProps.density} g/cm³ · {matProps.costPerKg} €/kg · DED-pisteet: {matProps.dedScore}/100
                </p>
              )}
              <Select
                label="Geometria"
                value={dedInput.geometry}
                onChange={(e) => handleChange('geometry', e.target.value)}
                options={geometryOptions}
              />
              <div className="grid grid-cols-3 gap-2">
                {(['sizeX', 'sizeY', 'sizeZ'] as const).map((dim, i) => (
                  <div key={dim}>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">{['X', 'Y', 'Z'][i]} (mm)</label>
                    <input type="number" value={dedInput[dim]}
                      onChange={(e) => handleChange(dim, Number(e.target.value))}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-primary-500" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Paino (kg)</label>
                  <input type="number" step="0.1" value={dedInput.weight}
                    onChange={(e) => handleChange('weight', Number(e.target.value))}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">kpl/vuosi</label>
                  <input type="number" value={dedInput.annualVolume}
                    onChange={(e) => handleChange('annualVolume', Number(e.target.value))}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-primary-500" />
                </div>
              </div>
              <Select
                label="Nykyinen valmistustapa"
                value={dedInput.currentProcess}
                onChange={(e) => handleChange('currentProcess', e.target.value)}
                options={processOptions}
              />
              <Slider label="Buy-to-fly -suhde" min={1.1} max={15} step={0.1} value={dedInput.buyToFly}
                onChange={(v) => handleChange('buyToFly', v)} unit=":1" />
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="xl:col-span-2 space-y-4">
          {result && rec && (
            <>
              {/* Score header */}
              <div className={`rounded-xl border p-4 ${rec.headerClass}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-3xl font-bold font-mono text-neutral-900 dark:text-neutral-100">{result.suitabilityScore}<span className="text-base text-neutral-400">/100</span></div>
                    <Badge variant={rec.variant} className="mt-1">{rec.label}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-500 mb-0.5">Vuotuinen säästö</div>
                    <div className={`text-xl font-bold ${result.annualSaving > 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(result.annualSaving)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'CO₂-säästö/kpl', value: `${formatNumber(result.co2Saving, 1)} kg`, color: 'text-success' },
                    { label: 'Läpimenoaika ↓', value: `${result.leadTimeReduction} %`, color: 'text-info' },
                    { label: 'Materiaalinsäästö', value: `${formatNumber((1 - 1 / dedInput.buyToFly) * 100, 0)} %`, color: 'text-warning' },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/50 dark:bg-neutral-900/50 rounded-lg p-2 text-center">
                      <div className="text-neutral-500 mb-0.5">{m.label}</div>
                      <div className={`font-bold text-sm ${m.color}`}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Score bars */}
                <Card title="Soveltuvuuspisteet" accent>
                  <div className="space-y-3">
                    {[
                      { label: 'Materiaalin DED-tulostettavuus', value: result.materialScore },
                      { label: 'Geometrian monimutkaisuus', value: result.geometryScore },
                      { label: 'Eräkoon sopivuus', value: result.volumeScore },
                      { label: 'Materiaalinsäästöpotentiaali', value: result.materialSavingScore },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-500 dark:text-neutral-400">{s.label}</span>
                          <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{s.value}/100</span>
                        </div>
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${scoreColor(s.value)}`}
                            style={{ width: `${s.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Cost chart */}
                <Card title="Kustannusvertailu (€/kpl)" accent>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={costData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke(isDark)} />
                      <XAxis dataKey="name" tick={{ fill: tickFill(isDark), fontSize: 11 }} />
                      <YAxis tick={{ fill: tickFill(isDark), fontSize: 10 }} tickFormatter={(v) => `${v}€`} />
                      <Tooltip contentStyle={tooltipStyle(isDark)} formatter={(v: unknown) => [`${formatCurrency(v as number)}/kpl`, 'Kustannus']} />
                      <Bar dataKey="kustannus" fill="#7B2D8E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className={`text-center text-xs font-semibold mt-2 ${result.annualSaving > 0 ? 'text-success' : 'text-danger'}`}>
                    {result.annualSaving > 0 ? '▼' : '▲'} {formatCurrency(Math.abs(result.traditionalCostPerPart - result.dedCostPerPart))}/kpl
                    {' '}({result.annualSaving > 0 ? 'DED halvempi' : 'Perinteinen halvempi'})
                  </p>
                </Card>
              </div>

              {/* Radar */}
              <Card title="Pisteytysprofiilin tutka" accent>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={gridStroke(isDark)} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: tickFill(isDark), fontSize: 10 }} />
                    <Radar name="DED-soveltuvuus" dataKey="A" stroke="#7B2D8E" fill="#7B2D8E" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
