# Struktura projektu

[← Programátorská dokumentace](README.md)

## Kořen repozitáře

```
spider-on/
├── index.html             vstupní stránka: canvas, kořen menu, meta značky, odkaz na manifest
├── package.json           skripty npm a vývojové závislosti, číslo verze hry
├── package-lock.json      zamčené verze závislostí (instaluj přes npm ci)
├── tsconfig.json          TypeScript pro stránku, testy a konfiguraci (bez service workeru)
├── vite.config.ts         Vite: base "/", číslo verze, plugin pro service worker, Vitest
├── playwright.config.ts   E2E testy: projekty desktop a phone, server vite preview
├── CLAUDE.md              stálá pravidla projektu pro AI agenta
├── README.md              stručný úvod a odkazy
├── LICENSE                licence kódu (MIT)
├── LICENSE-docs.md        licence dokumentace (CC BY 4.0)
├── .github/workflows/     GitHub Actions
├── docs/                  dokumentace
├── e2e/                   E2E testy (Playwright)
├── public/                soubory kopírované do buildu beze změny
├── scripts/               pomocné skripty spouštěné ručně
└── src/                   zdrojový kód hry
```

Složky `node_modules/`, `dist/`, `test-results/` a `playwright-report/` vznikají při práci a jsou v `.gitignore`.

## `src/`: zdrojový kód

Kód je rozdělený do vrstev. Šipka „smí importovat“ vede vždy jen jedním směrem: logika nezná nic z ostatních složek, vykreslování a menu logiku čtou, `main.ts` spojuje všechno. Podrobněji v [architektura.md](architektura.md).

```
src/
├── main.ts                spojuje vrstvy, herní smyčka s pevným krokem
├── vite-env.d.ts          typ globální konstanty __APP_VERSION__
├── game/                  čistá herní logika (bez DOM), každý modul má *.test.ts
│   ├── config.ts          laditelné konstanty
│   ├── game.ts            stav celé hry, příkazy a krok simulace
│   ├── screens.ts         obrazovky a přechody mezi nimi
│   ├── field.ts           hrací pole jednoho kola
│   ├── spider.ts          pohyb pavouka po kruhu a přelézání
│   ├── ai.ts              rozhodování nepřátel na příčkách
│   ├── flies.ts           mouchy a jejich sbírání
│   ├── bonus.ts           bonusové balíčky a zpomalení
│   ├── progression.ts     velikost pavučiny a nepřátelé podle kola
│   ├── scoring.ts         body a životy navíc
│   ├── scores.ts          tabulka výsledků
│   ├── settings.ts        nastavení hráče a obtížnost
│   ├── geometry.ts        poloměry kruhů a body na pavučině
│   ├── fixedStep.ts       rozdělení času snímku na pevné kroky
│   └── random.ts          generátor náhodných čísel se semínkem
├── render/                vykreslování do Canvasu (stav jen čte)
│   ├── scene.ts           co se kreslí a kde, volá šablonu
│   ├── view.ts            měřítko, střed pavučiny, ovladače, bezpečná oblast
│   ├── layout.ts          převod jednotek R na pixely, tvar pavučiny
│   └── legs.ts            fáze animace nohou
├── themes/                šablony vzhledu
│   ├── theme.ts           rozhraní Theme a typy, které šablona dostává
│   └── neon/              výchozí šablona Neon
│       ├── index.ts       objekt šablony
│       ├── palette.ts     barvy
│       ├── web.ts         pozadí a pavučina
│       ├── spider.ts      pavouk
│       ├── items.ts       mouchy a balíčky
│       ├── effects.ts     HUD, zpráva o bonusu, havárie, písmo
│       └── controls.ts    dotykové ovladače
├── ui/                    menu jako HTML nad Canvasem
│   ├── overlay.ts         panely pro každou obrazovku, nastavení, tabulka výsledků
│   ├── overlay.css        vzhled menu, bezpečná oblast, výzva k otočení
│   └── fullscreen.ts      tlačítko celé obrazovky
├── input/                 vstup
│   ├── keyboard.ts        klávesnice
│   ├── touch.ts           dotyk: touchpad vpravo, plyn vlevo
│   └── gesture.ts         rozpoznání tahu a klepnutí (bez DOM, s testy)
├── audio/
│   └── sound.ts           syntetizované zvuky (Web Audio)
├── storage/
│   └── storage.ts         nastavení a výsledky v localStorage
├── pwa/
│   └── serviceWorker.ts   registrace service workeru, nabídka nové verze
├── worker/
│   ├── sw.ts              service worker (offline mezipaměť)
│   └── tsconfig.json      vlastní typy WebWorker
└── assets/fonts/chakra-petch/   písmo (woff2), jeho CSS a licence OFL
```

### Co kam patří

| Chci… | Kam |
| --- | --- |
| změnit pravidlo hry | nejdřív `docs/specifikace.md`, pak `src/game/` a test vedle |
| doladit číslo (rychlost, body, čas) | `src/game/config.ts` |
| změnit, jak něco vypadá | `src/themes/neon/` |
| změnit, kde něco na obrazovce je | `src/render/view.ts` nebo `src/render/scene.ts` |
| přidat nebo upravit menu | `src/ui/overlay.ts` (panel) a `src/game/screens.ts` (přechod) |
| přidat klávesu nebo gesto | `src/input/` a obsluhu v `src/main.ts` |
| přidat zvuk | `GameEvent` v `src/game/game.ts` a tóny v `src/audio/sound.ts` |
| uložit něco nového | parser v `src/game/`, čtení a zápis v `src/storage/storage.ts` |

## `public/`

Vite tyto soubory zkopíruje do `dist/` beze změny, neprocházejí bundlerem.

| Soubor | Účel |
| --- | --- |
| `manifest.webmanifest` | Web App Manifest: název, ikony, režim celé obrazovky, orientace na šířku. |
| `app-icons/` | Ikona jako SVG a PNG (192, 512, apple-touch-icon). Složka se nesmí jmenovat `icons/`, Apache ji často mapuje na vlastní. |
| `share.png` | Obrázek pro náhled odkazu (1200 × 630), vzniká skriptem `scripts/share-image.mjs`. |
| `.htaccess` | Nastavení Apache: přesměrování na https, typy souborů, mezipaměť, gzip. |

Nový soubor, který hra potřebuje za běhu, přidej i do `PUBLIC_FILES` ve `vite.config.ts`. Jinak ho service worker neuloží a offline bude chybět.

## `e2e/`

| Soubor | Co testuje |
| --- | --- |
| `helpers.ts` | Společné kroky: otevření hry s `?debug&seed`, čtení stavu z `window.spiderOn`. |
| `touch.ts` | Třída `TouchScreen`: skutečné dotyky přes Chrome DevTools Protocol (víc prstů, tahy). |
| `start.spec.ts` | Načtení bez chyb, úvodní menu, pavučina na Canvasu, nic se nestahuje z internetu. |
| `keyboard.spec.ts` | Ovládání klávesnicí: start, plyn, pohyb, pauza, ztráta fokusu, další kolo. |
| `touch.spec.ts` | Dotykové ovládání a výzva k otočení telefonu (jen projekt `phone`). |
| `layout.spec.ts` | Rozložení: tabulka výsledků na obrazovce, tlačítko v rohu, celá obrazovka, výřez displeje, menu na velkém monitoru. |
| `storage.spec.ts` | Uložení nastavení a zápis dohrané hry do tabulky výsledků. |
| `difficulty.spec.ts` | Volba obtížnosti: počáteční kolo, výběr klávesnicí, barvy seznamu, uložení. |
| `pwa.spec.ts` | Manifest, service worker a hra offline. |
| `share.spec.ts` | Meta značky pro vyhledávače a náhled odkazu, menu v oblasti `<main>`. |

## `scripts/`

Skripty se spouštějí ručně přes `node`, nejsou součástí buildu.

| Skript | Kdy ho spustit |
| --- | --- |
| `icons.mjs` | Po změně `public/app-icons/icon.svg`. Vykreslí PNG ikony v Chromiu. |
| `share-image.mjs` | Po viditelné změně hry. Sestaví hru, zahraje 2,5 s se semínkem a uloží `public/share.png`. |
| `check-update.mjs` | Po změně service workeru. Sestaví dvě verze za sebou a ověří nabídku „Je dostupná nová verze“. Přepíše `dist/`. |

## `.github/workflows/`

| Workflow | Kdy běží | Co dělá |
| --- | --- | --- |
| `ci.yml` | U každého pull requestu a jako první část `release.yml` | `typecheck`, unit testy, build, pak E2E testy v Chromiu. |
| `release.yml` | Po push do `main`, nebo ručně | Spustí `ci.yml`, a když projde, sestaví hru a nabídne `dist/` ke stažení jako artefakt (včetně `.htaccess`). |

## `docs/`

```
docs/
├── specifikace.md   pravidla hry, jediný zdroj pravdy o chování
├── dev-docs/        programátorská dokumentace (tato složka)
└── ai-lekce/        výukový materiál o vývoji s AI agentem
    ├── 00-uvod.md   jak materiál číst, osnova kapitoly
    ├── lekce.md     průběžný seznam poučení
    ├── kapitoly/    jedna kapitola na pull request, po fázích
    └── prompty/     doslovná zadání ke kapitolám
```
