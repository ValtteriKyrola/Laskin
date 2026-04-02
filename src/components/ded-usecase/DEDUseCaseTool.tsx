import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useStore } from '../../store/useStore';
import { calculateDED, formatCurrency, formatNumber } from '../../utils/calculations';
import type { DEDInput, DEDResult } from '../../types';
import { materialProperties } from '../../data/defaults';
import Card from '../shared/Card';

const presets: { label: string; input: DEDInput }[] = [
  {
    label: 'Turbiinin siipi (Inconel625)',
    input: { material: 'Inconel625', geometry: 'complex', sizeX: 300, sizeY: 80, sizeZ: 200, weight: 3.2, annualVolume: 8, currentProcess: 'forging', buyToFly: 6.5 },
  },
  {
    label: 'Hydraulilohko (316L)',
    input: { material: '316L', geometry: 'complex', sizeX: 200, sizeY: 150, sizeZ: 100, weight: 2.5, annualVolume: 20, currentProcess: 'machining', buyToFly: 4.5 },
  },
  {
    label: 'Kulumissuoja (Stellite6)',
    input: { material: 'Stellite6', geometry: 'rotationally-symmetric', sizeX: 120, sizeY: 120, sizeZ: 60, weight: 1.8, annualVolume: 30, currentProcess: 'welding', buyToFly: 2.0 },
  },
  {
    label: 'Korjaustuloste (Ti6Al4V)',
    input: { material: 'Ti6Al4V', geometry: 'complex', sizeX: 150, sizeY: 100, sizeZ: 80, weight: 0.9, annualVolume: 5, currentProcess: 'machining', buyToFly: 8.0 },
  },
];

const geometryLabels: Record<string, string> = {
  'rotationally-symmetric': 'Pyörähdyskappale',
  'complex': 'Monimutkainen geometria',
  'thin-wall': 'Ohut seinämä',
  'massive': 'Massiivinen kappale',
};

const processLabels: Record<string, string> = {
  'machining': 'Koneistus aihiosta',
  'casting': 'Valu',
  'forging': 'Takominen',
  'welding': 'Hitsaus',
  'purchased': 'Ostokomponentti',
};

const recLabels: Record<DEDResult['recommendation'], { label: string; color: string; bg: string }> = {
  excellent: { label: 'Erinomainen sopivuus', color: 'text-green-400', bg: 'bg-green-900/30 border-green-700' },
  good: { label: 'Hyvä sopivuus', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700' },
  moderate: { label: 'Kohtalainen sopivuus', color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-700' },
  poor: { label: 'Heikko sopivuus', color: 'text-red-400', bg: 'bg-red-900/30 border-red-700' },
};

export default function DEDUseCaseTool() {
  const { dedInput, setDEDInput } = useStore();
  const [result, setResult] = useState<DEDResult | null>(() => calculateDED(dedInput));

  const handleChange = (key: keyof DEDInput, value: string | number) => {
    const updated = { ...dedInput, [key]: value };
    setDEDInput(updated);
    setResult(calculateDED(updated));
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setDEDInput(preset.input);
    setResult(calculateDED(preset.input));
  };

  const radarData = result
    ? [
        { subject: 'Materiaali', A: result.materialScore },
        { subject: 'Geometria', A: result.geometryScore },
        { subject: 'Eräkoko', A: result.volumeScore },
        { subject: 'Materiaalin säästö', A: result.materialSavingScore },
        { subject: 'Kokonais', A: result.suitabilityScore },
      ]
    : [];

  const costData = result
    ? [
        { name: 'DED', kustannus: Math.round(result.dedCostPerPart) },
        { name: 'Perinteinen', kustannus: Math.round(result.traditionalCostPerPart) },
      ]
    : [];

  const rec = result ? recLabels[result.recommendation] : null;
  const matProps = materialProperties[dedInput.material];

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Meltio DED – Use Case -työkalu</h1>
        <p className="text-gray-400 text-xs mt-0.5">DED-soveltuvuusarviointi ja kustannusvertailu perinteiseen valmistukseen</p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => applyPreset(p)} className="btn-secondary text-xs">
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Input form */}
        <div className="xl:col-span-1 space-y-3">
          <Card title="Kappaleen parametrit">
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Materiaali</label>
                <select className="select" value={dedInput.material}
                  onChange={(e) => handleChange('material', e.target.value)}>
                  {Object.entries(materialProperties).map(([key, val]) => (
                    <option key={key} value={key}>{key} – {val.printability}</option>
                  ))}
                </select>
                {matProps && (
                  <div className="mt-1 text-xs text-gray-500">
                    Tiheys {matProps.density} g/cm³ · {matProps.costPerKg} €/kg · DED-pisteet: {matProps.dedScore}/100
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Geometria</label>
                <select className="select" value={dedInput.geometry}
                  onChange={(e) => handleChange('geometry', e.target.value)}>
                  {Object.entries(geometryLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['sizeX', 'sizeY', 'sizeZ'] as const).map((dim, i) => (
                  <div key={dim}>
                    <label className="text-xs text-gray-400 block mb-1">{['X', 'Y', 'Z'][i]} (mm)</label>
                    <input type="number" className="input" value={dedInput[dim]}
                      onChange={(e) => handleChange(dim, Number(e.target.value))} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Paino (kg)</label>
                  <input type="number" step="0.1" className="input" value={dedInput.weight}
                    onChange={(e) => handleChange('weight', Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Valmistus (kpl/v)</label>
                  <input type="number" className="input" value={dedInput.annualVolume}
                    onChange={(e) => handleChange('annualVolume', Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Nykyinen valmistustapa</label>
                <select className="select" value={dedInput.currentProcess}
                  onChange={(e) => handleChange('currentProcess', e.target.value)}>
                  {Object.entries(processLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Buy-to-fly -suhde: {dedInput.buyToFly}:1
                </label>
                <input type="range" min={1.1} max={15} step={0.1} value={dedInput.buyToFly}
                  onChange={(e) => handleChange('buyToFly', Number(e.target.value))}
                  className="w-full" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>1.1 (lähes nettomitto)</span>
                  <span>15 (paljon hukkaa)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="xl:col-span-2 space-y-4">
          {result && rec && (
            <>
              {/* Score card */}
              <div className={`rounded-xl border p-4 ${rec.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className={`text-3xl font-bold ${rec.color}`}>{result.suitabilityScore}/100</div>
                    <div className={`text-sm font-semibold mt-0.5 ${rec.color}`}>{rec.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Vuotuinen säästö</div>
                    <div className={`text-xl font-bold ${result.annualSaving > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(result.annualSaving)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                    <div className="text-gray-400">CO₂-säästö/kpl</div>
                    <div className="text-green-400 font-bold text-base">{formatNumber(result.co2Saving, 1)} kg</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                    <div className="text-gray-400">Läpimenoaika ↓</div>
                    <div className="text-blue-400 font-bold text-base">{result.leadTimeReduction} %</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                    <div className="text-gray-400">Materiaalinsäästö</div>
                    <div className="text-yellow-400 font-bold text-base">
                      {formatNumber((1 - 1 / dedInput.buyToFly) * 100, 0)} %
                    </div>
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Soveltuvuuspisteet">
                  <div className="space-y-2">
                    {[
                      { label: 'Materiaalin DED-tulostettavuus', value: result.materialScore },
                      { label: 'Geometrian monimutkaisuus', value: result.geometryScore },
                      { label: 'Eräkoon sopivuus', value: result.volumeScore },
                      { label: 'Materiaalinsäästöpotentiaali', value: result.materialSavingScore },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{s.label}</span>
                          <span className="text-white font-medium">{s.value}/100</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              s.value >= 80 ? 'bg-green-500' :
                              s.value >= 65 ? 'bg-blue-500' :
                              s.value >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${s.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Kustannusvertailu (€/kpl)">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={costData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={(v) => `${v}€`} />
                      <Tooltip
                        contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                        formatter={(v: unknown) => [`${formatCurrency(v as number)}/kpl`, 'Kustannus']}
                      />
                      <Bar dataKey="kustannus" fill="#3b82f6" radius={[4, 4, 0, 0]}
                        label={{ position: 'top', fill: '#9ca3af', fontSize: 11, formatter: (v: unknown) => `${v}€` }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className={`text-center text-sm font-semibold mt-2 ${result.annualSaving > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {result.annualSaving > 0 ? '▼' : '▲'} {formatCurrency(Math.abs(result.traditionalCostPerPart - result.dedCostPerPart))}/kpl
                    {' '}({result.annualSaving > 0 ? 'DED halvempi' : 'Perinteinen halvempi'})
                  </div>
                </Card>
              </div>

              {/* Radar chart */}
              <Card title="Pisteytysprofiilin tutka">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1f2937" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Radar name="DED-soveltuvuus" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
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
