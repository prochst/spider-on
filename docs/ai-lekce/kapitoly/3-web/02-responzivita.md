# 3.2 Responzivita a celá obrazovka

## Cíl

Hra má vypadat dobře na každé obrazovce od malého telefonu po velký monitor. Na telefonu nesmí nic schovat výřez pro kameru a má jít zapnout celá obrazovka.

## Zadání

Viz [prompty/3-web/02-responzivita.md](../../prompty/3-web/02-responzivita.md). Uživatel napsal jen „můžeš pokračovat kapitolou 3.2“. Obsah dal plán fáze 3.

## Co agent udělal

- **Nejdřív snímky, pak úpravy.** Agent hru vyfotil na deseti velikostech: tři telefony na šířku, dva tablety, notebook, Full HD, 2560 × 1440, úzké a nízké okno. Snímky menu, tabulky výsledků a hry složil do přehledů po šesti, aby je viděl najednou. Pavučina, HUD a ovladače už z fáze 2 škálovaly dobře. Jedinou zjevnou chybou bylo menu, které mělo pevnou velikost v `rem` a na monitoru 2560 × 1440 zabíralo malý ostrůvek uprostřed.
- **Menu roste s výškou obrazovky.** Celé menu je v jednotkách `rem`, takže stačí jedna hodnota: `font-size: clamp(16px, 2.2vmin, 32px)` na kořeni stránky. Na telefonu zůstane 16 px, na notebooku 17,6 px, na monitoru 2560 × 1440 32 px. Tlačítko pauzy roste s ním.
- **Bezpečná oblast (safe area).** iPhone na šířku má na jedné straně výřez pro kameru a dole lištu domovské obrazovky. Prohlížeč jejich rozměry dává jen do CSS (`env(safe-area-inset-left)` a další), Canvas o nich neví. Agent proto přidal neviditelný prvek `.layout-probe`, který CSS natáhne přesně na bezpečnou oblast, a `main.ts` z něj přečte rozměry v pixelech. `createView` pak dostane okraje a pavučinu, ovladače i HUD umístí dovnitř. Menu a rohové tlačítko mají stejné okraje přímo v CSS.
- **Okraje přes proměnné CSS.** Hodnoty `env()` jdou přes proměnné `--safe-top`, `--safe-left` a další. Test je pak může přepsat a zahrát si na iPhone s výřezem i v prohlížeči, který žádný výřez nemá.
- **HUD už nehádá místo pro tlačítko.** Šablona Neon měla napevno 80 px vpravo pro tlačítko pauzy. S rostoucím menu by se nápis ŽIVOTY na velkém monitoru dostal pod tlačítko. Šablona teď dostává hotové okraje `view.hud`. `main.ts` je spočítá z bezpečné oblasti a šířky rohového tlačítka, kterou změří ze stejného CSS. Šablona tak dál nic nepočítá sama.
- **Tlačítko pro celou obrazovku** (`src/ui/fullscreen.ts`). Je ve stejném rohu jako pauza, ale ukáže se jen v menu. Pauza je vidět od výzvy ke startu kola po konec kola, takže se tlačítka nikdy nepotkají. Na telefonu hra v celé obrazovce zkusí zamknout orientaci na šířku (umí to Chrome na Androidu). Safari na iPhonu celou obrazovku pro stránky nepovoluje, tam se tlačítko vůbec neukáže. Instalace na plochu v kapitole 3.3 tam pomůže víc. Po kliknutí se fokus vrátí na menu, aby Enter dál spouštěl hru, a ne znovu přepínal celou obrazovku.
- **Specifikace 0.18**: celá obrazovka v kapitole 12, rozsah velikostí a bezpečná oblast v kapitole 15.
- **Testy.** Tři nové unit testy pro `createView` s výřezem. Nový E2E soubor `e2e/layout.spec.ts` běží na počítači i na telefonu: plná tabulka výsledků se vejde bez posouvání, roh ukazuje správné tlačítko, celá obrazovka jde zapnout a vypnout, se simulovaným výřezem zůstane vše v bezpečné oblasti a menu na velkém monitoru naroste. Pro test výřezu `?debug` nově vystaví i aktuální rozložení jako `window.spiderOnView`. Agent ověřil, že test umí selhat: když sondu natáhl přes celou obrazovku, oba testy výřezu zčervenaly.

## Kde se agent spletl

- **Strop velikosti písma.** První verze měla strop 28 px. Na monitoru 2560 × 1440 to podle výpočtu vycházelo, ale na přehledu snímků menu pořád působilo menší než na notebooku. Agent strop zvedl na 32 px, takže menu roste s výškou obrazovky rovnoměrně až do 1440 px.
- **Pokus o rozbití, který nic nerozbil.** Při ověřování, že test umí selhat, agent nejdřív v `main.ts` vynechal předání okrajů. Kontrola typů pak shodila sestavení kvůli nepoužité funkci a testy se vůbec nespustily. Výsledek „nic neprošlo“ nic neříkal. Agent místo toho rozbil CSS sondy a teprve pak viděl selhat právě testy výřezu.
- **Rohové tlačítko a výřez.** Tlačítko pauzy mělo dřív odstup `max(0.75rem, výřez)`, tedy u výřezu se lepilo těsně k jeho okraji. Agent ho změnil na výřez + 0,75rem, aby mělo stejný odstup jako na obrazovce bez výřezu.

## Lidská kontrola

- **Telefon s výřezem v ruce.** Výřez agent jen simuloval přes proměnné CSS. Jak hra sedí na skutečném iPhonu nebo Androidu s výřezem, ukáže jen zařízení.
- **Celá obrazovka na Androidu**, včetně zámku orientace na šířku. Headless prohlížeč umí celou obrazovku zapnout, ale zámek orientace nemá jak ověřit.
- **Velikost menu na monitoru.** Jestli je 32 px na velkém monitoru příjemné, nebo už moc, je otázka vkusu.

## Metriky

- Čas: asi 40 minut od zadání po pull request.
- Nové soubory: `src/ui/fullscreen.ts`, `e2e/layout.spec.ts`, výuková kapitola a zadání. Změněno 10 souborů.
- Testy: 158 unit testů (3 nové), 33 E2E testů a 1 přeskočený (9 nových v obou projektech; test velkého monitoru běží jen na počítači).
- Snímky: 10 velikostí × 3 obrazovky, přehled v projektových souborech `faze-3/3-2-prehled-velikosti.png`.

## Poučení

- Responzivitu kontroluj na přehledu snímků, ne po jednom. Drobné menu na velkém monitoru bylo vidět až vedle snímku z notebooku.
- To, co zná jen CSS (bezpečná oblast, velikost `rem`), předej do Canvasu přes neviditelný prvek. Kód pak nemusí čísla z CSS opisovat.
- Hodnoty prostředí (výřez, velikost obrazovky) veď přes proměnné, které jde v testu přepsat. Jinak se chování pro iPhone otestuje jen na iPhonu.
- Když ověřuješ, že test umí selhat, zkontroluj, že selhal test, ne sestavení.
