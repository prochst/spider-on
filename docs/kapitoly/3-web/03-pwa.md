# 3.3 PWA: instalace a hra offline

## Cíl

Z webové hry udělat aplikaci, kterou jde nainstalovat na plochu a hrát bez internetu. Hra navíc ukáže číslo verze a sama nabídne novou verzi.

## Zadání

Viz [prompty/3-web/03-pwa.md](../../prompty/3-web/03-pwa.md). Obsah dal plán fáze 3, uživatel napsal jen „Pokračuj kapitolou 3.3“.

## Co agent udělal

- **Specifikace 0.19.** Kapitola 15 dostala oddíl Instalace a offline: co se nainstaluje, jak vypadá ikona, jaký tvar má číslo verze a kdy se ukáže nabídka nové verze. Číslo verze je i v popisu úvodní obrazovky.
- **Vlastní ikona.** Agent ikonu nakreslil jako SVG (`public/icons/icon.svg`): neonová pavučina se dvanácti vlákny, růžová přechodová vlákna a hráčův pavouk na vnějším kruhu. Vše je uvnitř středních 80 %, takže ikonu neořízne ani kulatá maska Androidu. PNG velikosti pro Android, počítač a iPhone vykresluje skript `scripts/icons.mjs` přes Playwright. PNG jsou v repozitáři, takže build prohlížeč nepotřebuje. Pavouk byl v první verzi malý a v rozlišení 192 px splýval do skvrny, proto ho agent zvětšil 1,5×.
- **Manifest** (`public/manifest.webmanifest`): název, ikony, tmavé barvy, spuštění na celou obrazovku a na šířku. Cesty jsou relativní, takže fungují i na adrese `/spider-on/`. Pro iPhone jsou v `index.html` navíc `apple-touch-icon` a značky `mobile-web-app-capable`.
- **Service worker bez pluginu** (`src/worker/sw.ts`, asi 60 řádků). Při instalaci uloží do mezipaměti všechny soubory jedné verze hry. Pak je servíruje z mezipaměti, každou adresu stránky (i s `?debug`) obslouží uloženou `index.html` a staré mezipaměti po aktualizaci smaže. Nová verze se nepřepne sama (žádné `skipWaiting` při instalaci), čeká, až ji hráč přijme. Hra tak nikdy nevymění soubory uprostřed kola.
- **Seznam souborů dodá build.** Soubory mají v názvu otisk obsahu (`main-AghNvgao.js`), takže je nejde vypsat ručně. Malý plugin ve `vite.config.ts` po sestavení vezme seznam všech souborů a vloží ho na začátek `sw.js`. K souborům ze složky `public/`, které Vite nebalí, přidá pevný seznam `PUBLIC_FILES`. Z celého seznamu spočítá krátký otisk pro název mezipaměti. Každá změna hry tak změní `sw.js` a prohlížeč ho pozná jako novou verzi.
- **Dva světy typů.** Service worker běží mimo stránku a má jiné globální objekty (`self`, `caches`, `clients`) než stránka (`window`, `document`). TypeScript neumí obojí v jednom projektu, proto má `src/worker/` vlastní `tsconfig.json` s typy WebWorker a `npm run typecheck` kontroluje oba projekty.
- **Číslo verze** na úvodní obrazovce: „verze 0.3.3 · a1b2c3d“. Verze aplikace v `package.json` teď sleduje kapitoly (fáze 3, kapitola 3). Otisk commitu dodá GitHub Actions přes proměnnou `GITHUB_SHA`, místní build ukáže „local“. Hodnotu do kódu vloží `define` ve `vite.config.ts`.
- **Nabídka nové verze** (`src/pwa/serviceWorker.ts`). Když prohlížeč stáhne nový `sw.js` a ten se nainstaluje, úvodní obrazovka ukáže pod číslem verze „Je dostupná nová verze.“ a tlačítko Aktualizovat. Tlačítko pošle čekající verzi zprávu `skipWaiting` a po převzetí stránku znovu načte. První návštěva stránku nenačítá znovu. Nainstalovaná hra může běžet dny, proto hledá novou verzi i při každém návratu do popředí.
- **Testy.** Nový `e2e/pwa.spec.ts` na počítači i telefonu ověřuje manifest a načtení všech ikon, číslo verze a hru offline. Test offline nejdřív počká, až service worker převezme stránku, pak vypne síť, obnoví stránku a spustí kolo. Agent ověřil, že test umí selhat: bez obsluhy požadavků v service workeru zčervenal na obou zařízeních.
- **Aktualizace skriptem.** Nabídku nové verze E2E testy neověří, protože potřebuje dva různé buildy na stejné adrese. Skript `scripts/check-update.mjs` proto hru sestaví, spustí a otevře v prohlížeči. Pak ji sestaví znovu s jiným commitem, počká na nabídku, klikne na Aktualizovat a zkontroluje, že úvodní obrazovka ukazuje nový commit.

## Kde se agent spletl

- **Hra offline nenaběhla.** Při prvním pokusu se offline načetla `index.html`, ale skript a styly ne, i když v mezipaměti byly. Vite přidává ke skriptům atribut `crossorigin` a prohlížeč je pak žádá s hlavičkou `Origin`. Server odpovídá s `Vary: Origin`, takže uložená kopie, stažená bez této hlavičky, podle pravidel mezipaměti „nesedí“. Pomohlo hledat v mezipaměti s `ignoreVary: true`. Agent na to přišel výpisem neúspěšných požadavků a obsahu mezipaměti.
- **Seznam souborů bez `index.html`.** Plugin běžel dřív, než Vite do buildu přidal `index.html`, a ta v seznamu chyběla. Hra by offline nenaběhla vůbec. Opravilo to `enforce: "post"`. Agent si toho všiml ve výpisu `sw.js`, ještě než spustil test.
- **Lišta přes menu.** První nabídka nové verze byla lišta u spodního okraje. Na telefonu na šířku zakryla spodek menu. Agent ji přesunul do úvodní obrazovky pod číslo verze. Tam nepřekáží a nikdy neruší hru. Při překreslení jiného menu by se navíc ztratilo rozepsané jméno v Nastavení, proto nabídka čeká na návrat na úvodní obrazovku.
- **Test aktualizace přes podvržený `sw.js` nefungoval.** Agent zkusil v E2E testu podstrčit upravený `sw.js` přes `context.route`. Prohlížeč ale skript service workeru při kontrole aktualizace stahuje mimo dosah Playwrightu, takže nová verze nikdy nepřišla. Místo testu, který by nic neověřil, vznikl skript se dvěma skutečnými buildy.

## Lidská kontrola

- **Instalace na skutečném telefonu.** Na Androidu nabídka „Nainstalovat aplikaci“ v Chromu, na iPhonu Sdílet → Přidat na plochu. Ikona, spuštění na celou obrazovku a na šířku se dají ověřit jen v ruce.
- **Hra v režimu letadlo** po první návštěvě.
- **Nabídka nové verze po dalším sloučení.** Až se nasadí další pull request, nainstalovaná hra by měla nabídnout aktualizaci. Na první skutečné ověření je tedy potřeba ještě jedna kapitola.
- **Jestli se ikona líbí.** Je to první návrh a dá se snadno překreslit: stačí upravit SVG a spustit `node scripts/icons.mjs`.

## Metriky

- Čas: asi 45 minut od zadání po pull request.
- Nové soubory: service worker a jeho `tsconfig.json`, registrace na straně stránky, manifest, ikona (SVG a 3 PNG), dva skripty, E2E soubor, výuková kapitola a zadání.
- Testy: 158 unit testů beze změny, 39 E2E testů a 1 přeskočený (6 nových).
- Velikost: `sw.js` 1,2 kB. Do zařízení se uloží asi 300 kB (hra, písmo, ikony).

## Poučení

- Service worker se dá napsat ručně na pár desítek řádků. Těžká část není kód, ale seznam souborů, a ten patří do buildu, ne do ruky.
- Mezipaměť prohlížeče má pravidla, která v běžném provozu nevidíš (`Vary`). Když offline něco chybí, vypiš si, co v mezipaměti je a které požadavky selhaly.
- Nová verze nemá hráči přepnout hru pod rukama. Ať počká, až ji přijme.
- Co nejde otestovat v jednom běhu (dva buildy na jedné adrese), ověř skriptem, který jde spustit znovu. Podvržený test, který nic neověří, je horší než žádný.
