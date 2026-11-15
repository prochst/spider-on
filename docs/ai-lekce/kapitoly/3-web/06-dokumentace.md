# 3.6 Programátorská dokumentace

## Cíl

Oddělit výukový materiál o vývoji s AI od dokumentace samotné hry a sepsat programátorskou dokumentaci: technologie, postupy, strukturu projektu, knihovny a popis hlavních funkcí a jejich provázání.

## Zadání

Viz [prompty/3-web/06-dokumentace.md](../../prompty/3-web/06-dokumentace.md).

## Co agent udělal

- **Navázal na nesloučenou kapitolu 3.5.** Pull request s vlastním hostingem byl ještě otevřený a měnil přesně to, co má dokumentace popisovat (adresu hry, složku ikon, workflow vydání, nový `docs/nasazeni.md`). Agent proto založil větev na jeho větvi, ne na `main`. Dokumentace tak od začátku popisuje stav po sloučení 3.5 a nevznikne konflikt v souborech, které oba pull requesty mění.
- **Přesun přes `git mv`.** `00-uvod.md`, `lekce.md`, `kapitoly/` a `prompty/` šly do `docs/ai-lekce/`, takže Git přesun vidí jako přejmenování a historie souborů zůstává. Relativní odkazy mezi kapitolami, zadáními a lekcemi se přesunuly spolu a fungují dál. Rozbily se jen odkazy ven: na `specifikace.md` a na postup nasazení.
- **Postup nasazení do `dev-docs`.** `docs/nasazeni.md` z kapitoly 3.5 není výukový materiál, ale návod k projektu, takže patří k programátorské dokumentaci (`docs/dev-docs/nasazeni.md`).
- **Opravené odkazy** v `README.md`, `CLAUDE.md` (cesty pro kapitoly, zadání a lekce, nasazení), `specifikace.md`, `release.yml`, úvodu a kapitolách 1.1 a 3.5. Agent si napsal krátký skript, který projde všechny odkazy v Markdownu včetně kotev (`#nadpis`) a ověří, že cíl existuje.
- **Programátorská dokumentace** v `docs/dev-docs/`:
  - `README.md`: shrnutí technologií (tabulka s důvodem volby), hlavní postupy, obsah a rychlý start,
  - `struktura-projektu.md`: strom složek s popisem každého souboru, tabulka „co kam patří“,
  - `knihovny.md`: vývojové závislosti s verzemi, konfigurace TypeScriptu, Vite, Vitestu a Playwrightu, přibalené písmo a použitá API prohlížeče,
  - `architektura.md`: vrstvy a pravidla mezi nimi, stav hry, herní smyčka, tok vstupu, krok simulace, graf obrazovek, ukládání, offline a návody „jak přidat…“,
  - `herni-logika.md`: každý modul `src/game/` s typy, funkcemi a příkladem použití,
  - `prohlizecova-vrstva.md`: `main.ts`, vykreslování, rozhraní šablony, menu, vstup, zvuk, úložiště a service worker,
  - `testovani.md`: unit a E2E testy, ladicí režim, pomocné skripty a co automaticky otestovat nejde.
- **Diagramy v Mermaidu.** GitHub je vykreslí přímo v náhledu souboru a v textu zůstávají čitelné a upravitelné, na rozdíl od obrázků.
- **Pravidlo pro budoucí změny.** `CLAUDE.md` nově říká, že změna struktury, závislostí nebo provázání modulů upraví i `docs/dev-docs/` ve stejném pull requestu. Bez toho by dokumentace zastarala s první další kapitolou.

## Kde se agent spletl

- **Popis testů z názvů souborů.** První verze tabulky E2E testů vznikla odhadem podle názvů souborů. U `storage.spec.ts` uváděla test poškozeného úložiště, který neexistuje (poškozená data testují unit testy `parseSettings` a `parseScores`). Agent tabulku opravil, až když si vypsal skutečné názvy testů. Dokumentace, která popisuje kód, se musí psát z kódu, ne z dojmu.
- **Zaokrouhlená fyzika.** O pevném kroku agent nejdřív napsal, že na 144 Hz displeji běží „střídavě nula a jeden krok“. Při 1/144 s na snímek a kroku 1/120 s je to většinou jeden krok a občas žádný. Drobnost, ale přesně takové nepřesnosti čtenáře zmatou, když si to přepočítá.

## Lidská kontrola

- Projít `docs/dev-docs/README.md` a rozhodnout, jestli úroveň podrobnosti sedí. Popis funkcí je podrobný, s kódem se bude muset udržovat.
- Ověřit na GitHubu, že se diagramy Mermaid vykreslují.
- Pull request staví na kapitole 3.5. Sloučit nejdřív 3.5, pak tento.

## Metriky

- Čas: asi hodina od zadání po pull request.
- Přesunuté soubory: 33 (úvod, lekce, 15 kapitol, 15 zadání a postup nasazení).
- Nové soubory: 7 v `docs/dev-docs/`, kapitola a zadání.
- Kód beze změny, testy beze změny.

## Poučení

- Dokumentaci k nesloučené změně stav na její větvi. Popíše správný stav a nevznikne konflikt.
- Přesun složky s relativními odkazy rozbije jen odkazy ven z ní. Ty najdi skriptem, ne očima.
- Programátorskou dokumentaci piš z kódu a ke každému tvrzení si najdi místo, kde to kód dělá.
