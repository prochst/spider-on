# Specifikace hry Spider On

Verze 0.1, návrh ke schválení. Tento dokument je jediný zdroj pravdy o pravidlech hry. Když se kód a specifikace rozcházejí, platí specifikace, nebo se nejdřív upraví specifikace.

Hodnoty označené **(laditelné)** jsou výchozí odhady. Upraví se při hraní a jejich konečné hodnoty budou v `src/game/config.ts`.

## 1. Přehled

Spider On je arkádová hra pro jednoho hráče inspirovaná klasickými bludišťovými hrami konce 70. let. Hráč ovládá pavouka, který neustále leze po kruhové pavučině a sbírá mouchy. Nepřátelští pavouci lezou opačným směrem a snaží se do hráče čelně narazit. Kolo končí, když hráč sebere všechny mouchy.

Hra běží v prohlížeči, na Androidu a na iOS. Výchozí grafický styl je neon: svítící vektorové čáry na tmavém pozadí.

## 2. Herní plocha

- Pavučina má **5 soustředných kruhů** (pruhů), číslovaných od středu: kruh 0 je nejvnitřnější, kruh 4 nejvnější.
- Z pavučiny vychází **12 radiálních vláken** po 30°. Kruhy mezi sousedními vlákny jsou mírně prověšené ke středu, takže pavučina působí jako mnohoúhelník.
- **4 vlákna jsou přechodová**: vpravo (0°), dole (90°), vlevo (180°) a nahoře (270°). Jen na nich lze přelézt na sousední kruh. Ve hře jsou výrazně zvýrazněná.
- Souřadnice: střed pavučiny je počátek, jednotka `R` je polovina strany herní plochy. Poloměr kruhu `i` je `0,28 + 0,16 · i` (v jednotkách `R`), takže vnější kruh leží na `0,92 R`. Úhel 0° míří doprava a roste po směru hodinových ručiček, jako na obrazovce.
- Herní plocha je čtvercová a zmenšuje se nebo zvětšuje podle okna. Na širokém displeji je HUD vedle plochy, na úzkém nad ní.

## 3. Mouchy

- Na každém kruhu je **12 much**, vždy uprostřed mezi dvěma radiálními vlákny. Celkem je v kole **60 much**.
- Hráč sebere mouchu, když leze po stejném kruhu a jeho úhlová vzdálenost od mouchy je menší než sběrný práh **(laditelné, výchozí 0,06 rad)**.
- Nepřátelé mouchy nesbírají.

## 4. Pohyb hráče

- Hráčův pavouk leze **proti směru hodinových ručiček** a nemůže zastavit ani couvat.
- Rychlost je konstantní obvodová rychlost, ne úhlová. Na vnitřním kruhu tedy oběhne kolo rychleji než na vnějším.
  - Základní rychlost: **0,7 R/s (laditelné)**.
  - S plynem: **1,7× základní (laditelné)**.
- **Změna kruhu**: hráč zadá záměr „dovnitř“ nebo „ven“. Záměr se zapamatuje a provede se na nejbližším přechodovém vlákně, kam pavouk dorazí. Po provedení se záměr smaže. Opačný záměr zadaný před přechodem ten původní nahradí.
  - Bez plynu lze na jednom přechodu přelézt **až o 2 kruhy**, pokud hráč záměr během přelézání zopakuje. S plynem jen **o 1 kruh**. (V originále platilo, že pomalejší auto přejede víc pruhů.)
  - Přelezení o jeden kruh trvá **0,3 s (laditelné)**. Během něj je pavouk na vlákně mezi kruhy a může se srazit.
  - Záměr, který nejde provést (ven z kruhu 4, dovnitř z kruhu 0), se ignoruje.
- Na startu kola stojí hráč na kruhu 4 dole (90°) a hned se rozleze.

## 5. Nepřátelští pavouci

- Lezou **po směru hodinových ručiček**, nikdy nezastaví.
- Rychlost se zadává jako násobek hráčovy základní rychlosti: **pomalý 0,75×, rychlý 1,0× (laditelné)**. Nepřátelé plyn nemají.
- **Chování (AI)**: na každém přechodovém vlákně se nepřítel rozhodne:
  - s pravděpodobností `p` přeleze o **jeden** kruh směrem ke kruhu, na který míří hráč (cílový kruh hráčova záměru, jinak jeho aktuální kruh),
  - jinak pokračuje po svém kruhu.
  - `p` roste s kolem: **0,6 v kole 1, +0,05 za každé další, nejvýš 0,95 (laditelné)**.
- Nepřátelé spolu nekolidují a mohou se překrývat.
- Na startu kola začínají na vnitřních kruzích, na opačné straně pavučiny než hráč, a jsou rozmístěni tak, aby žádný nebyl blíž než čtvrt obvodu od hráče.

## 6. Kola a obtížnost

| Kolo | Nepřátelé |
| --- | --- |
| 1 | 1 pomalý |
| 2 | 1 rychlý |
| 3 | 2 pomalí |
| 4 | 2 rychlí |
| 5 | 3 pomalí |
| 6 a další | 3 rychlí, rychlost +3 % za každé kolo nad 6, nejvýš 1,3× |

Kolo končí sebráním poslední mouchy. Následuje krátká pauza (1,5 s) s nápisem čísla kola a nové kolo začne s plnou pavučinou much.

## 7. Srážky a životy

- Ke srážce dojde, když je vzdálenost středů hráče a nepřítele menší než **0,075 R (laditelné)**. Platí to i během přelézání mezi kruhy.
- Srážka znamená ztrátu jednoho života. Následuje animace srážky (1,1 s), pak se hráč i nepřátelé vrátí na startovní pozice. **Sebrané mouchy zůstanou sebrané.**
- Hráč začíná se **3 životy**. Život navíc získá při 5 000 bodech a pak každých dalších 10 000 bodů, nejvýš 5 životů.
- Při ztrátě posledního života hra končí.

## 8. Bodování

| Událost | Body |
| --- | --- |
| Sebraná moucha | 10 |
| Dokončené kolo | 100 × číslo kola |

- Nejvyšší skóre se ukládá v zařízení (v prohlížeči `localStorage`). Když uložení selže, hra funguje dál bez něj.

## 9. Ovládání

| Akce | Klávesnice | Dotyk |
| --- | --- | --- |
| Dovnitř (ke středu) | Šipka dolů nebo S | Tah prstem směrem ke středu pavučiny |
| Ven (k okraji) | Šipka nahoru nebo W | Tah prstem směrem od středu |
| Plyn | Mezerník nebo Shift (držet) | Držet tlačítko plynu v pravém dolním rohu |
| Pauza | P nebo Esc | Tlačítko pauzy v HUD |

- Hra se pozastaví sama, když okno ztratí fokus nebo se aplikace přepne do pozadí.

## 10. Obrazovky

1. **Úvod**: název hry, tlačítko Hrát, výběr šablony vzhledu, nejvyšší skóre, vypínač zvuku.
2. **Hra**: pavučina a HUD se skóre, číslem kola a životy.
3. **Pauza**: Pokračovat, Zpět do menu.
4. **Konec hry**: skóre, nejvyšší skóre, Hrát znovu, Zpět do menu.

## 11. Zvuk

- Krátké syntetizované zvuky přes Web Audio API, bez zvukových souborů: sebrání mouchy, přelezení kruhu, srážka, dokončení kola, konec hry.
- Zvuk se spustí až po první interakci hráče (požadavek prohlížečů). Vypínač zvuku se pamatuje.

## 12. Šablony vzhledu

- Vzhled je oddělený od pravidel. Herní logika zná jen pozice, směry a stavy, nic neví o barvách ani tvarech.
- Šablona definuje paletu, písmo a kreslicí funkce pro: pozadí, pavučinu, přechodová vlákna, mouchu, hráčova pavouka, nepřátelského pavouka, efekt srážky a HUD.
- Výchozí šablona je **Neon**. Druhá šablona **Čmáranice** (tužka na čtverečkovaném papíře) přijde později jako ukázka přidání šablony.
- Šablona se vybírá v úvodu a jde přepnout i v pauze. Volba se pamatuje.

## 13. Technické požadavky

- TypeScript, čistý Canvas 2D, žádný herní framework. Sestavení přes Vite.
- Simulace běží s **pevným krokem 1/120 s**, vykreslování přes `requestAnimationFrame`. Výsledek hry nezávisí na snímkové frekvenci.
- Herní logika je deterministická: náhoda se předává jako generátor se semínkem, aby šly testy opakovat.
- Logika (`src/game/`) nesmí používat DOM, Canvas ani časovače prohlížeče. Pokrývají ji unit testy.
- Ostré vykreslení na HiDPI displejích.
- Hra musí plynule běžet na běžném mobilním telefonu (cíl 60 snímků za sekundu).

## 14. Mimo rozsah verze 1

- Hra dvou hráčů, online žebříček, editor pavučin, nákupy v aplikaci, reklamy.

## 15. Otevřené otázky ke schválení

1. Bodování 10 za mouchu a bonus 100 × kolo, nebo věrněji originálu 5 za tečku?
2. Mají sebrané mouchy po srážce zůstat sebrané (vlídnější), nebo se kolo po srážce obnoví celé (jako v originále)?
3. Je zapamatování záměru změny kruhu v pořádku? Odpouští přesné načasování, které originál vyžadoval.
4. Ovládání na dotyk: tah prstem a tlačítko plynu, nebo raději čtyři tlačítka na obrazovce?
