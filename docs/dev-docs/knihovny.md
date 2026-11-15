# Použité knihovny a nástroje

[← Programátorská dokumentace](README.md)

Hra nemá žádnou běhovou závislost. Všechny balíčky v `package.json` jsou vývojové (`devDependencies`): sestaví, zkontrolují a otestují kód, ale do prohlížeče hráče se nedostanou. To, co hra za běhu potřebuje, dává sám prohlížeč. Nové závislosti se přidávají jen po dohodě (viz `CLAUDE.md`).

## Vývojové závislosti

| Balíček | Verze v `package.json` | Nainstalovaná (lockfile) | K čemu |
| --- | --- | --- | --- |
| `typescript` | `^7.0.2` | 7.0.2 | Kontrola typů (`tsc --noEmit`). Překlad do JavaScriptu dělá Vite. |
| `vite` | `^8.3.5` | 8.3.5 | Vývojový server, produkční build, kopírování `public/`, náhled buildu (`vite preview`). |
| `vitest` | `^5.0.5` | 5.0.5 | Unit testy. Sdílí konfiguraci s Vite (`test` ve `vite.config.ts`). |
| `@playwright/test` | `1.63.0` (přesně) | 1.63.0 | E2E testy v Chromiu a pomocné skripty ve `scripts/`. |

Playwright má pevnou verzi, protože musí sedět s nainstalovaným prohlížečem (v CI ho stahuje `npx playwright install --with-deps chromium`). Ostatní balíčky povolují menší aktualizace (`^`), skutečné verze drží `package-lock.json`. Proto se instaluje přes `npm ci`, ne `npm install`.

CI i release běží na Node.js 22 (`actions/setup-node` v `.github/workflows/`).

### TypeScript

Dvě konfigurace, protože stránka a service worker běží v různých prostředích:

- `tsconfig.json`: stránka, testy, E2E a konfigurační soubory. Knihovny `ES2022`, `DOM`, `DOM.Iterable`, typy `vite/client`. Složku `src/worker` vynechává.
- `src/worker/tsconfig.json`: dědí z kořenové, ale místo DOM má typy `WebWorker`. Jinak by `self` neměl typ `ServiceWorkerGlobalScope`.

`npm run typecheck` spouští obě (`tsc --noEmit && tsc --noEmit -p src/worker`). Zapnuté jsou mimo jiné `strict`, `noUncheckedIndexedAccess` (přístup do pole může vrátit `undefined`), `noUnusedLocals`, `noUnusedParameters` a `isolatedModules`.

### Vite

Konfigurace ve `vite.config.ts`:

- `base: "/"`: hra leží v kořeni domény. Odkazy v `index.html` a manifestu jsou relativní (`./`), service worker se registruje přes `import.meta.env.BASE_URL`, takže by stačilo změnit jen tuto hodnotu.
- `define.__APP_VERSION__`: verze z `package.json` a prvních sedm znaků commitu z proměnné `GITHUB_SHA` (místně „local“). Ukazuje se dole na úvodní obrazovce.
- Dva vstupy buildu: `index.html` a `src/worker/sw.ts`. Service worker dostane pevný název `sw.js` v kořeni (jeho rozsah je složka, ve které leží), ostatní soubory jdou do `assets/` s otiskem obsahu v názvu.
- Vlastní plugin `pwaPlugin()`: po sestavení vloží na začátek `sw.js` konstantu `PRECACHE` se seznamem všech souborů buildu a krátkým otiskem (FNV-1a). Podrobně v [prohlizecova-vrstva.md](prohlizecova-vrstva.md#pwa-a-service-worker).
- `test.include: ["src/**/*.test.ts"]`: Vitest hledá testy jen v `src/`, E2E testy v `e2e/` nechává Playwrightu.

### Vitest

Testy leží vedle testovaného souboru (`spider.ts` a `spider.test.ts`). Běží v Node.js bez DOM, což vyhovuje, protože testovaná logika DOM nepoužívá. `npm test` je jeden běh, `npm run test:watch` sleduje změny.

### Playwright

`playwright.config.ts` sestaví hru (`npm run build`), spustí `vite preview` na portu 4173 a testy pouští ve dvou projektech:

- `desktop`: Chrome 1280 × 800, všechny testy kromě dotyku.
- `phone`: 844 × 390 s dotykem (`hasTouch`, `isMobile`), jen `start`, `touch`, `layout` a `pwa`.

Testy jdou jeden po druhém (`fullyParallel: false`). Při chybě se uloží snímek a trace. Stejnou knihovnu používají skripty ve `scripts/` k ovládání prohlížeče (vykreslení ikon, obrázku pro náhled, kontrola aktualizace).

## Přibalené soubory

| Soubor | Licence | Poznámka |
| --- | --- | --- |
| Písmo Chakra Petch, řezy 500 a 700, sady latin a latin-ext | SIL Open Font License 1.1 (`src/assets/fonts/chakra-petch/OFL.txt`) | Soubory `woff2` a vlastní `chakra-petch.css` s `@font-face`. Vite je zabalí do `assets/`. Prohlížeč stáhne latin-ext, až když text obsahuje česká písmena. |

## API prohlížeče

Místo knihoven hra používá přímo tato rozhraní:

| API | Kde | K čemu |
| --- | --- | --- |
| Canvas 2D (`CanvasRenderingContext2D`) | `src/render/`, `src/themes/` | Veškerá herní grafika, záře přes `shadowBlur`. |
| `requestAnimationFrame` | `src/main.ts` | Herní smyčka, jeden snímek na obnovení displeje. |
| Pointer Events, `setPointerCapture` | `src/input/touch.ts` | Dotyk, každý prst má vlastní `pointerId`. |
| `KeyboardEvent.code` | `src/input/keyboard.ts` | Klávesy podle fyzické polohy, stejné na české i anglické klávesnici. |
| Web Audio (`AudioContext`, oscilátory, `GainNode`) | `src/audio/sound.ts` | Syntetizované zvuky. |
| `localStorage` | `src/storage/storage.ts` | Nastavení a tabulka výsledků. |
| Service Worker, Cache Storage | `src/worker/sw.ts`, `src/pwa/serviceWorker.ts` | Offline provoz a aktualizace. |
| Web App Manifest | `public/manifest.webmanifest` | Instalace na plochu. |
| Fullscreen API, `screen.orientation.lock` | `src/ui/fullscreen.ts` | Celá obrazovka a zámek na šířku (kde to prohlížeč dovolí). |
| `matchMedia` | `src/main.ts`, `src/ui/fullscreen.ts` | Dotykové zařízení (`pointer: coarse`), orientace na výšku. |
| CSS `env(safe-area-inset-*)` | `src/ui/overlay.css` | Výřez displeje a zaoblené rohy. Canvas hodnoty čte přes neviditelný prvek. |
| `document.fonts` | `src/main.ts` | Načtení písma pro Canvas dopředu. |

## Nástroje mimo `package.json`

- **GitHub Actions**: `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v7`. Artefakt s buildem se nahrává s `include-hidden-files: true`, jinak by chyběl `.htaccess`.
- **Apache** na hostingu: čte `public/.htaccess` (moduly `mod_rewrite`, `mod_mime`, `mod_headers`, `mod_deflate`, každý blok v `<IfModule>`). Viz [nasazeni.md](nasazeni.md).
- **Capacitor** pro Android a iOS je v plánu (fáze 4 a 5), v repozitáři zatím není.
