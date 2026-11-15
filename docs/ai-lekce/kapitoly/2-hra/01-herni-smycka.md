# 2.1 Herní smyčka a stavy obrazovek

## Cíl

Postavit kostru, do které se budou vkládat další kapitoly: herní smyčku s pevným krokem a přechody mezi obrazovkami od úvodu přes hru a pauzu po konec hry.

## Zadání

Viz [prompty/2-hra/01-herni-smycka.md](../../prompty/2-hra/01-herni-smycka.md). Samotné zadání bylo krátké („spusť fázi 2“). Agent pracoval podle plánu kapitol, který na konci fáze 1 navrhl a uživatel odsouhlasil, a podle specifikace (kapitoly 6, 8, 11, 12 a 15).

## Co agent udělal

Agent si nejdřív přečetl `CLAUDE.md`, specifikaci a kapitoly fáze 1. Práci pak rozdělil podle pravidla z `CLAUDE.md`: co jde napsat bez prohlížeče, patří do `src/game/` a má testy.

- **Pevný krok** (`src/game/fixedStep.ts`). Funkce `planSteps` dostane čas od minulého snímku a vrátí, kolik kroků po 1/120 s má simulace udělat. Zbytek si smyčka nechá na další snímek. Testy ověřují, že za sekundu proběhne přesně 120 kroků při 30, 60, 120 i 144 snímcích za sekundu a že po dlouhém zaseknutí (karta na pozadí) se hra nesnaží dohnat desítky sekund najednou.
- **Obrazovky jako stavový automat** (`src/game/screens.ts`). Každá obrazovka ze specifikace je hodnota, například `{ name: "paused", resume: … }`, a jediná funkce `transition(obrazovka, událost)` vrací další obrazovku. Událost, která na obrazovce nedává smysl (pauza v úvodním menu), vrátí stejný objekt, takže se dá snadno poznat, že se nic nestalo. Pauza si pamatuje, kam se vrátit (čekání na start, běžící kolo, nebo animace srážky), a Nastavení si pamatuje, jestli se otevřelo z úvodu, nebo z pauzy.
- **Stav hry** (`src/game/game.ts`). Spojuje obrazovku se stavem rozehrané hry: číslo kola, životy, skóre a odehraný čas. Srážka ubere život a po animaci 1,1 s se hra buď vrátí k čekání na hráče, nebo skončí. Odehraný čas běží jen při hře, v pauze stojí.
- **Smyčka v prohlížeči** (`src/main.ts`). `requestAnimationFrame` změří čas snímku, `planSteps` ho rozdělí na kroky a pak se vykreslí jeden snímek. Hra se sama pozastaví, když okno ztratí fokus nebo se karta schová.
- **Menu jako HTML nad Canvasem** (`src/ui/`). Tlačítka menu nejsou kreslená do Canvasu, ale jsou to obyčejná HTML tlačítka v překryvné vrstvě. Prohlížeč pro ně zdarma řeší fokus, ovládání klávesnicí, dotyk i čtečky obrazovky. Canvas zůstává hře a HUD.
- **Klávesy** (`src/input/keyboard.ts`). Enter a mezerník potvrdí hlavní volbu obrazovky, P a Esc pozastaví hru nebo vrátí z menu zpět. Řízení pavouka přijde v kapitole 2.6.
- **Ladicí zkratky.** Mouchy ani nepřátelé zatím neexistují, takže obrazovky Kolo dokončeno a Konec hry nejdou ve hře normálně vyvolat. S `?debug` v adrese klávesa K nasimuluje srážku a C dokončí kolo.
- **Ověření v prohlížeči.** Agent hru sestavil, spustil v prohlížeči Chromium přes Playwright a prošel všechny přechody klávesnicí i klikáním. U každé obrazovky udělal screenshot.

## Kde se agent spletl

- **Animace srážky o krok delší.** První verze odečítala od 1,1 s kroky po 1/120 s, dokud čas nebyl nulový. Číslo 1,1 ale v počítači není přesně 132 × 1/120, takže po 132 krocích zbyla nepatrná kladná hodnota a animace běžela o krok déle. Chybu odhalily tři testy hned při prvním spuštění. Oprava: tolerance 10⁻⁹ s a komentář, proč tam je.
- **Stejná past u pevného kroku.** Tady na ni agent myslel předem a toleranci přidal hned. Aby ověřil, že není zbytečná, zkusmo ji odstranil: test „120 kroků za sekundu“ pak při 30 nebo 144 snímcích za sekundu selhal. Tolerance tedy zůstala.
- **Enter v Nastavení.** Agent nejdřív namapoval Enter v Nastavení na „Zpět“. Pak si uvědomil, že v kapitole 2.7 tam bude textové pole pro jméno, kde by Enter obrazovku nečekaně zavřel. Zkratka Enter teď v Nastavení nic nedělá (Enter zmáčkne jen tlačítko, které má právě fokus) a zpět vede Esc.

## Lidská kontrola

- **Rozhodnutí k potvrzení: menu v HTML.** Specifikace říká, jak mají obrazovky vypadat, ale ne čím se kreslí. Agent zvolil HTML tlačítka místo kreslení do Canvasu a do `CLAUDE.md` přidal složku `src/ui/`. Pokud by uživatel chtěl mít všechno v Canvasu, je teď nejlevnější chvíle to změnit.
- **Doplnění specifikace.** Agent do kapitoly 11 doplnil, co dělají Enter a Esc v menu (specifikace 0.3). Pravidla hry se nezměnila.
- Uživatel si po sloučení může na `https://prochst.github.io/spider-on/?debug` proklikat všechny obrazovky. Čas ve spodní části obrazovky je dočasný a slouží jen ke kontrole, že se v pauze zastaví.

## Metriky

- Nové soubory: 12 v `src/` (z toho 3 testy), přepsaný `main.ts`, doplněné `config.ts` a `index.html`.
- Testy: 33 (27 nových), všechny procházejí.
- Velikost sestavené hry: 8,7 kB JavaScriptu a 1 kB CSS (3,4 kB a 0,5 kB po kompresi).
- Iterace: jedna oprava po prvním spuštění testů (animace srážky), jedna úprava návrhu před commitem (Enter v Nastavení).

## Poučení

- Čas v herní logice počítej v pevných krocích a porovnávej s tolerancí. Desetinná čísla jako 1,1 nebo 1/120 počítač neumí uložit přesně a chyba se násobí s každým krokem.
- Nech agenta navrhnout stavy obrazovek jako čistou funkci. Celý tok menu jde otestovat bez prohlížeče a za pár milisekund.
- Když agent přidává toleranci nebo jinou „pojistku“, ať ověří, že je opravdu potřeba. Zkusmé odebrání a pád testu je nejlevnější důkaz.
