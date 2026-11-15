# 2.3 Mouchy, srážky, životy, bodování a postup plochami

## Cíl

Udělat z pohybu hru: sbírat mouchy za body, přijít o život při srážce, dokončit kolo a postupovat na větší pavučiny s více nepřáteli.

## Zadání

Viz [prompty/2-hra/03-mouchy-a-bodovani.md](../../prompty/2-hra/03-mouchy-a-bodovani.md). Nové zadání nebylo, agent pokračoval podle plánu fáze 2 a podle kapitol 3, 6, 8 a 9 specifikace.

## Co agent udělal

- **Postup plochami** (`src/game/progression.ts`). Tři malé funkce převádějí tabulky ze specifikace na kód: číslo kola určí počet kruhů a stupeň obtížnosti, stupeň určí počet a rychlost nepřátel. Testy porovnávají výsledky přímo s tabulkami, třeba že kola 1 až 12 mají stupně 1, 2, 3, 3, 4, 5, 6, 7, 8, 5, 6, 7. Tabulku nepřátel agent zařadil sem, i když plán ji měl u AI v kapitole 2.4: patří k postupu hrou a AI je jen chování.
- **Mouchy** (`src/game/flies.ts`). Na každém kruhu 12 much uprostřed mezi vlákny. Hráč mouchu sebere, když je na stejném kruhu a blíž než 0,06 rad. Během přelézání nesbírá nic.
- **Srážky** (`playerHitsEnemy` v `src/game/field.ts`). Porovnává vzdálenost středů pavouků s 0,075 R, takže funguje i během přelézání po vlákně.
- **Body a životy** (`src/game/scoring.ts`). 10 bodů za mouchu, 100 × číslo kola za dokončené kolo. Život navíc při 5 000 bodech a pak každých 10 000, nejvýš 5. Když velký bonus přeskočí víc hranic najednou, započítají se všechny.
- **Herní krok** (`src/game/game.ts`). V každém kroku se pohnou pavouci, sesbírají mouchy, zkontroluje konec kola a pak srážka. Po srážce se pole obnoví i s mouchami, body zůstávají.
- **Kontroly „mezi kroky“.** Agent u sbírání i srážek spočítal, jestli rychlý pavouk nemůže mouchu nebo nepřítele „přeskočit“ mezi dvěma kroky. Nemůže: i s plynem na vnitřním kruhu urazí za krok 0,035 rad, sběrné okno je široké 0,12 rad. Výpočet je v komentářích a hlídá ho test, který na plný plyn oběhne vnitřní kruh a ověří, že nezůstala žádná moucha. Kdyby někdo v `config.ts` zvedl rychlost nebo zmenšil práh, test se ozve.
- **Obrazovka Kolo dokončeno** ukazuje body za mouchy, bonus, celkové skóre a před koly 4 a 10 upozornění „Pavučina se rozrůstá o další kruh!“. Konec hry ukazuje i dosažené kolo.
- **Provizorní mouchy** jako žluté tečky s křidélky a efekt srážky na místě hráče. Neonový vzhled přijde v kapitole 2.5.
- **Ladicí zkratka C** teď sní všechny mouchy, takže kolo skončí stejnou cestou jako ve hře, včetně bonusu.

## Kde se agent spletl

- **Událost „kolo dokončeno“ jako příkaz hráče.** V kapitole 2.1 mohl kolo ukončit kdokoli, kdo poslal událost `roundCleared`. Pro ladicí zkratku to stačilo, ale teď o konci kola rozhoduje simulace a musí přidat bonus. Agent událost vyřadil z příkazů hráče a TypeScript hned ukázal obě místa, kde se ještě posílala (ladicí klávesa a jeden test). Typy tak udělaly kontrolu, kterou by jinak musel dělat člověk.
- **Srážka, která v prohlížeči nenastala.** Při zkoušce v prohlížeči agent 12 sekund čekal na srážku a žádná nepřišla. Nepřítel bez AI zůstává na vnitřním kruhu a hráč začíná na vnějším, takže se nepotkají, dokud hráč sám nezajede dovnitř. Do kapitoly 2.4 je tedy první kolo bez řízení nevyhratelné a zároveň neprohratelné. Agent v testu přesunul nepřítele na hráčův kruh přes ladicí přístup `spiderOn` v konzoli a srážku tak ověřil.
- **Chyba ve specifikaci.** Specifikace odkazovala u obrazovky Kolo dokončeno na kapitolu 11 (ovládání), správně je 12 (obrazovky). Agent to opravil ve verzi 0.5.

## Lidská kontrola

- **Dvě doplnění specifikace (verze 0.5).** Když hráč sebere poslední mouchu ve stejném kroku, kdy se srazí, kolo je dokončené. Body získané před srážkou zůstávají. Obojí specifikace dosud neřešila, agent zvolil hráči příznivější variantu a nechává ji uživateli k potvrzení.
- **Obtížnost se dá vyzkoušet až s AI.** Bez AI z kapitoly 2.4 nepřátelé nemění kruh, takže tempo hry zatím nejde posoudit.

## Metriky

- Nové soubory: 7 v `src/` (postup, mouchy, body, vykreslení much, 3 testy), upravených 9.
- Testy: 81 (22 nových), všechny procházejí.
- Velikost sestavené hry: 13,6 kB JavaScriptu (5,3 kB po kompresi).
- Iterace: testy prošly napoprvé. Úprava typů událostí a jedna oprava ve specifikaci.

## Poučení

- Převáděj tabulky ze specifikace na kód s testem, který tabulku opisuje. Kontrola je pak triviální: stačí porovnat dva řádky čísel.
- U herní fyziky v krocích si nech od agenta spočítat, jestli rychlý objekt nemůže jiný „přeskočit“. Výpočet do komentáře a hraniční případ do testu.
- Úzké typy jsou levná kontrola. Když se změní, kdo smí co udělat, kompilátor najde všechna místa, která se musí upravit.
