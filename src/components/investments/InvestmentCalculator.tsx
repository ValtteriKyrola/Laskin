import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../ui';

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
    id: 'm1', icon: '🔧', name: 'Pääkone: Bridgeport → DN Solutions DNM 5700', expanded: true,
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
    id: 'm2', icon: '🤖', name: 'Mobiilirobotti (AMR) – MiR250', expanded: true,
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
    id: 'm3', icon: '🦾', name: 'Nivelvarsirobotti / Cobot – UR10e', expanded: true,
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
    id: 'm4', icon: '🏭', name: 'Jaetut kustannukset', expanded: true,
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
  const [machines, setMachines] = useState<Machine[]>(saved?.machines ?? INITIAL);
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

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">TAMK FieldLab – Investointien kustannuserittely</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">Optiorivit voidaan kytkeä päälle/pois · kaikki summat muokattavissa</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="margin-pct" className="text-xs text-neutral-500">Marginaali</label>
          <input
            id="margin-pct"
            type="number" min={0} max={50}
            aria-label="Varmuusmarginaali prosentteina"
            className="w-16 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-2 py-1 text-sm text-center font-mono focus:outline-none focus:border-primary-500"
            value={marginPct}
            onChange={e => setMarginPct(Number(e.target.value))}
          />
          <span className="text-xs text-neutral-500">%</span>
        </div>
      </div>

      {/* Machine cards */}
      {machines.map(machine => {
        const mTotal = machineTotal(machine);
        return (
          <Card key={machine.id} accent>
            {/* Machine header */}
            <button
              onClick={() => toggleMachine(machine.id)}
              className="w-full flex items-center gap-2 text-left"
            >
              <span className="text-lg">{machine.icon}</span>
              <span className="flex-1 font-bold text-neutral-900 dark:text-neutral-100 text-sm">{machine.name}</span>
              <span className="font-bold font-mono text-primary-500 text-sm mr-2">{fmt(mTotal)}</span>
              {machine.expanded ? <ChevronDown size={16} className="text-neutral-400 shrink-0" /> : <ChevronRight size={16} className="text-neutral-400 shrink-0" />}
            </button>

            {machine.expanded && (
              <div className="mt-4 space-y-3">
                {machine.groups.map(grp => {
                  const gTotal = groupTotal(grp);
                  return (
                    <div key={grp.id} className="border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden">
                      {/* Group header */}
                      <button
                        onClick={() => toggleGroup(machine.id, grp.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {grp.expanded ? <ChevronDown size={13} className="text-neutral-400 shrink-0" /> : <ChevronRight size={13} className="text-neutral-400 shrink-0" />}
                        <span className="flex-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">{grp.label}</span>
                        <span className="text-xs font-mono font-semibold text-neutral-600 dark:text-neutral-300">{fmt(gTotal)}</span>
                      </button>

                      {/* Rows */}
                      {grp.expanded && (
                        <div className="divide-y divide-neutral-50 dark:divide-neutral-800/60">
                          {grp.rows.map(r => (
                            <div
                              key={r.id}
                              className={`flex items-center gap-2 px-3 py-2 ${!r.enabled ? 'opacity-40' : ''}`}
                            >
                              {/* Optional toggle */}
                              {r.optional ? (
                                <button
                                  onClick={() => toggleRow(machine.id, grp.id, r.id)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                    r.enabled
                                      ? 'bg-primary-500 border-primary-500 text-white'
                                      : 'border-neutral-300 dark:border-neutral-600'
                                  }`}
                                >
                                  {r.enabled && <span className="text-[9px] leading-none">✓</span>}
                                </button>
                              ) : (
                                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                </span>
                              )}

                              {/* Label */}
                              <span className={`flex-1 text-sm ${r.optional ? 'text-neutral-500 dark:text-neutral-400 italic' : 'text-neutral-800 dark:text-neutral-200'}`}>
                                {r.label}
                                {r.optional && <span className="ml-1 text-[10px] text-neutral-400 not-italic">(optio)</span>}
                              </span>

                              {/* Amount input */}
                              <input
                                type="number"
                                className="w-28 text-right font-mono text-sm bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 focus:border-primary-500 focus:outline-none text-neutral-700 dark:text-neutral-300 py-0.5 transition-colors"
                                value={r.amount}
                                onChange={e => updateAmount(machine.id, grp.id, r.id, Number(e.target.value))}
                                disabled={!r.enabled}
                              />
                              <span className="text-xs text-neutral-400 w-3 shrink-0">€</span>
                            </div>
                          ))}

                          {/* Group subtotal */}
                          <div className="flex justify-end px-3 py-2 bg-neutral-50 dark:bg-neutral-800/40">
                            <span className="text-xs text-neutral-500 mr-2">Välisumma:</span>
                            <span className="text-xs font-bold font-mono text-neutral-700 dark:text-neutral-200">{fmt(gTotal)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Machine total */}
                <div className="flex justify-end items-center gap-3 pt-1 border-t border-neutral-200 dark:border-neutral-700 mt-2">
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">{machine.icon} Yhteensä</span>
                  <span className="font-bold font-mono text-base text-primary-600 dark:text-primary-400">{fmt(mTotal)}</span>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {/* Summary */}
      <Card accent>
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3">Kokonaisyhteenveto</h2>
        <div className="space-y-1.5">
          {machines.map(m => (
            <div key={m.id} className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">{m.icon} {m.name}</span>
              <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{fmt(machineTotal(m))}</span>
            </div>
          ))}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Välisumma</span>
              <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{fmt(grandTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Varmuusmarginaali ({marginPct}%)</span>
              <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{fmt(margin)}</span>
            </div>
          </div>
        </div>

        {/* Grand total bar */}
        <div className="mt-4 bg-primary-600 dark:bg-primary-700 rounded-xl p-4 flex items-center justify-between">
          <span className="text-white font-bold">Loppusumma</span>
          <span className="text-white text-2xl font-bold font-mono">{fmt(finalTotal)}</span>
        </div>

        {/* Hidden cost insight */}
        <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-3">
          <span className="text-amber-500 text-lg shrink-0">💡</span>
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Piilokustannukset {hiddenCostPct}% kokonaisbudjetista</span>
            <span className="block mt-0.5 text-amber-700 dark:text-amber-400">
              Pelkät laitehinnat {fmt(equipmentTotal)} — todellinen kokonaiskustannus {fmt(grandTotal)}
            </span>
          </div>
        </div>
      </Card>

    </div>
  );
}
