# 2.2 Pohyb pavouků a změna kruhu

## Cíl

Rozhýbat pavouky: hráč leze proti směru hodinových ručiček, nepřátelé po směru, a hráč může na přechodových vláknech přelézt na jiný kruh přesně podle pravidel ze specifikace.

## Zadání

Viz [prompty/2-hra/02-pohyb-pavouku.md](../../prompty/2-hra/02-pohyb-pavouku.md). Nové zadání nebylo (jen potvrzení výkladu specifikace), agent pokračoval podle plánu fáze 2 a podle kapitol 5 a 7 specifikace.

## Co agent udělal

- **Jeden pavouk, jeden kód** (`src/game/spider.ts`). Hráč i nepřátelé používají stejné funkce. Liší se jen směrem (+1 po směru hodinových ručiček, −1 proti), rychlostí a tím, kdo rozhoduje o změně kruhu. AI nepřátel v kapitole 2.4 tak bude jen volat stejné `requestTurn` jako klávesnice hráče.
- **Konstantní rychlost po obvodu.** Úhlová rychlost je rychlost dělená poloměrem kruhu, takže na vnitřním kruhu oběhne pavouk kolo rychleji. Kruhy jsou mezi vlákny mírně prověšené a skutečná dráha je asi o 1 % kratší než kružnice. Agent to v kódu okomentoval a nechal být, rozdíl při hraní nepoznáš.
- **Zóna 15° před vláknem.** `distanceToGate` počítá, kolik zbývá k dalšímu přechodovému vláknu ve směru pohybu. Pokyn se zapamatuje, jen když je vzdálenost do 15°. Opačný pokyn v téže zóně ten první přepíše.
- **Přelézání.** Když pavouk s pokynem dosáhne vlákna, zastaví se přesně na něm a 0,3 s leze po vlákně na sousední kruh. Když hráč během toho pokyn zopakuje, přeleze ještě o jeden kruh, ale jen bez plynu a nejvýš dvakrát na jednom vlákně.
- **Startovní pozice** (`src/game/field.ts`). Hráč na vnějším kruhu dole, nepřátelé na vnitřních kruzích naproti, nejvýš 45° od protějšího bodu. Žádný tak nezačíná blíž než čtvrt obvodu od hráče. Po srážce se celé pole vrátí na start.
- **Klávesnice.** Šipky nahoru a dolů (nebo W a S) mění kruh, mezerník nebo Shift je plyn. Klávesy se rozpoznávají podle fyzické polohy, takže W a S fungují stejně na české i anglické klávesnici. Původně patřilo řízení do kapitoly 2.6, ale bez něj by pohyb nešel vyzkoušet. Kapitola 2.6 tak zůstává pro dotykové ovládání a hru na šířku.
- **Provizorní pavouci.** Zelený hráč a červený nepřítel s osmi nohama a hlavou ve směru pohybu. Skutečný neonový vzhled přijde s šablonami v kapitole 2.5. Dočasný údaj o čase z kapitoly 2.1 zmizel, pohyb pavouků teď ukazuje, že smyčka běží.
- **Ověření v prohlížeči.** Agent v Chromiu spustil kolo, počkal na zónu před pravým vláknem, stiskl šipku dolů, během přelézání S a ověřil, že hráč skončil o dva kruhy níž. S `?debug` je stav hry v konzoli prohlížeče jako `spiderOn`, což test využil.

## Kde se agent spletl

- **Špatný odhad času v testu.** Test „řídit jde jen během kola“ čekal 1,1 s, než stiskne šipku, protože agent odhadl, že tou dobou už bude hráč v zóně před vláknem. Na vnějším kruhu ale čtvrt obvodu trvá 2,1 s a zóna začíná až po 1,7 s. Test selhal, agent čas přepočítal a do testu napsal výpočet jako komentář.
- **Pojistky, které nebyly potřeba.** Agent ze zkušenosti z kapitoly 2.1 přidal dvě pojistky proti zaokrouhlovacím chybám úhlů: toleranci ve výpočtu vzdálenosti k vláknu a zarovnání úhlu na přesnou hodnotu vlákna. Podle poučení z téže kapitoly je zkusmo odebral. Všechny testy prošly i bez nich a prošla i zátěžová zkouška s tisíci přelezení na všech vláknech, v obou směrech a při čtyřech rychlostech. Pojistky tedy odstranil. Místo nich přidal test, který po přelezení na každém vlákně ověří, že pavouk stojí přesně na vlákně a další vlákno je o čtvrt obvodu dál.
- **Nejasná věta ve specifikaci.** „Pokyn zadaný přímo na vlákně se provede hned“ nešlo doslova splnit, protože pavouk mine vlákno za zlomek sekundy. Agent ji vyložil jako pokyn během přelézání (přidá další kruh) a výklad zapsal do specifikace 0.4. Stejně upřesnil, že o limitu jednoho kruhu s plynem rozhoduje plyn ve chvíli opakovaného pokynu.
- **Ukončený vlastní příkaz.** Při restartu testovacího serveru agent spustil `pkill -f "vite preview"`. Vzor ale odpovídal i příkazovému řádku, ze kterého `pkill` sám běžel, a ukončil ho. Agent server spustil znovu na jiném portu.

## Lidská kontrola

- **Výklad specifikace.** Agent požádal o potvrzení upřesnění v kapitole 5 specifikace (verze 0.4). Uživatel potvrdil, že pokyn zadaný během přelézání přidá další kruh.
- **Ohmatat si ovládání.** Po sloučení na `https://prochst.github.io/spider-on/` vyzkoušet, jestli 15° zóna a 0,3 s přelézání působí přirozeně. Obě hodnoty jsou laditelné v `src/game/config.ts`.

## Metriky

- Nové soubory: 5 v `src/` (pavouk, pole, vykreslení pavouků, 2 testy), upravených 6.
- Testy: 59 (26 nových), všechny procházejí.
- Velikost sestavené hry: 11,5 kB JavaScriptu (4,5 kB po kompresi).
- Iterace: jedna oprava testu, jedna úprava specifikace, odebrání dvou zbytečných pojistek.

## Poučení

- Poučení z minulé kapitoly se vyplatí opravdu použít. Zkusmé odebrání pojistek ukázalo, že tentokrát potřeba nebyly, a kód zůstal jednodušší.
- Když se specifikace nedá splnit doslova, ať agent zvolí výklad a hned ho do specifikace zapíše. Jinak bude výklad schovaný jen v kódu.
- Plán kapitol není dogma. Řízení klávesnicí se přesunulo do dřívější kapitoly, protože bez něj nešlo pohyb vyzkoušet.
