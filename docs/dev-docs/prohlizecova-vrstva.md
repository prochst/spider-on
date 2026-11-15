# Prohlížečová vrstva

[← Programátorská dokumentace](README.md)

Všechno mimo `src/game/`: spojení v `main.ts`, vykreslování, šablony vzhledu, menu, vstup, zvuk, úložiště a offline provoz. Tyhle moduly smějí sahat na DOM a API prohlížeče, ale o pravidlech hry nerozhodují.

## `main.ts`: spojení a herní smyčka

Jediný soubor, který zná všechny vrstvy. Za běhu dělá tohle:

1. **Najde prvky stránky.** `#game` (canvas) a `#ui` (kořen menu, `<main>`). Chybějící prvek vyhodí srozumitelnou chybu přes `required()`.
2. **Vytvoří hru.** Semínko je náhodné, s `?debug&seed=N` pevné. V ladicím režimu zpřístupní `window.spiderOn` a `window.spiderOnView`.
3. **Napojí vstup.** `listenToTouch()` a `listenToKeyboard()` dostanou obsluhy, které volají `dispatch`, `steerToward` a nastavují plyn. Plyn je součet klávesnice a dotyku (`throttle.keys || throttle.touch`).
4. **Načte nastavení a výsledky** (`loadSettings`, `loadScores`) do objektu `menu: MenuData` a podle nich nastaví obtížnost, zvuk a šablonu.
5. **Odemkne zvuk** při prvním `pointerdown` nebo `keydown` (posluchač ve fázi capture, aby ho žádná jiná obsluha nezastavila).
6. **Vytvoří menu** (`createOverlay`) a zaregistruje service worker. Nabídku nové verze ukáže hned, jen když je hráč na úvodní obrazovce, aby nepřišel o rozepsané jméno.
7. **Pauzuje hru** při ztrátě fokusu okna, skrytí stránky a otočení dotykového zařízení na výšku.
8. **Hlídá velikost.** `resize()` nastaví rozlišení canvasu podle `devicePixelRatio` (nejvýš 2×) a spočítá nový `View`. Bezpečnou oblast displeje čte z neviditelného prvku `.layout-probe`, protože hodnoty `env(safe-area-inset-*)` existují jen v CSS.
9. **Spustí smyčku** `frame()` (popsaná v [architektura.md](architektura.md#herní-smyčka)).

Důležité funkce uvnitř:

| Funkce | Co dělá |
| --- | --- |
| `send(command)` | `dispatch()` a při změně obrazovky `overlay.sync()`. Všechny příkazy z menu a kláves jdou tudy. |
| `onKey(key)` | Převede `KeyCommand` na příkaz (Enter, Esc přes `confirmEvent`/`cancelEvent`), směr (šipky) nebo ladicí akci. |
| `changeSettings(change)` | Sloučí změnu do nastavení, uloží ji a hned použije (zvuk, obtížnost, šablona). |
| `handleEvents()` | Přehraje `game.events` (každou událost jednou za snímek), při `gameOver` zapíše výsledek, seznam vyprázdní. |
| `recordGame()` | `addScore()` a při umístění v tabulce `saveScores()`. |
| `useTheme(theme)` | Přepne šablonu pro canvas i menu a dopředu načte písmo (canvas si o webové písmo sám neřekne). |

## `render/`: vykreslování

Vykreslování čte stav hry a nikdy ho nemění.

### `view.ts`: rozložení obrazovky

`createView(width, height, touchControls, frame)` vrátí `View`:

```ts
type View = {
  width: number; height: number;   // canvas v CSS pixelech
  cx: number; cy: number;          // střed pavučiny
  unit: number;                    // pixelů na jednotku R
  controls: { pad: Square; throttle: Circle } | null;  // dotykové ovladače
  hud: { left: number; top: number; right: number };   // okraje pro texty HUD
};
```

- Pavučina vyplní 90 % menšího rozměru bezpečné oblasti.
- S dotykovými ovladači se po stranách vyhradí místo (34 % výšky, nejvýš 190 px). Plyn je vlevo, touchpad vpravo, oba uprostřed mezi okrajem a pavučinou.
- Pravý okraj HUD se vyhne tlačítku v rohu (pauza nebo celá obrazovka).

Je to čistá aritmetika, takže má unit testy (`view.test.ts`).

### `layout.ts`: převod na pixely

| Funkce | Co dělá |
| --- | --- |
| `toScreen(view, point)` | Bod v jednotkách R na pixely. |
| `webLayout(view, ringCount)` | Pavučina v pixelech: každý kruh jako lomená čára z 240 bodů, paprsky s příznakem `isGate`. Příčky vedou přesně od vnitřního po vnější kruh. |
| `WEB_EDGE` | Kam až pavučina sahá (1,02 R), podle toho `view.ts` umisťuje ovladače. |

### `scene.ts`: jeden snímek

`drawScene(ctx, view, game, renderer, time)` rozhoduje, **co** je vidět a **kde**, a kreslení předá šabloně:

1. pozadí, pavučina (na obrazovkách menu ztlumená na 35 % a dál nic),
2. mouchy, balíček, zpráva o bonusu (poslední půlsekundu mizí),
3. nepřátelé (při zpomalení s rolí `slowedEnemy`), hráč, nebo při havárii její animace,
4. HUD (skóre, kolo, životy) a dotykové ovladače se šipkou posledního tahu.

Velikosti objektů jsou v jednotkách R (moucha 0,012, balíček 0,034, pavouk 0,048), takže odpovídají vzdálenostem pro srážky. Texty zpráv o bonusu (česky) jsou tady, ne v logice ani v šabloně.

`Renderer` drží šablonu, animátor nohou a stav dotyku.

### `legs.ts`: animace nohou

`createLegAnimator().phase(spider, at, size)` vrací fázi kroku podle toho, kolik pavouk na obrazovce ulezl. Paměť drží ve `WeakMap` podle objektu pavouka, takže nemusí sahat do stavu hry. Když logika pavouka nahradí (nové kolo), stará položka zmizí sama.

## `themes/`: šablony vzhledu

Rozhraní `Theme` v `themes/theme.ts`:

| Člen | Co dostane | Co kreslí |
| --- | --- | --- |
| `id`, `name`, `fontFamily` | | Identifikace, název v nastavení, písmo pro canvas i menu. |
| `menu` | | Barvy menu jako CSS hodnoty (`text`, `panel`, `border`, `accent`, `glow`, `backdrop`). |
| `drawBackground(ctx, view)` | | Pozadí. |
| `drawWeb(ctx, view, web)` | `WebLayout` | Kruhy a paprsky. |
| `drawFly(ctx, at, size, index, time)` | pozice, velikost | Mouchu. `index` dovolí každé blikat jinak. |
| `drawBonusPackage(ctx, at, size, kind, time)` | druh balíčku | Balíček. |
| `drawBonusNotice(ctx, view, lines, kind, opacity)` | hotové řádky textu | Zprávu uprostřed pavučiny. |
| `drawSpider(ctx, pose)` | `SpiderPose`: pozice, směr, velikost, fáze nohou, role | Pavouka. |
| `drawCrash(ctx, at, size, progress)` | průběh 0 až 1 | Animaci havárie. |
| `drawHud(ctx, view, hud)` | skóre, kolo, životy | HUD. |
| `drawTouchControls(ctx, controls)` | pozice, stisk, poslední tah | Touchpad a plyn. |

Šablona nevidí `Game` ani `Field`, dostává jen pixely, velikosti a role.

### Šablona Neon (`themes/neon/`)

| Soubor | Obsah |
| --- | --- |
| `index.ts` | Objekt `neon: Theme`, skládá funkce z ostatních souborů. |
| `palette.ts` | Všechny barvy: azurová pavučina, růžové příčky, zlaté mouchy, barvy pavouků podle role a balíčků podle druhu. |
| `web.ts` | Pozadí s fialovým oparem a svítící pavučina. |
| `spider.ts` | Tělo a osm nohou, které se hýbou podle `legPhase`. |
| `items.ts` | Mouchy (blikají každá jiným rytmem) a balíčky (každý druh jiný tvar a barva, pulzují). |
| `effects.ts` | HUD, zpráva o bonusu, výbuch havárie a `FONT_FAMILY` (Chakra Petch). |
| `controls.ts` | Dotykové ovladače: klidně azurové, při stisku růžové. |

Záře je `ctx.shadowBlur` a `shadowColor`. Každá funkce kreslí mezi `ctx.save()` a `ctx.restore()`, aby nastavení neprosakovalo.

Nová šablona se přidá do pole `THEMES` v `main.ts` a nastavení ji nabídne samo.

## `ui/`: menu

Menu je HTML nad canvasem, ne kresba. Tlačítka tak mají fokus, ovládání klávesnicí, čtečku obrazovky a dotyk zadarmo.

### `overlay.ts`

| Export | Co dělá |
| --- | --- |
| `createOverlay(root, menuData, handlers)` | Vytvoří panel menu, tlačítko pauzy, tlačítko celé obrazovky a výzvu k otočení. Vrátí `Overlay`. |
| `Overlay.sync(game)` | Přestaví panel, jen když se změnila obrazovka. Volá se každý snímek. |
| `Overlay.refresh(game)` | Přestaví panel vždy, když se změnila data menu (třeba nabídka aktualizace). |
| `applyMenuTheme(root, theme)` | Předá písmo a barvy šablony stylům jako proměnné `--menu-*`. |
| `MenuData` | Co menu ukazuje mimo stav hry: nastavení, výsledky, poslední umístění, seznam šablon, nabídka aktualizace. |
| `OverlayHandlers` | `command(command)` a `settings(change)`. |

Uvnitř `panelFor(game, data, handlers)` popisuje obsah každé obrazovky jako data (`Panel`: nadpis, řádky, tělo, tlačítka, patička) a `renderPanel()` z nich vyrobí prvky. Řádek označený `only: "keys"` nebo `only: "touch"` se ukáže jen při daném ovládání (třída `touch` na `#ui`). Po přestavění dostane fokus první tlačítko.

Úvodní obrazovka má výběr obtížnosti (`difficultyChoice`), nastavení formulář se jménem, vzhledem a zvukem (`settingsForm`), výsledky tabulku (`scoreTable`). Obrazovka Jak hrát (`helpText`) má texty v konstantách `GOAL`, `KEY_CONTROLS` a `TOUCH_CONTROLS`. Obě sady ovládání jsou ve stránce a CSS ukáže tu, která odpovídá třídě `touch`, takže se návod přepne spolu s ovladači. Každá změna se hned uloží přes `handlers.settings`.

Tlačítko pauzy je vidět na obrazovkách `ready`, `playing` a `crash`, tlačítko celé obrazovky na ostatních (a jen kde to prohlížeč umí).

### `overlay.css`

Velikost menu v `rem` s kořenovým písmem `clamp(16px, 2.2vmin, 32px)`, takže se zvětšuje s obrazovkou. Bezpečná oblast přes proměnné `--safe-*`, které jde v testu přepsat. Výzva „Otoč zařízení na šířku“ se ukáže jen pro `(orientation: portrait) and (pointer: coarse)`.

### `fullscreen.ts`

`createFullscreenButton()` a `fullscreenSupported()`. Na dotykovém zařízení se po zapnutí celé obrazovky zkusí zamknout orientace na šířku. Prohlížeče, které to neumí, tiše odmítnou.

## `input/`: vstup

### `keyboard.ts`

`listenToKeyboard(handlers, debug)` posílá `KeyCommand` a změny plynu. Klávesy se poznávají podle `event.code` (fyzická poloha), takže WASD sedí na české i anglické klávesnici.

| Klávesy | Příkaz |
| --- | --- |
| Enter, mezerník | `confirm` |
| Esc, P | `cancel` |
| Šipky, WASD | `up`, `down`, `left`, `right` (směr na obrazovce) |
| Mezerník, Shift | plyn, dokud je držený |
| K, C (jen `?debug`) | `debugCrash`, `debugClear` |

V textovém poli a v rozbaleném seznamu klávesy nejsou zkratky. Na tlačítku s fokusem Enter nespouští `confirm`, protože tlačítko reaguje samo. Při ztrátě fokusu okna se plyn uvolní (klávesa puštěná na pozadí nepošle `keyup`).

### `touch.ts` a `gesture.ts`

`listenToTouch(surface, handlers)` rozdělí plochu: **levá polovina je plyn**, **pravá touchpad**. Pointer Events dávají každému prstu vlastní id, takže oba palce fungují zároveň. Myš se ignoruje. Vrací `TouchState` (drží se plyn? drží se touchpad? poslední tah), který čte vykreslování.

`gesture.ts` je čistá aritmetika s testy:

| Funkce | Co dělá |
| --- | --- |
| `beginGesture(at, time)` | Začátek doteku. |
| `moveGesture(gesture, at)` | Vrátí tah, když prst ujel aspoň 24 px od počátku. Počátek se pak posune, takže druhý tah bez zvednutí prstu je další tah (během přelézání přidá kruh). |
| `endGesture(gesture, time)` | Bylo to klepnutí? Prst se nepohnul o víc než 10 px a zvedl se do 0,3 s. |

První dotyk zapne dotykové ovladače i na zařízení, které se tvářilo jako počítač.

## `audio/sound.ts`: zvuk

`createSound(enabled)` vrátí `Sound` s metodami `unlock()` a `play(event)`. Zvukové soubory nejsou: každý zvuk je v tabulce `SOUNDS` popsaný jako pár tónů (tvar vlny, výška, začátek, délka, hlasitost) a hraje se oscilátory Web Audio. Havárie přidává bílý šum.

Prohlížeč dovolí zvuk až po gestu uživatele, proto `AudioContext` vzniká v `unlock()`. Do té doby `play()` nic nedělá. Typ `Record<GameEvent, Tone[]>` hlídá, že každá událost má zvuk.

## `storage/storage.ts`: úložiště

| Funkce | Co dělá |
| --- | --- |
| `loadSettings(themeIds)` / `saveSettings(settings)` | Klíč `spider-on.settings`. |
| `loadScores()` / `saveScores(table)` | Klíč `spider-on.scores`. |
| `today()` | Dnešní datum `YYYY-MM-DD` v časovém pásmu hráče. |

Čtení i zápis jsou v `try/catch`. V soukromém okně nebo s plným úložištěm hra běží dál, jen si nic nepamatuje. Kontrolu dat dělají `parseSettings` a `parseScores` z `src/game/`.

## PWA a service worker

### `pwa/serviceWorker.ts` (strana stránky)

`registerServiceWorker(onUpdateReady)` zaregistruje `sw.js`, jen v produkčním buildu (na vývojovém serveru by mezipaměť servírovala staré soubory). Když je připravená nová verze, zavolá `onUpdateReady(apply)`. `apply()` pošle čekajícímu workeru zprávu `skipWaiting` a po převzetí stránku znovu načte. Při každém návratu do popředí se zeptá na novou verzi, protože nainstalovaná hra může být otevřená celé dny.

### `worker/sw.ts` (service worker)

- `install`: uloží do mezipaměti `spider-on-<otisk>` všechny soubory ze seznamu `PRECACHE` jedním `cache.addAll`. Když jediný soubor selže, neuloží se nic.
- Bez `skipWaiting` při instalaci: nová verze čeká, až o ni hráč požádá, aby se soubory neměnily uprostřed hry.
- `activate`: smaže staré mezipaměti a převezme stránku hned při první návštěvě.
- `fetch`: požadavky na vlastní doménu obslouží z mezipaměti. Každá navigace (s `?debug` i bez) dostane `index.html`. `ignoreVary` řeší hlavičku `Vary: Origin` u modulů.

### `pwaPlugin()` ve `vite.config.ts`

Po sestavení vezme všechny soubory bundlu (kromě `sw.js`) a `PUBLIC_FILES`, spočítá z jejich názvů otisk a vloží `const PRECACHE = {...}` na začátek `sw.js`. Názvy souborů v `assets/` obsahují otisk obsahu, takže každá změna hry změní seznam, otisk i samotný `sw.js` a prohlížeč ho nainstaluje jako novou verzi.

`share.png` v `PUBLIC_FILES` záměrně chybí: potřebují ho jen náhledy odkazů, ne hra.

### Manifest a ikony

`public/manifest.webmanifest` určuje název, barvy, `display: fullscreen`, `orientation: landscape` a ikony v `public/app-icons/`. Cesty jsou relativní, aby šly za `base`.
