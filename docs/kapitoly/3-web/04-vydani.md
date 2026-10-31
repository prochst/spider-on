# 3.4 Vydání webové verze

## Cíl

Dotáhnout webovou verzi tak, aby šla bez obav sdílet. Na web se dostane jen build, na kterém prošly všechny testy. Odkaz v chatu ukáže pěkný náhled. Audit prohlížeče nenajde nic podstatného.

## Zadání

Viz [prompty/3-web/04-vydani.md](../../prompty/3-web/04-vydani.md). Obsah dal plán fáze 3, uživatel napsal jen „Pokračuj kapitolou 3.4“.

## Co agent udělal

- **Nasazení až po zelených testech.** Hra se od fáze 1 nasazovala na GitHub Pages po každém sloučení. Nasazení ale spouštělo jen unit testy, E2E testy běžely vedle v jiném workflow a na výsledek nikdo nečekal. Rozbité menu nebo hra, která nejde offline, by tak mohly dorazit k hráčům. Teď `ci.yml` jde zavolat z jiného workflow (`workflow_call`) a `deploy.yml` ho spouští jako první krok. Build a nasazení čekají, až projdou typy, unit testy, build i E2E testy. Spuštění na `main` z `ci.yml` agent odebral, jinak by stejné testy běžely dvakrát. Oprávnění k zápisu na Pages má jen úloha, která nasazuje.
- **Popis stránky a náhled odkazu.** `index.html` má popis pro vyhledávače a značky Open Graph. Podle nich Messenger, WhatsApp, Slack nebo Facebook ukážou název, popis a obrázek. Adresy v nich musí být absolutní, proto míří na `https://prochst.github.io/spider-on/`.
- **Obrázek pro náhled ze skutečné hry.** Skript `scripts/share-image.mjs` sestaví hru a spustí ji s pevným semínkem. Po 2,5 s hraní zastaví vykreslování a po stranách pavučiny dopíše název a podtitul. Výsledek uloží jako `public/share.png` v rozměru 1200 × 630, který berou všechny služby. Obrázek nepatří do offline mezipaměti, protože ho hra sama nikdy nepotřebuje. Proto v `PUBLIC_FILES` záměrně chybí a `vite.config.ts` to vysvětluje.
- **Audit Lighthouse.** Agent spustil Lighthouse 13.6 proti produkčnímu buildu na mobilu i na počítači. Nástroj nainstaloval jen dočasně mimo projekt, takže hra nemá novou závislost. Našly se dvě věci:
  - chyběl popis stránky (SEO 90),
  - stránka neměla hlavní oblast (`<main>`), podle které se čtečka obrazovky dostane k obsahu (přístupnost 98 na počítači).

  Kontejner menu je teď `<main id="ui">`. Menu je ta část hry, kterou čtečka umí použít.
- **Výsledek auditu:**

  | | Výkon | Přístupnost | Doporučené postupy | SEO |
  | --- | --- | --- | --- | --- |
  | Mobil před | 91 | 100 | 100 | 90 |
  | Mobil po | 99–100 | 100 | 100 | 100 |
  | Počítač před | 100 | 98 | 100 | 90 |
  | Počítač po | 100 | 100 | 100 | 100 |

  Celá hra má při prvním načtení 56 kB včetně písma. První obsah je na simulovaném mobilu vidět za 0,8 s.
- **Testy.** Nový `e2e/share.spec.ts` ověřuje popis, značky náhledu a hlavní oblast s menu. Kontroluje i to, že obrázek z `og:image` v buildu opravdu existuje, je to PNG a má 1200 × 630 px. Agent ověřil, že test umí selhat: bez `share.png` zčervenal.
- **Odkaz na hru v README** a verze 0.3.4. Specifikace 0.20 popisuje vydání v kapitole 15: adresu hry, zveřejnění jen po zelených testech a náhled odkazu.

## Kde se agent spletl

- **Výkon 91 nebyl problém hry.** První mobilní audit ukázal výkon 91 a „blokování hlavního vlákna“ 390 ms. Agent začal hledat, co hra při startu dělá pomalu. Profil ukázal, že čas jde na kreslení Canvasu, ne na JavaScript, a že snímek trvá i při čtyřnásobně zpomaleném procesoru medián 16,7 ms, tedy 60 snímků za sekundu. Tři další audity bez jediné změny ve výkonu daly 100, 100 a 100 s blokováním 0–10 ms. První číslo byl šum: Lighthouse jen simuluje pomalý telefon a jeden běh nestačí. Hra navíc kreslí neustále, a to nástroj stavěný na běžné stránky chápe jako práci, která blokuje.
- **Chybný test popisu.** První verze testu chtěla v popisu „aspoň 20 znaků bez mezery za sebou“ místo „aspoň 20 znaků“ a na správném popisu selhala. Chyba byla v regulárním výrazu testu, test teď kontroluje délku.
- **Písmo v obrázku pro náhled.** Podtitul v obrázku vypadal jinak než menu a agent podezříval, že se nenačetlo písmo. Doplnil čekání na konkrétní řez písma a výpis vypočteného stylu. Písmo bylo celou dobu správné, jen ho poznal špatně z obrázku. Čekání v skriptu zůstalo, protože řez 500 se jinde v menu načítá až podle potřeby.
- **Kontrola workflow.** Agent chtěl workflow ověřit nástrojem `actionlint` staženým z GitHubu. Bezpečnostní pravidla prostředí stažení a spuštění cizího programu nepovolila. Zbyla kontrola, že YAML jde načíst. Jestli nasazení s voláním `ci.yml` opravdu funguje, ukáže teprve první běh na `main` po sloučení.
- **Adresu živé hry nešlo otevřít.** Síťová pravidla cloudového prostředí agenta nepouštějí na `github.io`, takže audit běžel proti stejnému buildu na místním serveru, ne proti živé stránce. Výsledek se může mírně lišit, hlavně v rychlosti sítě.

## Lidská kontrola

- **První nasazení po sloučení.** V záložce Actions má workflow „Deploy to GitHub Pages“ teď tři úlohy: `checks` (s vnořenými `check` a `e2e`), `build` a `deploy`. Nasazení začne až po zelených testech.
- **Náhled odkazu.** Poslat si odkaz na hru do chatu (Messenger, WhatsApp, Slack) a podívat se, jestli ukáže obrázek a popis. Služby si náhled pamatují, takže starší sdílení se nemusí změnit hned.
- **Nabídka nové verze.** Toto je první sloučení od kapitoly 3.3. Nainstalovaná hra by po něm měla na úvodní obrazovce nabídnout „Je dostupná nová verze“ a po klepnutí ukázat verzi 0.3.4.
- **Audit na živé adrese.** V Chromu na počítači: Nástroje pro vývojáře → Lighthouse → Analyze page load.

## Metriky

- Čas: asi 40 minut od zadání po pull request.
- Nové soubory: `scripts/share-image.mjs`, `public/share.png` (300 kB), `e2e/share.spec.ts`, výuková kapitola a zadání. Změněno 10 souborů.
- Testy: 158 unit testů beze změny, 41 E2E testů a 1 přeskočený (2 nové, běží na počítači).
- Lighthouse: 4 audity před změnou a 5 po ní (z toho 3 opakování mobilního výkonu kvůli šumu).

## Poučení

- Nasazení má čekat na všechny testy, ne jen na ty rychlé. Pomalejší E2E testy jsou právě ty, které hlídají, co hráč uvidí.
- Jedno číslo z Lighthouse neber vážně. Opakuj audit a podívej se, kam čas opravdu jde, než začneš optimalizovat.
- Obrázek pro náhled odkazu vyrob ze skutečné hry skriptem. Po změně vzhledu stačí skript pustit znovu.

## Shrnutí fáze 3

Fáze 3 trvala od 26. do 31. 10. 2026 a měla čtyři kapitoly podle plánu. Navíc přibyly dvě úpravy z ručního testování, které patří do fáze 2 (kapitola 2.8).

| Kapitola | Pull request | Co přinesla |
| --- | --- | --- |
| [3.1 E2E testy](01-e2e-testy.md) | #18 | Playwright proti produkčnímu buildu, počítač i telefon s dotykem |
| [2.8 Úroveň obtížnosti](../2-hra/08-uroven-obtiznosti.md) | #19, #20 | Volba obtížnosti v menu, rozbalený seznam v barvách šablony |
| [3.2 Responzivita](02-responzivita.md) | #21 | Celá obrazovka, menu podle velikosti obrazovky, bezpečná oblast |
| [3.3 PWA](03-pwa.md) | #22 | Instalace na plochu, hra offline, číslo verze, nabídka nové verze |
| 3.4 Vydání | tento | Nasazení po zelených testech, náhled odkazu, Lighthouse |

Na konci fáze má hra 158 unit testů a 41 E2E testů na dvou velikostech obrazovky. Pokrývají start, klávesnici, dotyk, ukládání, obtížnost, rozložení, offline a náhled odkazu. Webová verze má v auditu Lighthouse plný počet bodů ve všech kategoriích.

Co se ve fázi 3 osvědčilo:

- **E2E testy jako první kapitola.** Běžely u každého dalšího pull requestu a nové funkce k nim rovnou přidávaly vlastní testy: klávesy v rozbalovacím seznamu, výřez displeje, hru offline, náhled odkazu.
- **Testy, které umí selhat.** V každé kapitole agent hru schválně rozbil a ověřil, že test zčervená. V kapitole 3.2 se tak ukázalo, že první „rozbití“ shodilo jen sestavení a test vůbec neběžel.
- **Ruční test po každém sloučení.** Bílý rozbalený seznam, drobné menu na velkém monitoru ani pocit z ovládání na telefonu žádný automatický test nenašel.

Co bylo těžší, než se čekalo:

- **Dotyk v testech.** Playwright umí jen klepnout. Tah a dva prsty najednou bylo potřeba posílat přes protokol DevTools, a ten má vlastní pravidla.
- **Prohlížeč jako černá skříňka.** Hlavička `Vary: Origin`, rozbalovací seznam, který šablonu neposlouchá, nebo aktualizace service workeru mimo dosah testů. Všechno to bylo vidět až ve skutečném prohlížeči.

Další fáze: 4. Android a Google Play, hra zabalená přes Capacitor.
