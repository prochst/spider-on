# Programátorská dokumentace Spider On

Tahle složka popisuje, jak je hra postavená: z čeho se skládá, jaké nástroje používá a jak spolu jednotlivé části mluví. Je určená každému, kdo chce kód číst, upravovat nebo na něj navázat. Příběh vývoje s AI agentem (zadání, chyby, poučení) je zvlášť ve [výukovém materiálu](../ai-lekce/00-uvod.md), pravidla hry ve [specifikaci](../specifikace.md).

## Shrnutí

Spider On je arkádová hra v prohlížeči. Pavouk leze po kruhové pavučině, sbírá mouchy a vyhýbá se nepřátelským pavoukům. Hra je statický web (HTML, JavaScript, CSS) bez serverové části. Dá se nainstalovat na plochu jako PWA a hrát offline. Později ji obalí Capacitor pro Android a iOS.

### Použité technologie

| Oblast | Technologie | Proč |
| --- | --- | --- |
| Jazyk | TypeScript ve striktním režimu | Typy hlídají celou herní logiku, žádné `any`. |
| Sestavení | Vite | Rychlý vývojový server, produkční build do `dist/`, vlastní plugin pro service worker. |
| Grafika | Canvas 2D | Vše se kreslí kódem, žádné obrázky ani herní framework. |
| Menu | HTML a CSS nad Canvasem | Fokus, klávesnice, čtečka obrazovky a dotyk fungují bez práce navíc. |
| Zvuk | Web Audio API | Zvuky jsou syntetizované z tónů popsaných daty, žádné zvukové soubory. |
| Úložiště | `localStorage` | Nastavení a tabulka výsledků; když selže, hra běží dál. |
| Offline | Service worker a Web App Manifest | Hra se nainstaluje na plochu a spustí bez internetu. |
| Písmo | Chakra Petch (OFL), přibalené | Hra nic nenačítá z internetu. |
| Unit testy | Vitest | Testy čisté herní logiky vedle kódu (`*.test.ts`). |
| E2E testy | Playwright | Produkční build ve skutečném prohlížeči, na počítači i s dotykem. |
| CI | GitHub Actions | Kontroly u každého pull requestu, build k vydání po sloučení do `main`. |
| Hosting | Apache na vlastní subdoméně | https://spider-on.prochst.dev/, nahrává se přes FTP. |

Jediné závislosti jsou vývojové (`typescript`, `vite`, `vitest`, `@playwright/test`). Do prohlížeče se nedostane žádná cizí knihovna. Podrobnosti v [knihovny.md](knihovny.md).

### Hlavní postupy

- **Čistá herní logika.** Všechno, co rozhoduje o pravidlech, je v `src/game/` a nesahá na DOM, Canvas, `window`, hodiny ani `Math.random()`. Čas dostává jako parametr `dt`, náhodu jako předaný generátor se semínkem. Díky tomu jde každou situaci přehrát v testu.
- **Pevný krok simulace.** Logika se vždy posouvá o 1/120 s. Hlavní smyčka v `src/main.ts` rozdělí skutečný čas snímku na celé kroky, takže hra běží stejně na 60 Hz i na 144 Hz displeji.
- **Jednosměrný tok dat.** Vstup posílá příkazy do logiky, logika mění stav, vykreslování a menu stav jen čtou. Vykreslovací vrstva stav hry nikdy nemění.
- **Šablony vzhledu.** Vykreslování spočítá pozice v pixelech, šablona (`Theme`) jen rozhodne, jak věci vypadají. Šablona nevidí stav hry, takže nemůže rozbít pravidla.
- **Obrazovky jako stavový automat.** Menu, hra, pauza, havárie i konec hry jsou hodnoty typu `Screen`. Každou změnu dělá jediná funkce `transition()`.
- **Laditelné konstanty na jednom místě.** Rychlosti, časy, body a velikosti jsou v `src/game/config.ts`.
- **Specifikace je zdroj pravdy.** Změna chování hry začíná úpravou `docs/specifikace.md`. Komentáře v kódu odkazují na její kapitoly („spec chapter 7“).
- **Uložená data jako cizí vstup.** Cokoli přečtené z `localStorage` projde kontrolou a chybné hodnoty nahradí výchozí, aby data ze starší verze hru nerozbila.
- **K hráčům jen otestovaný build.** Build k vydání vznikne, jen když projdou typy, unit testy, build i E2E testy.
- **Konvence.** Kód, identifikátory a komentáře anglicky, dokumentace česky. Malé funkce, komentář vysvětluje proč, ne co.

## Obsah

1. [Struktura projektu](struktura-projektu.md): složky a soubory, co kam patří.
2. [Použité knihovny a nástroje](knihovny.md): závislosti, verze, konfigurace a API prohlížeče.
3. [Architektura a provázání](architektura.md): vrstvy, tok dat, herní smyčka, jak spolu moduly mluví.
4. [Herní logika](herni-logika.md): podrobný popis modulů v `src/game/` a jejich hlavních funkcí.
5. [Prohlížečová vrstva](prohlizecova-vrstva.md): vykreslování, šablony, menu, vstup, zvuk, úložiště a PWA.
6. [Testování](testovani.md): unit testy, E2E testy, ladicí režim a pomocné skripty.
7. [Nasazení](nasazeni.md): nahrání webové verze na hosting.

## Rychlý start

```bash
npm ci              # instalace závislostí
npm run dev         # vývojový server na http://localhost:5173/
npm test            # unit testy
npm run e2e         # E2E testy v prohlížeči (samy sestaví hru)
npm run typecheck   # kontrola typů
npm run build       # produkční build do dist/
```

Před každým commitem musí projít `npm run typecheck`, `npm test` a `npm run build`. Při změně chování v prohlížeči (vstup, menu, rozložení, úložiště) i `npm run e2e`.
