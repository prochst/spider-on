# Specifikace hry Spider On

Verze 0.7. Tento dokument je jediný zdroj pravdy o pravidlech hry. Když se kód a specifikace rozcházejí, platí specifikace, nebo se nejdřív upraví specifikace.

Hodnoty označené **(laditelné)** jsou výchozí odhady. Upraví se při hraní a jejich konečné hodnoty budou v `src/game/config.ts`.

## 1. Přehled

Spider On je arkádová hra pro jednoho hráče inspirovaná klasickými bludišťovými hrami konce 70. let. Hráč ovládá pavouka, který neustále leze po kruhové pavučině a sbírá mouchy. Nepřátelští pavouci lezou opačným směrem a snaží se do hráče čelně narazit. Kolo končí, když hráč sebere všechny mouchy.

Hra běží v prohlížeči, na Androidu a na iOS. Výchozí grafický styl je neon: svítící vektorové čáry na tmavém pozadí.

## 2. Herní plocha

- Pavučina má **3, 4 nebo 5 soustředných kruhů** (pruhů) podle postupu hrou (kapitola 6). Kruhy se číslují od středu: kruh 0 je nejvnitřnější.
- Z pavučiny vychází **12 radiálních vláken** po 30°. Kruhy mezi sousedními vlákny jsou mírně prověšené ke středu, takže pavučina působí jako mnohoúhelník.
- **4 vlákna jsou přechodová**: vpravo (0°), dole (90°), vlevo (180°) a nahoře (270°). Jen na nich lze přelézt na sousední kruh. Ve hře jsou výrazně zvýrazněná.
- Souřadnice: střed pavučiny je počátek, jednotka `R` je polovina strany herní plochy. Nejvnitřnější kruh leží vždy na `0,28 R` a nejvnější na `0,92 R`, ostatní kruhy jsou mezi nimi rozložené rovnoměrně. Pavučina se 3 kruhy má tedy širší rozestupy než pavučina s 5 kruhy. Úhel 0° míří doprava a roste po směru hodinových ručiček, jako na obrazovce.
- Herní plocha je čtvercová a zmenšuje se nebo zvětšuje podle okna.

## 3. Mouchy

- Na každém kruhu je **12 much**, vždy uprostřed mezi dvěma radiálními vlákny. Kolo má tedy 36, 48 nebo 60 much podle počtu kruhů.
- Hráč sebere mouchu, když leze po stejném kruhu a jeho úhlová vzdálenost od mouchy je menší než sběrný práh **(laditelné, výchozí 0,06 rad)**.
- Nepřátelé mouchy nesbírají.

## 4. Bonusové balíčky

- Bonusové balíčky se objevují **od 6. kola**. Mouchy zůstávají a kolo dál končí sebráním poslední mouchy, balíček je navíc.
- Na ploše je nejvýš **jeden balíček**. Objeví se místo jedné ještě nesebrané mouchy, náhodně vybrané z much na **protější polovině plochy**, než je hráčův pavouk (úhlově 90° až 270° od pavouka, na libovolném kruhu). Moucha pod balíčkem se tím počítá jako sebraná. Balíček nikdy nenahradí poslední nesebranou mouchu, aby kolo dál končilo jejím sebráním. Když na protější polovině žádná moucha není, balíček počká, až se nějaká objeví na protější straně.
- Balíček zůstává, dokud ho pavouk **nesebere**, nebo dokud kolem něj **neproleze po jiném kruhu** (pavouk mine úhel balíčku, když je na jiném kruhu). Pak zmizí.
- Další balíček se objeví po **náhodné době 5 až 20 s (laditelné)** od zmizení nebo sebrání předchozího. První balíček v kole se objeví stejně náhodně od začátku kola.
- Obsah balíčku se určí náhodně při jeho objevení a hráč ho pozná podle vzhledu:

| Obsah | Pravděpodobnost (laditelné) | Účinek |
| --- | --- | --- |
| Body navíc | 75 % | +250 bodů |
| Zpomalení nepřátel | 22 % | Všichni nepřátelé lezou poloviční rychlostí, dokud hráčův pavouk neoběhne jeden celý okruh (360°) |
| Život navíc | 3 % | +1 život (nejvýš 5) |

## 5. Pohyb hráče

- Hráčův pavouk leze **proti směru hodinových ručiček** a nemůže zastavit ani couvat.
- Rychlost je konstantní obvodová rychlost, ne úhlová. Na vnitřním kruhu tedy oběhne kolo rychleji než na vnějším.
  - Základní rychlost: **0,336 R/s (laditelné)**.
  - S plynem: **1,7× základní (laditelné)**.
- **Změna kruhu**: hráč zadá směr „dovnitř“ nebo „ven“.
  - Pokyn se zapamatuje, jen když ho hráč zadá v posledních **30° před přechodovým vláknem (laditelné)**. Provede se po dosažení vlákna a pak se smaže. Pokyn zadaný dřív se ignoruje. Pavouk mine vlákno za zlomek sekundy, takže „přímo na vlákně“ znamená během přelézání: pokyn ve stejném směru tam přidá další kruh (viz níže). Pokyn zadaný hned po minutí vlákna patří už k dalšímu vláknu a ignoruje se.
  - Opačný pokyn zadaný v téže zóně ten původní nahradí.
  - Bez plynu lze na jednom přechodu přelézt **až o 2 kruhy**, pokud hráč pokyn během přelézání zopakuje. S plynem jen **o 1 kruh**, rozhoduje plyn ve chvíli opakovaného pokynu. Couvnout během přelézání nelze. (V originále platilo, že pomalejší auto přejede víc pruhů.)
  - Přelezení o jeden kruh trvá **0,3 s (laditelné)**. Během něj je pavouk na vlákně mezi kruhy a může se srazit.
  - Pokyn, který nejde provést (ven z vnějšího kruhu, dovnitř z kruhu 0), se ignoruje.
- Na startu kola stojí hráč na vnějším kruhu dole (90°) a rozleze se, až hráč kolo spustí (kapitola 6).

## 6. Postup hrou, kola a obtížnost

Hra rozlišuje **číslo kola** (počítá se od 1 a jen roste, používá se pro bodování) a **stupeň obtížnosti** (určuje nepřátele podle tabulky níže). Hra má tři plochy:

| Plocha | Kola | Stupně obtížnosti |
| --- | --- | --- |
| 3 kruhy | 1 až 3 | 1, 2, 3 |
| 4 kruhy | 4 až 9 | 3, 4, 5, 6, 7, 8 |
| 5 kruhů | 10 a další | 5, 6, 7, 8, … (každé kolo o stupeň výš) |

| Stupeň obtížnosti | Nepřátelé |
| --- | --- |
| 1 | 1 pomalý |
| 2 | 1 rychlý |
| 3 | 2 pomalí |
| 4 | 2 rychlí |
| 5 | 3 pomalí |
| 6 a vyšší | 3 rychlí, rychlost +3 % za každý stupeň nad 6, nejvýš 1,3× |

- Kolo končí sebráním poslední mouchy. Hra se zastaví a ukáže obrazovku **Kolo dokončeno** (kapitola 12). Další kolo začne **až na pokyn hráče**, s plnou pavučinou much. Když hráč sebere poslední mouchu ve stejném okamžiku, kdy se srazí, platí sebrání a kolo je dokončené.
- Při přechodu na větší plochu obrazovka Kolo dokončeno hráče upozorní, že pavučina se rozrůstá.

## 7. Nepřátelští pavouci

- Lezou **po směru hodinových ručiček**, nikdy nezastaví.
- Rychlost se zadává jako násobek hráčovy základní rychlosti: **pomalý 0,75×, rychlý 1,0× (laditelné)**. Nepřátelé plyn nemají.
- **Chování (AI)**: na každém přechodovém vlákně se nepřítel rozhodne ve chvíli, kdy na vlákno dorazí:
  - s pravděpodobností `p` přeleze o **jeden** kruh směrem ke kruhu, na který míří hráč (cílový kruh hráčova pokynu, jinak jeho aktuální kruh),
  - jinak pokračuje po svém kruhu.
  - `p` roste se stupněm obtížnosti: **0,6 na stupni 1, +0,05 za každý další, nejvýš 0,95 (laditelné)**.
- Nepřátelé spolu nekolidují a mohou se překrývat.
- Na startu kola začínají na vnitřních kruzích, na opačné straně pavučiny než hráč, a jsou rozmístěni tak, aby žádný nebyl blíž než čtvrt obvodu od hráče.

## 8. Srážky a životy

- Ke srážce dojde, když je vzdálenost středů hráče a nepřítele menší než **0,075 R (laditelné)**. Platí to i během přelézání mezi kruhy.
- Srážka znamená ztrátu jednoho života. Následuje animace srážky (1,1 s), pak se **obnoví celé herní pole**: všechny mouchy kola se vrátí, zmizí bonusový balíček i zpomalení nepřátel a hráč i nepřátelé se vrátí na startovní pozice. Hra pak čeká na pokyn hráče jako na začátku kola. Body získané před srážkou zůstávají.
- Hráč začíná se **3 životy**. Život navíc získá při 5 000 bodech, pak každých dalších 10 000 bodů a výjimečně z bonusového balíčku, nejvýš 5 životů.
- Při ztrátě posledního života hra končí.

## 9. Bodování

| Událost | Body |
| --- | --- |
| Sebraná moucha | 10 |
| Bonusový balíček s body | 250 |
| Dokončené kolo | 100 × číslo kola |

## 10. Hráč a tabulka výsledků

- V **Nastavení** si hráč zadá jméno (1 až 16 znaků). Výchozí jméno je „Hráč“.
- **Tabulka výsledků** ukazuje 10 nejlepších her: pořadí, jméno, skóre, dosažené kolo a datum.
- Ve verzi 1 se tabulka ukládá v zařízení (v prohlížeči `localStorage`). Když uložení selže, hra funguje dál bez něj. Společná online tabulka pro všechny hráče je mimo rozsah verze 1.

## 11. Ovládání

**Klávesnice (počítač)**

| Akce | Klávesy |
| --- | --- |
| Dovnitř (ke středu) | Šipka dolů nebo S |
| Ven (k okraji) | Šipka nahoru nebo W |
| Po bočním vlákně | Šipka vlevo nebo vpravo (A, D): u pravého vlákna je vpravo „ven“ a vlevo „dovnitř“, u levého obráceně, stejně jako tah po touchpadu |
| Plyn | Mezerník nebo Shift (držet) |
| Spustit kolo | Enter nebo mezerník |
| Pauza | P nebo Esc |

V menu potvrdí Enter nebo mezerník hlavní volbu obrazovky (Hrát, Další kolo, Hrát znovu) a P nebo Esc vrací zpět: z pauzy do hry, z Výsledků a Nastavení na předchozí obrazovku.

**Dotyk (telefon a tablet)**, rozložení jako u přenosných herních konzolí:

- Hra běží **na šířku**. Na výšku hra ukáže výzvu k otočení zařízení a pozastaví se.
- Uprostřed je herní plocha, **vpravo virtuální touchpad**, **vlevo virtuální tlačítko plynu** (plyn platí, dokud je tlačítko držené).
- Směr tahu prstem po touchpadu určuje pohyb po přechodovém vlákně. Hra tah porovná se směrem vlákna, ke kterému pavouk míří: tah ve směru od středu po tomto vlákně znamená „ven“, tah ke středu „dovnitř“. U pravého vlákna je tedy tah doprava „ven“, u horního je „ven“ tah nahoru. Tah kolmý na vlákno se ignoruje.
- Klepnutí na touchpad spustí kolo, když hra na pokyn čeká.
- Tlačítko pauzy je v rohu HUD.

Hra se pozastaví sama, když okno ztratí fokus nebo se aplikace přepne do pozadí.

## 12. Obrazovky

1. **Úvod**: název hry, tlačítka Hrát, Výsledky a Nastavení, nejlepší skóre.
2. **Nastavení**: jméno hráče, šablona vzhledu, zvuk zapnutý/vypnutý.
3. **Výsledky**: tabulka 10 nejlepších her (kapitola 10).
4. **Hra**: pavučina a HUD se skóre, číslem kola a životy.
5. **Kolo dokončeno**: skóre za kolo, bonus, celkové skóre, informace o další ploše, tlačítko Další kolo.
6. **Pauza**: Pokračovat, Nastavení, Zpět do menu.
7. **Konec hry**: skóre, umístění v tabulce výsledků, Hrát znovu, Zpět do menu.

## 13. Zvuk

- Krátké syntetizované zvuky přes Web Audio API, bez zvukových souborů: sebrání mouchy, sebrání balíčku, přelezení kruhu, srážka, dokončení kola, konec hry.
- Zvuk se spustí až po první interakci hráče (požadavek prohlížečů). Volba zvuku se pamatuje.

## 14. Šablony vzhledu

- Vzhled je oddělený od pravidel. Herní logika zná jen pozice, směry a stavy, nic neví o barvách ani tvarech.
- Šablona definuje paletu, písmo a kreslicí funkce pro: pozadí, pavučinu, přechodová vlákna, mouchu, bonusové balíčky (každý obsah zvlášť), hráčova pavouka, nepřátelského pavouka, zpomaleného nepřítele, efekt srážky, HUD a dotykové ovládání.
- Výchozí šablona je **Neon**. Druhá šablona **Čmáranice** (tužka na čtverečkovaném papíře) přijde později jako ukázka přidání šablony.
- Šablona se vybírá v Nastavení. Volba se pamatuje.

## 15. Technické požadavky

- TypeScript, čistý Canvas 2D, žádný herní framework. Sestavení přes Vite.
- Simulace běží s **pevným krokem 1/120 s**, vykreslování přes `requestAnimationFrame`. Výsledek hry nezávisí na snímkové frekvenci.
- Herní logika je deterministická: náhoda se předává jako generátor se semínkem, aby šly testy opakovat.
- Logika (`src/game/`) nesmí používat DOM, Canvas ani časovače prohlížeče. Pokrývají ji unit testy.
- Ostré vykreslení na HiDPI displejích.
- Hra musí plynule běžet na běžném mobilním telefonu (cíl 60 snímků za sekundu).

## 16. Mimo rozsah verze 1

- Hra dvou hráčů, online tabulka výsledků, editor pavučin, nákupy v aplikaci, reklamy.

## 17. Rozhodnutí

Otevřené otázky z verze 0.1 rozhodl uživatel 25. 10. 2026:

1. Bodování: 10 bodů za mouchu a bonus 100 × číslo kola.
2. Po srážce se obnoví celé herní pole.
3. Pokyn ke změně kruhu se zapamatuje jen v posledních 15° před přechodem.
4. Dotykové ovládání jako u přenosných konzolí: na šířku, vpravo touchpad, vlevo plyn.
Další rozhodnutí uživatele:

- Po ručním testování (verze 0.6): základní rychlost pohybu snížena o 40 %, z 0,7 na 0,42 R/s. Nepřátelé, jejichž rychlost je násobkem základní, se zpomalili s ní.
- Po dalším testování (verze 0.7): rychlost snížena o dalších 20 % na 0,336 R/s. Změna kruhu byla těžko trefitelná, proto se zóna pro zapamatování pokynu rozšířila z 15° na 30° a přibyly šipky vlevo a vpravo pro boční vlákna.
