# QA Review – TAMK FieldLab HMLV Production App

**Päivämäärä:** 2026-04-07  
**Tarkastaja:** Senior QA Review (automaattinen)  
**Tarkastetut tiedostot:** 26

---

## 1. Arkkitehtuuri & Rakenne

🔴 **Tiedosto:** `src/hooks/useSession.ts` ~Rivi 58  
**Ongelma:** `useEffect`-riippuvuuslista on tyhjennetty `eslint-disable`-kommentilla. Hookki lukee `setSessionId`, `setUserName` jne. mutta ne eivät ole dependency-listassa → stale closure -bugi mahdollinen.  
**Korjaus:** Siirrä `createNewSession` ja `loadSessionData` `useCallback`-hookkeihin oikeilla dependencyillä.

🟡 **Tiedosto:** `src/hooks/useRealtime.ts` ~Rivit 115–145  
**Ongelma:** Neljä lähes identtistä `useEffect`-hookia (investments, layouts, dedInput, fastemTree). Toistuvaa koodia jota ei ole abstrahoitu.  
**Korjaus:** Yksi geneerinen `useSyncField`-hookki parametreilla `(value, tableName, pushFn)`.

🟡 **Tiedosto:** `src/store/useStore.ts` ~Rivit 88–102  
**Ongelma:** `partialize`-funktio listaa persistoitavat kentät käsin. Jos uusia kenttiä lisätään storeen, ne unohtuvat persistoinnista helposti.  
**Korjaus:** Käänteinen logiikka – persistoi kaikki paitsi `toasts` ja `onlineUsers`.

🟢 **Tiedosto:** `src/utils/calculations.ts`  
**Ongelma:** Business-logiikka (DED-kustannuslaskenta, SPC) on samassa tiedostossa kuin talouslaskenta. Ei riko toiminnallisuutta, mutta vaikea löytää.  
**Korjaus:** Jaa `calculations.ts` → `financialCalc.ts`, `dedCalc.ts`, `spcCalc.ts`.

---

## 2. TypeScript-laatu

🔴 **Tiedosto:** `src/hooks/usePresence.ts` ~Rivi 60  
**Ongelma:** `supabase.getChannels()` palauttaa kanavan jolla on `topic`-kenttä muodossa `realtime:presence-${sessionId}`, mutta koodissa etsitään suoraan `presence-${sessionId}` – match epäonnistuu aina, presence-päivitys ei toimi välilehtivalinnassa.  
**Korjaus:** `c.topic === \`realtime:presence-${sessionId}\`` → `c.topic.includes(\`presence-${sessionId}\`)`.

🟡 **Tiedosto:** `src/data/odooData.ts` ~Rivi 39  
**Ongelma:** Kirjoitusvirhe: `'Jäljitettävuus'` (rivi 39) vs `'Jäljitettävyys'` (rivi 48 ja `fieldlabRequirements`). Avain ei löydy matriisista → solu renderöityy aina `'no'`-tilana.  
**Korjaus:** Korjaa `'Jäljitettävuus'` → `'Jäljitettävyys'` rivillä 39.

🟡 **Tiedosto:** `src/components/fastems/FASTEMSTree.tsx` ~Rivi 296  
**Ongelma:** `<input type="number">` palauttaa merkkijonon, mutta `newNodeForm.manufacturingTime` on `number`. Ilman `Number()`-muunnosta arvo voi olla `"0"` eikä `0`.  
**Korjaus:** `onChange={(e) => setNewNodeForm(f => ({...f, manufacturingTime: Number(e.target.value)}))}` – tarkista että muunnos on paikallaan.

🟢 **Tiedosto:** `src/types/index.ts`  
**Ongelma:** `MachineType`, `DEDMaterial` jne. ovat string literal -unioneja mutta ei ole `as const` -objektia josta ne generoitaisiin. Lisätessä uuden arvon täytyy muistaa päivittää sekä tyyppi että kaikki switch/map-rakenteet.  
**Korjaus:** `export const MACHINE_TYPES = ['meltio', ...] as const; export type MachineType = typeof MACHINE_TYPES[number];`

---

## 3. React-patternt & Suorituskyky

🔴 **Tiedosto:** `src/utils/calculations.ts` ~Rivi 9  
**Ongelma:** `paybackPeriod = inv.cost / annualNetCashFlow` – jako nollalla kun `annualSavings === annualMaintenanceCost`. Palauttaa `Infinity` joka renderöityy UI:ssa tyhjänä tai kaataa Intl.NumberFormat-kutsun.  
**Korjaus:** `if (annualNetCashFlow <= 0) return { paybackPeriod: Infinity, ... }` ja renderöi UI:ssa "Ei takaisinmaksua".

🟡 **Tiedosto:** `src/components/investments/InvestmentCalculator.tsx` ~Rivi 31  
**Ongelma:** `calcs`-muuttuja lasketaan joka renderöinnillä uudelleen vaikka `investments`, `discountRate` ja `sensitivity` eivät ole muuttuneet.  
**Korjaus:** `const calcs = useMemo(() => investments.map(...), [investments, discountRate, sensitivity]);`

🟡 **Tiedosto:** `src/components/layout-plan/LayoutPlan.tsx` ~Rivit 92–118  
**Ongelma:** `handleMouseMove` päivittää Zustand-storen jokaisella hiiren liikkeella ilman debouncea tai throttlea → satoja päivityksiä sekunnissa, joista jokainen triggerää Supabase-pushin (useRealtime).  
**Korjaus:** Käytä `useRef` väliaikaiselle sijainnille drag-aikana, päivitä Zustand vasta `mouseUp`-eventissä.

🟡 **Tiedosto:** `src/components/ded-usecase/DEDUseCaseTool.tsx` ~Rivi 110  
**Ongelma:** `Object.entries(materialProperties)` kutsutaan joka renderöinnillä JSX:ssä.  
**Korjaus:** `const materialEntries = useMemo(() => Object.entries(materialProperties), []);`

🟢 **Tiedosto:** `src/components/shared/ToastProvider.tsx` ~Rivit 8–11  
**Ongelma:** `useEffect` luo timeoutin jokaiselle toastille mutta ei palauta cleanup-funktiota yksittäisille toasteille – jos komponentti unmountataan kesken timeoutin, muistivuoto mahdollinen.  
**Korjaus:** Kerää timeout-IDt ja siivoa ne effectin cleanup-funktiossa.

---

## 4. Virheenkäsittely & Reunatapaukset

🔴 **Tiedosto:** `src/hooks/useSession.ts` ~Rivit 36, 46, 62  
**Ongelma:** Supabase `.single()` heittää virheen jos rivejä on 0 tai yli 1. Koodissa ei tarkisteta `error`-kenttää ennen `data`-käyttöä useissa paikoissa.  
**Korjaus:** Aina `if (error || !data) { console.error(error); return; }` jokaisen Supabase-kutsun jälkeen.

🔴 **Tiedosto:** `src/components/dashboard/Dashboard.tsx` ~Rivit 13–19  
**Ongelma:** `investments.reduce()` kutsutaan ilman `initialValue`-parametria. Jos `investments` on tyhjä taulukko (Supabase-latauksen aikana tai virheen jälkeen), heittää `TypeError: Reduce of empty array with no initial value`.  
**Korjaus:** Lisää initial value: `.reduce((s, i) => s + i.cost, 0)` – tarkista kaikki reduce-kutsut.

🟡 **Tiedosto:** `src/components/layout/SessionBar.tsx` ~Rivi 30  
**Ongelma:** `navigator.clipboard.writeText()` ei ole wrappattuna try-catch:iin. Epäonnistuu äänettömästi HTTP-kontekstissa (ei-HTTPS) tai jos selain ei tue Clipboard API:a.  
**Korjaus:** `try { await navigator.clipboard.writeText(shareUrl); setCopied(true); } catch { /* fallback */ }`

🟡 **Tiedosto:** Kaikki sivukomponentit  
**Ongelma:** Ei lataustilojen näyttämistä. Supabase-datan latauksen aikana komponentit renderöivät tyhjillä/default-arvoilla ilman loading-indikaattoria.  
**Korjaus:** Lisää `isLoading: boolean` storeen, näytä skeleton tai spinner latauksen aikana.

🟡 **Tiedosto:** Kaikki lomakekomponentit  
**Ongelma:** Ei syötteen validointia. `InvestmentCalculator` hyväksyy negatiivisen hankintahinnan, `FASTEMSTree` hyväksyy tyhjän nimen.  
**Korjaus:** Validointi ennen `saveForm()`/`saveEdit()`: `if (!form.name.trim() || form.cost < 0) return;`

🟢 **Tiedosto:** `src/App.tsx` ~Rivi 32  
**Ongelma:** Ei error boundary -komponenttia. Jos jokin sivukomponentti heittää ajonaikaisen virheen, koko sovellus kaatuu valkoiselle ruudulle.  
**Korjaus:** Wrappaa `<Page />` `<ErrorBoundary>`-komponentilla joka näyttää hyödyllisen virheilmoituksen.

---

## 5. Saavutettavuus (a11y)

🟡 **Tiedosto:** `src/components/layout/Navbar.tsx` ~Rivit 28–52  
**Ongelma:** Navigaatiopainikkeet ovat `<button>`-elementtejä ilman `role="tab"` ja `aria-selected`-attribuutteja. Screen reader ei ymmärrä tab-navigaation semantiikkaa.  
**Korjaus:** Lisää `role="tablist"` containeriin, `role="tab"` ja `aria-selected={activeTab === tab.id}` jokaiselle painikkeelle.

🟡 **Tiedosto:** `src/components/investments/InvestmentCalculator.tsx` ~Rivi 159  
**Ongelma:** Painikkeet `✎` ja `✕` ovat symboleja ilman `aria-label`-attribuuttia. Screen reader lukee "pencil" tai "times" eikä ymmärrä kontekstia.  
**Korjaus:** `<button aria-label="Muokkaa investointia">✎</button>`

🟡 **Tiedosto:** `src/components/investments/InvestmentCalculator.tsx` ~Rivit 102–117  
**Ongelma:** `<input type="range">` -elementeillä ei ole `id`-attribuuttia eikä `<label>` ole yhdistetty `htmlFor`:lla.  
**Korjaus:** `<label htmlFor="discount-rate">...</label><input id="discount-rate" type="range" />`

🟢 **Tiedosto:** Kaikki modaalit (`InvestmentCalculator`, `FASTEMSTree`)  
**Ongelma:** Modaaleissa ei ole `role="dialog"`, `aria-modal="true"` eikä `aria-labelledby`. ESC-näppäin ei sulje modaalia.  
**Korjaus:** Lisää ARIA-attribuutit ja `onKeyDown`-käsittelijä joka kuuntelee `Escape`-näppäintä.

🟢 **Tiedosto:** `src/components/dashboard/Dashboard.tsx` ~Rivi 118  
**Ongelma:** Emoji-ikonit (`💰`, `📈` jne.) KPI-korteissa luetaan screen readerilla kirjaimellisesti ("money bag", "chart increasing").  
**Korjaus:** `<span aria-hidden="true">💰</span>`

---

## 6. Responsiivisuus & CSS

🟡 **Tiedosto:** `src/components/layout-plan/LayoutPlan.tsx` ~Rivit 6–8  
**Ongelma:** SVG-canvas on kiinteästi `800×500` pikseliä. Mobiililla tai pienellä näytöllä canvas ylittää viewportin leveyden.  
**Korjaus:** Käytä `viewBox` ja anna SVG:n skaalautua: `viewBox="0 0 800 500" width="100%" style={{maxWidth: 800}}`.

🟡 **Tiedosto:** `src/components/odoo/OdooERP.tsx` ~Rivi 78  
**Ongelma:** `writingMode: 'vertical-rl'` + `transform: 'rotate(180deg)'` taulukon otsikossa ei toimi luotettavasti kaikissa selaimissa (erityisesti Safari).  
**Korjaus:** Käytä `transform: 'rotate(-90deg)'` + `transformOrigin` tai yksinkertaista lyhentämällä otsikkotekstit.

🟢 **Tiedosto:** `tailwind.config.js`  
**Ongelma:** `industrial` ja `accent` väripaletti on määritelty mutta ei käytetä missään komponentissa – kuollutta konfiguraatiota.  
**Korjaus:** Poista käyttämättömät värit tai ota ne käyttöön yhtenäisen design systemin rakentamiseksi.

---

## 7. Tietoturva

🟡 **Tiedosto:** `src/hooks/useSession.ts` ~Rivi 30  
**Ongelma:** `new URLSearchParams(window.location.search)` lukee `session`-parametrin suoraan ilman validointia. Haitallinen UUID-arvo lähetetään suoraan Supabase-kyselyyn.  
**Korjaus:** Validoi UUID-muoto ennen käyttöä: `const UUID_RE = /^[0-9a-f-]{36}$/i; if (!UUID_RE.test(urlSession)) return;`

🟡 **Tiedosto:** `src/lib/supabase.ts` ~Rivit 13–14  
**Ongelma:** Jos ympäristömuuttujat puuttuvat, luodaan client placeholder-arvoilla joka tekee network-kutsuja oikeaan Supabase-endpointtiin virheellisillä tunnuksilla. Virhettä ei näytetä käyttäjälle.  
**Korjaus:** Heitä eksplisiittinen virhe kehitysmoodissa: `if (import.meta.env.DEV && !supabaseUrl) throw new Error('Lisää VITE_SUPABASE_URL tiedostoon .env.local');`

🟢 **Tiedosto:** `src/store/useStore.ts`  
**Ongelma:** Kaikki sovellusdata (investoinnit, layoutit) tallennetaan `localStorage`-muistiin selkokielisenä JSONina ilman minkäänlaista salausta tai eheyden tarkistusta.  
**Korjaus:** Lisää versiointi (`version: 1`) persistoituun dataan, jotta schema-muutokset eivät riko tallennetun tilan.

---

## 8. Testattavuus

🟡 **Tiedosto:** `src/utils/calculations.ts`  
**Ongelma:** Laskentafunktiot ovat puhtaita funktioita ja helposti testattavia – mutta testejä ei ole lainkaan. Laskentavirheet (esim. jako nollalla) voivat jäädä huomaamatta.  
**Korjaus:** Lisää Vitest + `calculations.test.ts` jossa testataan ainakin: NPV nollalla kassavirralla, IRR konvergenssi, DED-pisteytyksen ääriarvot.

🟢 **Tiedosto:** Kaikki komponentit  
**Ongelma:** Komponentit ovat tiiviisti kytkettyjä Zustand-storeen `useStore()`-kutsulla suoraan. Ei mahdollista renderöidä komponenttia testissä ilman koko storen alustamista.  
**Korjaus:** Hyväksy kriittiset arvot propseina Zustand-kutsun rinnalla, tai käytä dependency injection -pattern.

---

## 9. DX & Ylläpidettävyys

🟡 **Tiedosto:** `src/utils/calculations.ts` ~Rivit 82–94  
**Ongelma:** 10+ magiikkanumeroa DED-laskennassa ilman kommentteja tai vakioita: `1.15` (lankajäte), `0.3` (kg/min), `85` (€/h), `150` (kiinteä kustannus), `65` (perinteinen €/h) jne.  
**Korjaus:** Kerää `src/data/constants.ts`-tiedostoon: `export const DED_WIRE_WASTE = 1.15; export const DED_DEPOSITION_RATE_KG_MIN = 0.3;` jne.

🟡 **Tiedosto:** `src/data/odooData.ts` ~Rivi 39  
**Ongelma:** Kirjoitusvirhe `'Jäljitettävuus'` aiheuttaa että Inventory-moduulin "Jäljitettävyys"-sarake näyttää aina `'no'` vaikka se on merkitty `'full'`:ksi.  
**Korjaus:** `'Jäljitettävuus'` → `'Jäljitettävyys'`

🟢 **Tiedosto:** `src/components/fastems/FASTEMSTree.tsx` ~Rivit 252–291  
**Ongelma:** Kentän nimet (`'name'` → `'Nimi'`, `'description'` → `'Kuvaus'` jne.) toistetaan kahdessa erillisessä modaalissa identtisinä.  
**Korjaus:** Extraktoi `const FIELD_LABELS: Record<string, string> = { name: 'Nimi', ... }` jaetuksi vakioksi.

🟢 **Tiedosto:** `src/components/quality/DataQuality.tsx` ~Rivit 186, 210  
**Ongelma:** Recharts-linjakaavioon on kopioitu identtinen custom dot -renderöijä kahdesti (X-bar ja R-kortti).  
**Korjaus:** Extraktoi `<SPCDot ucl={...} lcl={...} />` -komponentiksi.

---

## Yhteenveto

| Kategoria | 🔴 Kriittinen | 🟡 Tärkeä | 🟢 Suositus |
|---|---|---|---|
| Arkkitehtuuri | 1 | 2 | 1 |
| TypeScript | 2 | 1 | 1 |
| React / suorituskyky | 1 | 3 | 1 |
| Virheenkäsittely | 2 | 3 | 1 |
| Saavutettavuus | 0 | 3 | 2 |
| Responsiivisuus | 0 | 2 | 1 |
| Tietoturva | 0 | 2 | 1 |
| Testattavuus | 0 | 1 | 1 |
| DX / ylläpito | 0 | 2 | 3 |
| **Yhteensä** | **6** | **19** | **12** |

### Kokonaisarvosana: **6.5 / 10**

**Perustelut:** Sovellus toimii ja sen arkkitehtuuri on selkeä. Kriittiset bugit (jako nollalla, tyhjä reduce, kirjoitusvirhe Odoo-matriisissa) pitää korjata ennen julkaisua. Suorituskyky kärsii erityisesti drag-operaatioiden real-time-syncista. Testit puuttuvat kokonaan. Saavutettavuus on perustasolla mutta ei WCAG AA -tasoinen. Koodi on luettavaa ja rakenne on looginen – hyvä pohja jatkojalostukselle.

### Kiireellisimmät korjaukset (tee ensin):
1. 🔴 `calculations.ts`: jako nollalla paybackPeriod-laskennassa
2. 🔴 `Dashboard.tsx`: `.reduce()` tyhjällä taulukolla kaatuu
3. 🔴 `usePresence.ts`: presence-kanavan topic-haku ei matchaa → ei päivity
4. 🟡 `odooData.ts`: kirjoitusvirhe `'Jäljitettävuus'` rikkoo Odoo-matriisin
5. 🟡 `useSession.ts`: Supabase-virheet käsittelemättä → hiljaisia epäonnistumisia
6. 🟡 `LayoutPlan.tsx`: mouseMove päivittää Supabaseen sadat kerrat sekunnissa
