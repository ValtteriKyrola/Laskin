import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Badge } from '../ui';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Row {
  id: string;
  label: string;
  amount: number;
  optional?: boolean;
  enabled: boolean;
  note?: string;
}

interface Group {
  id: string;
  label: string;
  rows: Row[];
  expanded: boolean;
}

interface Machine {
  id: string;
  icon: string;
  name: string;
  expanded: boolean;
  groups: Group[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let _id = 0;
const uid = () => `id-${++_id}`;

function row(label: string, amount: number, optional = false): Row {
  return { id: uid(), label, amount, optional, enabled: !optional };
}

function group(label: string, rows: Row[]): Group {
  return { id: uid(), label, rows, expanded: true };
}

const fmt = (n: number) =>
  n.toLocaleString('fi-FI', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

function groupTotal(g: Group) {
  return g.rows.filter(r => r.enabled).reduce((s, r) => s + r.amount, 0);
}
function machineTotal(m: Machine) {
  return m.groups.reduce((s, g) => s + groupTotal(g), 0);
}

// ── Default data ──────────────────────────────────────────────────────────────

const INITIAL: Machine[] = [
  {
    id: 'm1', icon: '🔧', name: 'Pääkone: Bridgeport → DN Solutions DNM 5700', expanded: false,
    groups: [
      group('Vanhan koneen purku', [
        row('Sähköliitäntöjen irrotus', 400),
        row('Paineilma- ja hydrauliikkairrotus', 300),
        row('Jäähdytysnesteen tyhjennys + jätehävitys', 350),
        row('Ankkuripulttien irrotus', 500),
        row('Suojausten purku', 400),
        row('Koneensiirtofirma', 2500),
        row('Nostokalusto', 1200),
        row('Romutus / hävitys', 500),
      ]),
      group('Perustukset ja lattia', [
        row('Rakennesuunnittelijan lausunto', 1200),
        row('Vanhan perustuksen tasoitus', 800),
        row('Uusi perustus (betoni, 6 200 kg)', 3500),
        row('Tärinänvaimennuselementit', 2400),
        row('Lattian pinnoitus (epoksi)', 1200),
      ]),
      group('Sähkötyöt', [
        row('Sähkösuunnittelu (30 kVA, 400 V)', 1500),
        row('Pääkeskuksen muutos', 2500),
        row('Syöttökaapelin veto', 2000),
        row('Turvakytkin', 400),
        row('Valaistus', 600),
        row('Maadoitus', 300),
        row('Sähkötarkastus', 600),
      ]),
      group('Paineilma, jäähdytys, ilmanvaihto', [
        row('Paineilmalinjan veto', 800),
        row('FRL-yksikkö', 250),
        row('Lastuamisnestejärjestelmä', 1200),
        row('Karan jäähdytysyksikkö', 2500),
        row('Öljysumun erotin', 2800),
        row('Viemäröinti', 600),
      ]),
      group('Laite: DNM 5700', [
        row('DNM 5700 peruskone (Fanuc, BT40)', 110000),
        row('12 000 rpm kara', 4000, true),
        row('40-paikkainen ATC', 3500, true),
        row('Renishaw mittapää', 5500, true),
        row('Lämpötilakompensointi', 2000, true),
        row('Lastukuljetin', 3200, true),
        row('TSC sisäjäähdytys 70 bar', 4500, true),
        row('4. akseli -valmius', 3000, true),
        row('Työkalunmittaus', 4000, true),
      ]),
      group('Kuljetus ja asennus', [
        row('Merirahti Korea → Suomi', 4500),
        row('Kuljetusvakuutus', 1200),
        row('Erikoiskuljetus tehtaalle', 1800),
        row('Nostotyö halliin', 2500),
        row('Valmistajan asennuspalvelu (3 pv)', 4500),
        row('Geometrinen kalibrointi', 1800),
        row('Testikappale + mittaukset', 800),
        row('Koekäytöt', 600),
      ]),
      group('Integraatio ja tietojärjestelmät', [
        row('Verkkokaapelointi', 400),
        row('OPC UA gateway', 1500),
        row('FASTEMS MMS -integraatio', 2500),
        row('Postprosessori (Fanuc)', 1200),
        row('NC-ohjelmien siirto', 800),
        row('Työkalukirjasto (BT40)', 600),
      ]),
      group('Koulutus', [
        row('Operaattorikoulutus (3 pv)', 2500),
        row('CAM-koulutus', 1500),
        row('Kunnossapitokoulutus', 800),
      ]),
    ],
  },
  {
    id: 'm2', icon: '🤖', name: 'Mobiilirobotti (AMR) – MiR250', expanded: false,
    groups: [
      group('Laitteet', [
        row('AMR-alusta (MiR250)', 35000),
        row('Päällismoduuli kappalesiirtoon', 4000),
        row('Latausasema', 2500),
        row('Fleet management -ohjelmisto', 3000),
      ]),
      group('Infrastruktuuri', [
        row('Lattian tasaisuuden korjaus', 1500),
        row('WiFi-verkon vahvistus', 1200),
        row('Navigointipisteet', 800),
        row('Sähköliitäntä latausasema', 400),
        row('Lattiamerkinnät', 600),
      ]),
      group('Turvallisuus', [
        row('Riskien arviointi (ISO 3691-4)', 1500),
        row('Turva-alueiden merkintä', 800),
        row('LiDAR-kalibrointi', 600),
        row('Hätäpysäytys', 300),
        row('CE-dokumentaatio', 1000),
      ]),
      group('Integraatio', [
        row('MES-integraatio', 3000),
        row('Koneiden ovi-automaatioliitäntä', 2000),
        row('I/O-liitäntä asemille', 1500),
        row('Ohjelmointi ja reittioptimointi', 2000),
        row('Simulointi ja testaus', 1000),
      ]),
      group('Koulutus ja käyttöönotto', [
        row('Käyttäjäkoulutus', 1200),
        row('Huoltokoulutus', 800),
        row('Käyttöönottojakso (2 vko)', 2000),
      ]),
    ],
  },
  {
    id: 'm3', icon: '🦾', name: 'Nivelvarsirobotti / Cobot – UR10e', expanded: false,
    groups: [
      group('Laitteet', [
        row('Cobot (UR10e)', 35000),
        row('Tarttuja (Schunk / OnRobot)', 5000),
        row('Sormien suunnittelu ja valmistus', 2000),
        row('Kamerajärjestelmä (bin picking)', 8000, true),
      ]),
      group('Kiinnitys ja mekaaniikka', [
        row('Robottijalusta', 2500),
        row('Jalustan ankkurointi', 400),
        row('Syöttöpöytä (sisään)', 3000),
        row('Vastaanottopöytä (ulos)', 2000),
        row('Kiinnittimen automaattiavaus', 2500),
        row('Paineilmaliitäntä tarttujalle', 400),
      ]),
      group('Integraatio DNM 5700:n kanssa', [
        row('Koneen ovi-automaatio', 2500),
        row('M-koodirajapinta (Fanuc I/O)', 1500),
        row('Kiinnittinohjaus', 1500),
        row('Puhallus / pesu lastuille', 800),
        row('Kappaleen asemointi', 1000),
        row('Ohjelmointiliitäntä', 800),
      ]),
      group('Turvallisuus', [
        row('Riskien arviointi (ISO/TS 15066)', 2000),
        row('Voima- / painemittaukset', 1500),
        row('Kevytaidat', 1500),
        row('Hätäpysäytyspiirin laajennus', 500),
        row('CE-dokumentaatio', 1200),
      ]),
      group('Ohjelmointi ja käyttöönotto', [
        row('Robottiohjelmointi', 3000),
        row('Offline-simulointi', 1000),
        row('Syklioptimointi', 1500),
        row('Testaus (5 kappaletyyppiä)', 1500),
        row('Käyttöönottojakso (2 vko)', 2500),
      ]),
      group('Koulutus', [
        row('Robottiohjelmointikoulutus (2 pv)', 2000),
        row('Tarttujan vaihto ja huolto', 500),
        row('Vianetsintäkoulutus', 800),
      ]),
    ],
  },
  {
    id: 'm4', icon: '🏭', name: 'Jaetut kustannukset', expanded: false,
    groups: [
      group('Yleinen infrastruktuuri', [
        row('Lattian kokonaispinnoitus', 4000),
        row('Kulkureittien suunnittelu', 1500),
        row('Yleisvalaistus', 1800),
        row('Kompressorin kapasiteetti', 2500),
        row('Sähköpääkeskuksen uudistus', 3500),
        row('Ilmanvaihdon säätö', 1200),
        row('Verkkoinfra (kytkimet, WiFi)', 2500),
      ]),
      group('Turvallisuus (koko layout)', [
        row('Layoutin kokonais-riskienarviointi', 3000),
        row('Hätävalaistus ja poistumistiet', 1200),
        row('Sammutuskalusto', 500),
        row('Melukartoitus', 800),
        row('Turvallisuuskoulutus (koko henkilöstö)', 1500),
      ]),
      group('Tietojärjestelmät', [
        row('Odoo ERP konfigurointi', 4000),
        row('FASTEMS MMS konfigurointi + lisenssit', 8000),
        row('Datan keruujärjestelmä', 5000),
        row('Tuotannonohjauksen suunnittelu (MES)', 3000),
      ]),
      group('Projektinhallinta', [
        row('Kokonaissuunnittelu ja aikataulutus', 3000),
        row('Tarjouskilpailutus', 1500),
        row('Projektinjohto (12 vko)', 6000),
        row('Layout-CAD-dokumentaatio', 1500),
        row('Sähkökuvien päivitys', 1200),
        row('Loppudokumentaatio', 1000),
        row('Viranomaisasiat ja tarkastukset', 2000),
      ]),
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fieldlab-budget-v1';

function loadSaved(): { machines: Machine[]; marginPct: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function InvestmentCalculator() {
  const saved = loadSaved();
  // Always start collapsed regardless of saved state
  const initialMachines = (saved?.machines ?? INITIAL).map(m => ({
    ...m, expanded: false,
    groups: m.groups.map(g => ({ ...g, expanded: true })),
  }));
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [marginPct, setMarginPct] = useState(saved?.marginPct ?? 15);

  // Persist changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ machines, marginPct }));
  }, [machines, marginPct]);

  const grandTotal = machines.reduce((s, m) => s + machineTotal(m), 0);
  const margin = Math.round(grandTotal * marginPct / 100);
  const finalTotal = grandTotal + margin;

  // Equipment-only total (for hidden cost %)
  const equipmentTotal = machines.reduce((s, m) => {
    const eqGroup = m.groups.find(g => g.label.startsWith('Laite') || g.label === 'Laitteet');
    return s + (eqGroup ? groupTotal(eqGroup) : 0);
  }, 0);
  const hiddenCostPct = grandTotal > 0 ? Math.round(((grandTotal - equipmentTotal) / grandTotal) * 100) : 0;

  // Updaters
  const toggleMachine = (mid: string) =>
    setMachines(ms => ms.map(m => m.id === mid ? { ...m, expanded: !m.expanded } : m));

  const toggleGroup = (mid: string, gid: string) =>
    setMachines(ms => ms.map(m => m.id === mid
      ? { ...m, groups: m.groups.map(g => g.id === gid ? { ...g, expanded: !g.expanded } : g) }
      : m));

  const toggleRow = (mid: string, gid: string, rid: string) =>
    setMachines(ms => ms.map(m => m.id === mid
      ? { ...m, groups: m.groups.map(g => g.id === gid
          ? { ...g, rows: g.rows.map(r => r.id === rid ? { ...r, enabled: !r.enabled } : r) }
          : g) }
      : m));

  const updateAmount = (mid: string, gid: string, rid: string, val: number) =>
    setMachines(ms => ms.map(m => m.id === mid
      ? { ...m, groups: m.groups.map(g => g.id === gid
          ? { ...g, rows: g.rows.map(r => r.id === rid ? { ...r, amount: val } : r) }
          : g) }
      : m));

  // Bar widths for summary chart
  const barMax = grandTotal > 0 ? grandTotal : 1;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          TAMK FieldLab – Investointien kustannuserittely
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">
          Optiorivit kytketään päälle checkboxilla · kaikki summat muokattavissa
        </p>
      </div>

      {/* ── Summary KPI bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {machines.map(m => {
          const t = machineTotal(m);
          const pct = grandTotal > 0 ? Math.round(t / grandTotal * 100) : 0;
          return (
            <div key={m.id} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 shadow-sm">
              <div className="text-xl mb-1">{m.icon}</div>
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight mb-2 line-clamp-2">{m.name}</div>
              <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100">{fmt(t)}</div>
              <div className="mt-2 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">{pct}% kokonaisbudjetista</div>
            </div>
          );
        })}
      </div>

      {/* ── Machine cards ── */}
      {machines.map(machine => {
        const mTotal = machineTotal(machine);
        return (
          <div key={machine.id} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden">

            {/* Machine header */}
            <button
              onClick={() => toggleMachine(machine.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors border-b border-neutral-100 dark:border-neutral-700"
            >
              <span className="text-2xl shrink-0">{machine.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-neutral-900 dark:text-neutral-100 text-sm leading-tight">{machine.name}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {machine.groups.length} kategoriaa · {machine.groups.reduce((s, g) => s + g.rows.length, 0)} riviä
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold font-mono text-primary-600 dark:text-primary-400 text-base">{fmt(mTotal)}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{grandTotal > 0 ? Math.round(mTotal/grandTotal*100) : 0}% budjetista</div>
              </div>
              {machine.expanded
                ? <ChevronDown size={16} className="text-neutral-400 shrink-0 ml-1" />
                : <ChevronRight size={16} className="text-neutral-400 shrink-0 ml-1" />}
            </button>

            {machine.expanded && (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-700/60">
                {machine.groups.map(grp => {
                  const gTotal = groupTotal(grp);
                  const hasOptions = grp.rows.some(r => r.optional);
                  return (
                    <div key={grp.id}>
                      {/* Group header */}
                      <button
                        onClick={() => toggleGroup(machine.id, grp.id)}
                        className="w-full flex items-center gap-3 px-5 py-3 bg-neutral-50/70 dark:bg-neutral-800/80 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
                      >
                        <div className="w-1.5 h-4 rounded-full bg-primary-400 dark:bg-primary-500 shrink-0" />
                        {grp.expanded
                          ? <ChevronDown size={13} className="text-neutral-400 shrink-0" />
                          : <ChevronRight size={13} className="text-neutral-400 shrink-0" />}
                        <span className="flex-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">{grp.label}</span>
                        {hasOptions && <Badge variant="neutral" size="sm">sis. optiot</Badge>}
                        <span className="text-sm font-bold font-mono text-neutral-700 dark:text-neutral-200 ml-2">{fmt(gTotal)}</span>
                      </button>

                      {/* Rows */}
                      {grp.expanded && (
                        <>
                          {/* Column headers */}
                          <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-neutral-50/40 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-700/40">
                            <span className="col-span-1" />
                            <span className="col-span-6 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Kustannuserä</span>
                            <span className="col-span-4 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 text-right">Summa</span>
                            <span className="col-span-1" />
                          </div>

                          {grp.rows.map((r, idx) => (
                            <div
                              key={r.id}
                              className={[
                                'grid grid-cols-12 gap-2 items-center px-5 py-2.5 transition-colors',
                                idx % 2 === 0 ? 'bg-white dark:bg-neutral-800' : 'bg-neutral-50/50 dark:bg-neutral-800/60',
                                !r.enabled ? 'opacity-40' : '',
                              ].join(' ')}
                            >
                              {/* Checkbox or bullet */}
                              <div className="col-span-1 flex justify-center">
                                {r.optional ? (
                                  <button
                                    onClick={() => toggleRow(machine.id, grp.id, r.id)}
                                    aria-label={r.enabled ? 'Poista optio' : 'Lisää optio'}
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                      r.enabled
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400'
                                    }`}
                                  >
                                    {r.enabled && <span className="text-white text-[9px] leading-none font-bold">✓</span>}
                                  </button>
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                )}
                              </div>

                              {/* Label */}
                              <div className="col-span-6">
                                <span className={`text-sm ${
                                  r.optional
                                    ? 'text-neutral-500 dark:text-neutral-400 italic'
                                    : 'text-neutral-800 dark:text-neutral-200'
                                }`}>
                                  {r.label}
                                </span>
                                {r.optional && (
                                  <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] text-amber-500 dark:text-amber-400 not-italic font-medium">
                                    optio
                                  </span>
                                )}
                              </div>

                              {/* Amount input — proper box */}
                              <div className="col-span-4 flex items-center justify-end gap-1">
                                <div className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors ${
                                  r.enabled
                                    ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-600 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20'
                                    : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700'
                                }`}>
                                  <input
                                    type="number"
                                    aria-label={r.label}
                                    className="w-20 text-right font-mono text-sm bg-transparent focus:outline-none text-neutral-800 dark:text-neutral-200 disabled:text-neutral-400"
                                    value={r.amount}
                                    onChange={e => updateAmount(machine.id, grp.id, r.id, Number(e.target.value))}
                                    disabled={!r.enabled}
                                  />
                                  <span className="text-xs text-neutral-400 shrink-0">€</span>
                                </div>
                              </div>

                              {/* Changed indicator */}
                              <div className="col-span-1 flex justify-center">
                                {r.amount !== r.amount && null /* placeholder */}
                              </div>
                            </div>
                          ))}

                          {/* Group subtotal row */}
                          <div className="flex items-center justify-end gap-3 px-5 py-2.5 bg-primary-50 dark:bg-primary-900/10 border-t border-primary-100 dark:border-primary-800/30">
                            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Välisumma</span>
                            <span className="text-sm font-bold font-mono text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-lg">{fmt(gTotal)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Machine total footer */}
                <div className="flex items-center justify-between px-5 py-4 bg-neutral-50 dark:bg-neutral-800/60">
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {machine.icon} {machine.name} – yhteensä
                  </span>
                  <span className="text-lg font-bold font-mono text-primary-600 dark:text-primary-400">{fmt(mTotal)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Summary card ── */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Kokonaisyhteenveto</h2>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-700/60">
          {machines.map(m => {
            const t = machineTotal(m);
            const pct = barMax > 0 ? t / barMax * 100 : 0;
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-lg shrink-0">{m.icon}</span>
                <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 min-w-0 truncate">{m.name}</span>
                <div className="hidden sm:flex items-center gap-2 w-32">
                  <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-neutral-400 w-7 text-right">{Math.round(pct)}%</span>
                </div>
                <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 text-sm shrink-0">{fmt(t)}</span>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 space-y-2 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Välisumma</span>
            <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{fmt(grandTotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Varmuusmarginaali</span>
              <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-600 rounded-lg px-2 py-0.5 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
                <label htmlFor="margin-pct" className="sr-only">Varmuusmarginaali prosentteina</label>
                <input
                  id="margin-pct"
                  type="number" min={0} max={50}
                  aria-label="Varmuusmarginaali prosentteina"
                  className="w-10 text-center font-mono text-sm bg-transparent focus:outline-none text-neutral-800 dark:text-neutral-200"
                  value={marginPct}
                  onChange={e => setMarginPct(Number(e.target.value))}
                />
                <span className="text-xs text-neutral-400">%</span>
              </div>
            </div>
            <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{fmt(margin)}</span>
          </div>
        </div>

        {/* Grand total */}
        <div className="flex items-center justify-between px-5 py-5 bg-primary-600 dark:bg-primary-700">
          <span className="text-white font-bold text-base">Loppusumma (sis. marginaali)</span>
          <span className="text-white font-bold text-2xl font-mono">{fmt(finalTotal)}</span>
        </div>

        {/* Hidden cost insight */}
        <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-800/30">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Piilokustannukset {hiddenCostPct}% kokonaisbudjetista</span>
            <span className="block mt-0.5 text-amber-700 dark:text-amber-400">
              Pelkät laitehinnat {fmt(equipmentTotal)} — todellinen kokonaiskustannus {fmt(grandTotal)} eli{' '}
              {fmt(grandTotal - equipmentTotal)} enemmän kuin pelkät laitteet.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
