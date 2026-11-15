# 3.1 E2E testy

## Cíl

Ověřovat hru automaticky v opravdovém prohlížeči, na počítači i na telefonu, aby další kapitoly fáze 3 nerozbily nic, co už funguje.

## Zadání

Viz [prompty/3-web/01-e2e-testy.md](../../prompty/3-web/01-e2e-testy.md). Uživatel napsal „Zvuk je OK. Pokračuj.“ a pak schválil plán fáze 3, který agent navrhl podle úvodu materiálu.

## Co agent udělal

- **Plán fáze 3.** Nasazení na GitHub Pages běží od fáze 1 a dotyk na šířku vznikl v kapitole 2.6, proto agent fázi přeskládal: E2E testy jako první kapitola, aby hlídaly všechny další (responzivita a celá obrazovka, PWA, vydání). Novou závislost `@playwright/test` nechal schválit, jak žádá `CLAUDE.md`.
- **Playwright proti produkčnímu buildu** (`playwright.config.ts`). Testy si samy spustí `npm run build` a `vite preview` a hrají hru na adrese `/spider-on/`, stejně jako ji servíruje GitHub Pages. Dva projekty: `desktop` (1280×800, klávesnice a myš) a `phone` (844×390 s dotykem, rozměr z kapitoly 2.6). Verze je zamčená na 1.63.0, protože právě k ní patří prohlížeč předinstalovaný v cloudovém prostředí agenta.
- **Stav hry místo pixelů.** S `?debug` hra vystaví svůj stav jako `window.spiderOn` (od kapitoly 2.4). Testy tak čtou, na které obrazovce hra je, jestli je držený plyn nebo kde je pavouk, místo hádání z obrázku. `&seed=1` zajistí, že každý běh hraje stejnou pavučinu. Pomocné funkce jsou v `e2e/helpers.ts`.
- **Skutečný dotyk.** `page.touchscreen` v Playwrightu umí jen klepnout. Hra potřebuje prst, který zůstane dole a táhne, a dva prsty najednou. `e2e/touch.ts` proto posílá dotykové události přes protokol DevTools (`Input.dispatchTouchEvent`), stejně jako ruční ověření v kapitole 2.6.
- **19 testů v pěti souborech:**
  - `start.spec.ts` (obě velikosti): hra se načte bez chyb v konzoli, úvod má tlačítka a fokus na Hrát, Canvas opravdu kreslí (počet barev v mřížce pixelů) a hra nic nestahuje z internetu.
  - `keyboard.spec.ts`: Enter spustí hru a kolo, plyn drží mezerník i Shift, pavouk se hýbe, Escape a menu pauzy, pauza při ztrátě fokusu okna, dokončené kolo s bonusem 100 vede do kola 2.
  - `storage.spec.ts`: nastavení přežije obnovení stránky, dohraná hra se zapíše na 1. místo a úvod pak ukáže nejlepší skóre.
  - `touch.spec.ts` (telefon): zobrazí se dotykové ovládání, klepnutí vpravo spustí kolo a vlevo ne, plyn a tah fungují současně, na výšku hra vyzve k otočení a pozastaví se.
- **Testy, které umí selhat.** Agent schválně rozbil dvě místa ve hře: prohodil polovinu pro plyn a touchpad a vypnul pauzu při ztrátě fokusu. Pokaždé selhaly právě testy, které to měly chytit (4, respektive 1). Celou sadu pustil třikrát po sobě, aby vyloučil náhodné selhání.
- **CI.** Workflow `ci.yml` má druhou úlohu `e2e`, která běží po rychlých kontrolách, nainstaluje Chromium a spustí `npm run e2e`. Když něco selže, uloží zprávu se snímkem obrazovky a záznamem průběhu (trace) jako artefakt na 7 dní.

## Kde se agent spletl

- **Tah nahoru na startu.** První verze testu tahu předpokládala, že pavouk začíná na přechodovém vlákně a tah nahoru ho pošle dovnitř. Pavouk sice začíná dole na vlákně, ale odlézá od něj k pravému vláknu, a pokyn se pamatuje jen 30° před přechodem (specifikace, kapitola 5). Agent pravidlo nečetl, jen si ho pamatoval špatně. Test teď počká, až se pavouk k pravému vláknu přiblíží, a táhne doleva, ke středu.
- **Chyba v testu, ne ve hře.** Další běh hlásil, že po tahu na touchpadu se pustí plyn, i když palec na levé straně zůstal dole. Vypadalo to jako chyba hry. Agent ale nejdřív prověřil vlastní pomocný kód: v protokolu DevTools musí událost `touchEnd` mít prázdný seznam prstů a zvedá tedy všechny. Zvednutí jednoho prstu, zatímco druhý drží, se posílá jako pohyb se zbylými prsty. Po opravě pomocníka hra prošla beze změny.
- **Stará kopie `main`.** Na začátku agent založil větev z lokální kopie `origin/main`, která byla několik kapitol pozadu, a v `main.ts` našel zástupný kód z fáze 1. Pomohlo stáhnout aktuální `main` (`git fetch`) a větev založit znovu.

## Lidská kontrola

- **Seznam testů proti specifikaci.** Názvy testů se čtou jako věty. Člověk projde, jestli pokrývají to, na čem mu záleží, a co chybí.
- **Zelené CI v pull requestu.** Úloha `e2e` musí projít i na serveru GitHubu, ne jen v prostředí agenta.
- **Ruční test zůstává.** E2E testy ověří, že gesta a klávesy dojdou do hry. Jestli se hra dobře hraje, pořád pozná jen člověk.

## Metriky

- Čas: asi 20 minut od schválení plánu po pull request.
- Nové soubory: 6 (konfigurace, 5 souborů v `e2e/`), změněno 5 (CI, `package.json`, `tsconfig.json`, `.gitignore`, `CLAUDE.md`).
- Testy: 148 unit testů beze změny, 19 nových E2E testů. Celá E2E sada běží asi 20 sekund včetně sestavení hry.
- Iterace: dvě opravy testu tahu (pravidlo zóny, zvedání prstů v protokolu), kód hry beze změny.

## Poučení

- E2E testy pořiď dřív než změny, které mají hlídat. Responzivita a PWA sahají na rozložení a načítání, tedy přesně na to, co unit testy logiky nevidí.
- Hra s ladicím režimem, který vystaví stav, se testuje mnohem snáz. Test se zeptá „je hra pozastavená?“ místo porovnávání snímků.
- Když E2E test hlásí chybu, prověř nejdřív test. Simulovaný dotyk, časování a čekání jsou v testu častější zdroj chyb než hra, která už prošla ručním testem.
- Ověř, že test umí selhat. Schválně rozbitá hra, na kterou testy nezareagují, prozradí test, který nic nekontroluje.
