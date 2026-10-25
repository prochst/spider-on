# 1.2 Založení projektu

## Cíl

Připravit prázdný repozitář tak, aby každá další změna prošla automatickými testy a po sloučení se sama nasadila na web.

## Zadání

Viz [prompty/1-priprava/02-zalozeni-projektu.md](../../prompty/1-priprava/02-zalozeni-projektu.md). Agent pracoval podle plánu z kapitoly 1.1, nové zadání nedostal.

## Co agent udělal

- **Nástroje**: Vite 8 (vývojový server a build), TypeScript 7 ve striktním režimu, Vitest 5 pro unit testy. Žádný herní framework, jak bylo rozhodnuto v kapitole 1.1.
- **První kus logiky**: `src/game/geometry.ts` počítá tvar pavučiny (poloměry kruhů, body na prověšených segmentech) a `src/game/config.ts` drží laditelné konstanty ze specifikace. Šest unit testů hlídá, že vnitřní a vnější kruh leží na 0,28 R a 0,92 R pro pavučinu se 3 až 5 kruhy, že menší pavučina má širší pruhy, že body na vláknech leží přesně na kruhu a že úhel 90° míří dolů jako na obrazovce. Původní verze počítala jen s 5 kruhy. Když uživatel ve specifikaci 0.2 zavedl rostoucí pavučinu, agent geometrii přepsal, aby počet kruhů dostávala jako parametr.
- **Zástupná obrazovka**: `src/main.ts` vykreslí prázdnou neonovou pavučinu s nápisem SPIDER ON. Skutečná hra přijde ve fázi 2, tady jde jen o to, aby nasazení mělo co ukázat.
- **CI** (`.github/workflows/ci.yml`): u každého pull requestu a pushe do `main` spustí kontrolu typů, testy a build.
- **Nasazení** (`.github/workflows/deploy.yml`): po každém pushi do `main` hru sestaví a nasadí na GitHub Pages. Verze akcí odpovídají příkladu v dokumentaci GitHubu.
- **Ověření**: agent v cloudu spustil `npm run typecheck`, `npm test` a `npm run build`, pak sestavenou hru otevřel v prohlížeči a udělal screenshot.

## Kde se agent spletl

- **Přístup ke GitHubu.** Agent nejdřív nemohl repozitář připojit, protože uživatel neměl GitHub účet propojený s Claude. Agent mezitím připravil všechny soubory lokálně, aby po propojení stačilo je nahrát.
- **Push bez oprávnění.** Ani po připojení repozitáře nemohl agent nahrávat změny, protože v repozitáři nebyla nainstalovaná Claude GitHub App. Čtení fungovalo, zápis ne. Agent zatím přizpůsobil připravené změny úvodnímu commitu s licencí, který mezitím vytvořil uživatel.

## Lidská kontrola

- Uživatel jednorázově přepne v repozitáři Settings → Pages → Source na „GitHub Actions“. Bez toho nasazení selže.
- Uživatel zkontroluje pull request a po sloučení otevře hru na `https://prochst.github.io/spider-on/`.

## Metriky

- Soubory: 14 nových (konfigurace, 4 zdrojové soubory včetně testu, 2 workflow, 2 dokumenty).
- Testy: 6, všechny procházejí.
- Velikost sestavené hry: 2,2 kB JavaScriptu (1,2 kB po kompresi).

## Poučení

- Nastav CI a nasazení hned na začátku. Od teď každá změna agenta projde stejnou kontrolou a výsledek je vidět na webu, ne jen v popisu.
- Odděl laditelné konstanty od logiky od prvního dne. Ve fázi 2 se budou měnit nejčastěji.
