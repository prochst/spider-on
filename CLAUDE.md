# Spider On

Arkádová hra v prohlížeči (později Android a iOS přes Capacitor): pavouk leze po kruhové pavučině, sbírá mouchy a vyhýbá se nepřátelským pavoukům. Projekt je zároveň výukový materiál o vývoji s AI agentem, takže na čitelnosti kódu a dokumentace záleží stejně jako na hře.

## Zdroj pravdy

- Pravidla hry: `docs/specifikace.md`. Před změnou chování hry nejdřív uprav specifikaci, nebo se zeptej.
- Laditelné konstanty patří do `src/game/config.ts`, ne roztroušené po kódu.

## Příkazy

- `npm ci`: instalace závislostí
- `npm run dev`: vývojový server
- `npm test`: unit testy (Vitest)
- `npm run typecheck`: kontrola typů
- `npm run build`: produkční build do `dist/`

Před každým commitem musí projít `npm run typecheck`, `npm test` a `npm run build`.

## Architektura

- `src/game/`: čistá herní logika. Žádný DOM, Canvas, `window`, `Date.now()` ani `Math.random()`. Čas přichází jako `dt`, náhoda jako předaný generátor. Vše tady má unit testy vedle sebe (`*.test.ts`).
- `src/render/`: vykreslování do Canvasu. Čte stav hry, nikdy ho nemění.
- `src/themes/`: šablony vzhledu. Každá šablona implementuje společné rozhraní, logika o šablonách neví.
- `src/input/`, `src/audio/`: vstup (klávesnice, dotyk) a zvuk (Web Audio).
- `src/main.ts`: spojuje vše dohromady a řídí herní smyčku s pevným krokem 1/120 s.
- Žádný herní framework. Nové závislosti jen po dohodě.

## Konvence

- Kód, identifikátory a komentáře v kódu anglicky. Dokumentace v `docs/`, README a popisy pull requestů česky.
- TypeScript ve striktním režimu, žádné `any`.
- Malé, čitelné funkce. Komentář vysvětluje proč, ne co.
- Nepoužívej název, grafiku ani zvuky původní hry Head On.

## Výuková dokumentace

Každý pull request odpovídá jedné kapitole v `docs/kapitoly/<fáze>/`. Ke každé kapitole:

1. Ulož doslovné zadání uživatele do `docs/prompty/<fáze>/`.
2. Kapitolu napiš podle osnovy v `docs/00-uvod.md`: cíl, zadání, co agent udělal, kde se spletl, lidská kontrola, metriky, poučení.
3. Chyby a slepé uličky nezamlčuj, jsou pro čtenáře nejcennější.
4. Obecná poučení přidej do `docs/lekce.md`.
