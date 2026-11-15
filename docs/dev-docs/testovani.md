# Testování

[← Programátorská dokumentace](README.md)

Hra má dvě úrovně automatických testů a pár pomocných skriptů pro to, co se automaticky otestovat nedá.

| Příkaz | Co ověří | Kdy spustit |
| --- | --- | --- |
| `npm run typecheck` | Typy stránky i service workeru | Před každým commitem |
| `npm test` | Unit testy (Vitest) | Před každým commitem |
| `npm run build` | Že jde hra sestavit (zahrnuje `typecheck`) | Před každým commitem |
| `npm run e2e` | Produkční build ve skutečném prohlížeči (Playwright) | Při změně vstupu, menu, rozložení, úložiště nebo PWA |

Všechny čtyři běží v CI u každého pull requestu (`.github/workflows/ci.yml`). Build k vydání vznikne jen po zelených testech.

## Unit testy (Vitest)

Testy leží vedle testovaného souboru jako `*.test.ts`. Testuje se všechno, co nepotřebuje prohlížeč:

- celá herní logika v `src/game/`,
- rozpoznání gest (`src/input/gesture.ts`),
- rozložení obrazovky a převod na pixely (`src/render/view.ts`, `layout.ts`) a animace nohou (`legs.ts`).

Protože logika dostává čas jako `dt` a náhodu jako generátor se semínkem, test může přesně nasimulovat jakoukoli situaci:

```ts
import { FIXED_STEP } from "./config";
import { createGame, dispatch, update } from "./game";

const game = createGame(1);
dispatch(game, { type: "play" });
dispatch(game, { type: "start" });
for (let i = 0; i < 120; i++) update(game, FIXED_STEP);
expect(game.screen.name).toBe("playing");
```

Zásady, které se v projektu osvědčily:

- **Čísla odvozuj z konstant v `config.ts`**, ne natvrdo. Test pak přežije doladění rychlosti.
- **Tabulky ze specifikace testuj opisem tabulky.** Řádek čísel v testu jde porovnat se specifikací očima.
- **Časy testuj přesnými počty kroků.** Plovoucí čárka umí přidat krok navíc (proto tolerance `1e-9` v časovačích).
- **Uložená data testuj i poškozená.** `parseSettings` a `parseScores` musí přežít cokoli.

## E2E testy (Playwright)

`npm run e2e` sestaví hru, spustí `vite preview` na portu 4173 a testy v `e2e/` pustí ve dvou projektech:

- **`desktop`**: 1280 × 800, myš a klávesnice,
- **`phone`**: 844 × 390 (telefon na šířku) s dotykem, jen `start`, `touch`, `layout` a `pwa`.

Seznam testů je v [struktura-projektu.md](struktura-projektu.md#e2e).

### Jak testy čtou stav hry

Místo odhadování z pixelů otevřou hru s `?debug&seed=1` a stav čtou z `window.spiderOn` (`Game`) a `window.spiderOnView` (`View`). Pomocné funkce jsou v `e2e/helpers.ts`:

| Funkce | Co dělá |
| --- | --- |
| `openGame(page, seed)` | Otevře hru v ladicím režimu s pevným semínkem a počká na úvodní menu. |
| `menuButton(page, label)` | Tlačítko v panelu menu podle popisku. |
| `readGame(page, pick)` | Přečte hodnotu ze stavu hry. |
| `expectScreen(page, name)` | Počká, až bude hra na dané obrazovce. |

### Dotyk

Playwright umí jen klepnout. Hra potřebuje prsty, které zůstanou dole, posouvají se a jsou dva zároveň. Třída `TouchScreen` v `e2e/touch.ts` proto posílá skutečné dotykové události přes Chrome DevTools Protocol (`Input.dispatchTouchEvent`): `down(at)`, `move(id, to)`, `up(id)`.

### Ladění selhání

Při chybě Playwright uloží snímek a trace do `test-results/` a HTML report do `playwright-report/` (v CI jako artefakt `playwright-report`). Než začneš opravovat hru, prověř test: několikrát se ukázalo, že chyba byla v simulaci vstupu, ne ve hře.

## Ruční ladění

S `?debug` v adrese (např. `http://localhost:5173/?debug&seed=7`):

- **K** simuluje srážku, **C** sní všechny mouchy,
- `window.spiderOn` v konzoli ukáže celý stav hry,
- stejné semínko přehraje stejnou hru.

## Pomocné skripty

| Skript | Co ověří nebo vyrobí |
| --- | --- |
| `node scripts/check-update.mjs` | Nabídku nové verze: sestaví a spustí jednu verzi, sestaví druhou, počká na „Je dostupná nová verze“, stiskne Aktualizovat a zkontroluje číslo verze. E2E testy to neumí, potřebuje to dva buildy na stejné adrese. Přepíše `dist/`. |
| `node scripts/share-image.mjs` | Vyrobí `public/share.png` ze skutečného snímku hry. |
| `node scripts/icons.mjs` | Vyrobí PNG ikony z `public/app-icons/icon.svg`. |

## Co automaticky otestovat nejde

- **Jak se hra hraje.** Tempo, obtížnost a pocit z ovládání pozná jen člověk. Po každé změně hratelnosti hru zahraj.
- **Dotyk v ruce.** Emulace ověří, že gesta dojdou do hry, ne že se dobře ovládají palcem.
- **Skutečný hosting.** `vite preview` není Apache. Po nahrání projdi kontrolu z [nasazeni.md](nasazeni.md#kontrola-po-nahrání).
