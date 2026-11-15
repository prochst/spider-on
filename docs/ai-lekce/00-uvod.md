# Spider On: vývoj hry s AI agentem

Tento materiál krok za krokem ukazuje, jak vznikla hra Spider On ve spolupráci člověka a AI agenta (Claude). Nejde o návod „jak nechat AI udělat hru“, ale o záznam skutečné práce: co jsme agentovi zadali, co udělal, kde se spletl a co musel ohlídat člověk.

## Jak materiál číst

Vývoj má pět fází. Každá fáze má složku v `docs/ai-lekce/kapitoly/` a každá kapitola odpovídá jednomu pull requestu v repozitáři. Kapitolu tak můžeš číst vedle konkrétních změn v kódu.

| Fáze | Složka | Obsah |
| --- | --- | --- |
| 1. Příprava projektu a zadání | `kapitoly/1-priprava/` | Rešerše, volba technologie, specifikace hry, založení repozitáře |
| 2. Kostra hry, logika a grafika | `kapitoly/2-hra/` | Herní smyčka, pavučina, pohyb, AI, vykreslování, šablony vzhledu, vstup, zvuk |
| 3. Webová verze | `kapitoly/3-web/` | Responzivita, PWA, E2E testy, vydání na vlastním hostingu, programátorská dokumentace |
| 4. Android a Google Play | `kapitoly/4-android/` | Capacitor, build v GitHub Actions, podepisování, publikace |
| 5. iOS a App Store | `kapitoly/5-ios/` | Build na macOS, TestFlight, App Review, závěrečné zhodnocení |

Další soubory:

- [`docs/specifikace.md`](../specifikace.md): pravidla hry, ze kterých agent vychází.
- [`docs/ai-lekce/prompty/`](prompty/): doslovná zadání, která agent dostal.
- [`docs/ai-lekce/lekce.md`](lekce.md): průběžný seznam poučení.
- [`docs/dev-docs/`](../dev-docs/README.md): programátorská dokumentace, tedy jak je hra postavená, bez příběhu o vývoji.
- `CLAUDE.md` v kořeni repozitáře: stálá pravidla projektu pro agenta.

## Osnova kapitoly

Každá kapitola má stejnou strukturu:

1. **Cíl**: jednou větou, čeho má kapitola dosáhnout.
2. **Zadání**: odkaz na doslovný prompt v `docs/ai-lekce/prompty/`.
3. **Co agent udělal**: plán, klíčová rozhodnutí, odkaz na pull request.
4. **Kde se agent spletl**: chyby, slepé uličky a jak se opravily.
5. **Lidská kontrola**: co člověk kontroloval a jak.
6. **Metriky**: čas, počet iterací, rozsah změn.
7. **Poučení**: co si z kapitoly odnést.

## Nástroje

- [Claude Code](https://claude.com/claude-code) v cloudu, ovládaný z prohlížeče a mobilní aplikace Claude. Na vlastním počítači není potřeba nic instalovat.
- GitHub: repozitář, pull requesty, GitHub Actions pro testy a sestavení vydání. Do kapitoly 3.4 také GitHub Pages pro hosting, od kapitoly 3.5 vlastní webhosting.
- TypeScript, Vite, Vitest, čistý Canvas 2D bez herního frameworku.
