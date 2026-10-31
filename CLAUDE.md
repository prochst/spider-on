# Spider On

Arkádová hra v prohlížeči (později Android a iOS přes Capacitor): pavouk leze po kruhové pavučině, sbírá mouchy a vyhýbá se nepřátelským pavoukům. Projekt je zároveň výukový materiál o vývoji s AI agentem, takže na čitelnosti kódu a dokumentace záleží stejně jako na hře.

## Zdroj pravdy

- Pravidla hry: `docs/specifikace.md`. Před změnou chování hry nejdřív uprav specifikaci, nebo se zeptej.
- Laditelné konstanty patří do `src/game/config.ts`, ne roztroušené po kódu.

## Příkazy

- `npm ci`: instalace závislostí
- `npm run dev`: vývojový server
- `npm test`: unit testy (Vitest)
- `npm run e2e`: E2E testy v prohlížeči (Playwright), samy sestaví hru a spustí `vite preview`
- `npm run typecheck`: kontrola typů
- `npm run build`: produkční build do `dist/`
- `node scripts/icons.mjs`: vykreslí PNG ikony z `public/icons/icon.svg` (po změně ikony)
- `node scripts/share-image.mjs`: vykreslí obrázek pro náhled odkazu `public/share.png` ze skutečné hry (po viditelné změně hry)
- `node scripts/check-update.mjs`: ověří nabídku nové verze se dvěma buildy (přepíše `dist/`)

Před každým commitem musí projít `npm run typecheck`, `npm test` a `npm run build`. Při změně chování v prohlížeči (vstup, menu, rozložení, úložiště) spusť i `npm run e2e`.

## Architektura

- `src/game/`: čistá herní logika. Žádný DOM, Canvas, `window`, `Date.now()` ani `Math.random()`. Čas přichází jako `dt`, náhoda jako předaný generátor. Vše tady má unit testy vedle sebe (`*.test.ts`).
- `src/render/`: vykreslování do Canvasu. Čte stav hry, nikdy ho nemění.
- `src/themes/`: šablony vzhledu. Každá šablona implementuje rozhraní `Theme` z `src/themes/theme.ts` a dostává hotové pozice v pixelech. Logika o šablonách neví.
- `src/assets/`: přibalené soubory, zatím písmo Chakra Petch (OFL). Hra nic nenačítá z internetu, aby fungovala offline.
- `src/ui/`: menu a překryvné obrazovky jako HTML nad Canvasem (fokus, klávesnice a přístupnost řeší prohlížeč).
- `src/input/`, `src/audio/`: vstup (klávesnice, dotyk) a zvuk (Web Audio).
- `src/pwa/`: registrace service workeru a nabídka nové verze. `src/worker/sw.ts`: samotný service worker, s vlastním `tsconfig.json` (typy WebWorker). Seznam souborů mu při buildu doplní plugin ve `vite.config.ts`.
- `public/`: manifest, ikony a obrázek pro náhled odkazu (`share.png`), kopírují se do buildu beze změny. Nový soubor, který hra potřebuje, sem přidej i do `PUBLIC_FILES` ve `vite.config.ts`, jinak nebude offline.
- `src/storage/`: nastavení a tabulka výsledků v `localStorage`. Když úložiště selže, hra běží dál bez něj.
- `e2e/`: E2E testy (Playwright) proti produkčnímu buildu, projekty `desktop` (1280×800) a `phone` (844×390 s dotykem). Stav hry čtou přes `?debug` a `window.spiderOn` (rozložení přes `window.spiderOnView`), dotyk posílají přes CDP (`e2e/touch.ts`).
- `src/main.ts`: spojuje vše dohromady a řídí herní smyčku s pevným krokem 1/120 s.
- Žádný herní framework. Nové závislosti jen po dohodě.

## Konvence

- Kód, identifikátory a komentáře v kódu anglicky. Dokumentace v `docs/`, README a popisy pull requestů česky.
- TypeScript ve striktním režimu, žádné `any`.
- Malé, čitelné funkce. Komentář vysvětluje proč, ne co.
- Nepoužívej název, grafiku ani zvuky původní hry Head On.

## Postup práce

- Po sloučení pull requestu nezačínej automaticky další kapitolu. Počkej, až uživatel sloučenou verzi ručně otestuje a dá pokyn k opravě, nebo k pokračování podle plánu.

## Výuková dokumentace

Každý pull request odpovídá jedné kapitole v `docs/kapitoly/<fáze>/`. Ke každé kapitole:

1. Ulož doslovné zadání uživatele do `docs/prompty/<fáze>/`.
2. Kapitolu napiš podle osnovy v `docs/00-uvod.md`: cíl, zadání, co agent udělal, kde se spletl, lidská kontrola, metriky, poučení.
3. Chyby a slepé uličky nezamlčuj, jsou pro čtenáře nejcennější.
4. Obecná poučení přidej do `docs/lekce.md`.
