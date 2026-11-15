# 2.9 Jak hrát

## Cíl

Přidat na úvodní obrazovku položku Jak hrát. Otevře návod s cílem hry a ovládáním, a to ovládáním toho zařízení, na kterém hráč zrovna hraje.

## Zadání

Viz [prompty/2-hra/09-jak-hrat.md](../../prompty/2-hra/09-jak-hrat.md). Přání přišlo po dokončení fáze 3. Přidává obrazovku hry, proto je to kapitola fáze 2 jako [2.8](08-uroven-obtiznosti.md).

## Co agent udělal

- **Nejdřív specifikace (verze 0.22).** Kapitola 12 má novou obrazovku Jak hrát i s obsahem: co patří do cíle hry, jaké klávesy a jaká gesta. Agent text odvodil z kapitol 3 až 11, takže návod říká totéž co pravidla: 3 životy, změna kruhu jen na čtyřech přechodových vláknech, balíčky od 4. kola. Zapsal i rozhodnutí, na které se zadání neptalo: „mobil nebo počítač“ se pozná stejně jako u dotykových ovladačů (kapitola 11). Notebook s dotykovou obrazovkou proto po prvním dotyku přepne návod na dotyk.
- **Nová obrazovka v logice.** `screens.ts` má obrazovku `help` a událost `openHelp`. Z úvodu se na ni jde, Zpět nebo Esc vrací na úvod. Přechody jsou stejné jako u Výsledků, takže stačily dvě nové větve. Ve funkcích `confirmEvent` a `cancelEvent` TypeScript sám ohlásil, kde nová obrazovka chybí.
- **Oboje ovládání ve stránce.** Návod (`helpText` v `ui/overlay.ts`) obsahuje klávesy i gesta. Kterou část ukázat, rozhoduje CSS podle třídy `touch` na kořeni menu, stejným mechanismem jako řádek „Klepnutí na pravou polovinu spustí kolo“ od kapitoly 2.6. Žádná nová detekce zařízení tedy nevznikla a návod se nemůže rozejít s ovladači.
- **Rozložení pro telefon na šířku.** Telefon na šířku je nízký a široký, proto jsou cíl hry a ovládání vedle sebe. V úzkém okně se skládají pod sebe. Nadpisy částí mají barvu akcentu šablony, ovládání je dvousloupcový seznam „klávesa, co dělá“.
- **Testy.** Unit testy obrazovek znají novou obrazovku i událost (přechody, klávesy, nic se nepozastaví). Nový `e2e/help.spec.ts` běží na počítači i na telefonu. Ověřuje cíl hry, ovládání podle zařízení, Zpět a Esc, přepnutí po prvním dotyku na počítači a to, že se celý návod i s tlačítkem vejde bez posouvání i na nejmenší podporovanou obrazovku 640 × 360. Agent ověřil, že testy umí selhat: bez třídy u části s klávesami zčervenaly testy ovládání a bez zmenšeného písma na nízké obrazovce test místa.

## Kde se agent spletl

- **Návod zakryl tlačítko v rohu.** První verze měla panel široký až 44rem. Na telefonu na šířku pak pravý horní roh panelu zajel pod tlačítko celé obrazovky. Agent to viděl na snímku, žádný test na to nebyl. Panel s návodem teď nechá na obou stranách místo pro rohové tlačítko.
- **Na nejmenší obrazovce se nevešel.** Užší panel se na obrazovce 640 × 360 protáhl do výšky a tlačítko Zpět bylo až po posunutí. Menší písmo pomohlo jen trochu, víc pomohlo zkrátit texty: „změna kruhu ve směru tahu“ místo „přelézt na sousední kruh ve směru tahu“, „Nepřátelé“ místo „Nepřátelští pavouci“. Jestli test „vejde se“ projde, ověřil agent i obráceně: bez zmenšeného písma selže.
- **„Hrát“ je i v „Jak hrát“.** Test hlavní oblasti z kapitoly 3.4 hledal tlačítko podle názvu „Hrát“. Playwright ve výchozím stavu hledá podřetězec, takže teď našel dvě tlačítka a selhal. Stejná chyba čekala ve skriptu `scripts/share-image.mjs`, který by po spuštění klikl na nejednoznačné tlačítko. Obě místa teď hledají přesný název (`exact: true`). Pomocná funkce `menuButton` v E2E testech to dělala správně od začátku.

## Lidská kontrola

- **Texty návodu.** Jestli je cíl hry srozumitelný pro někoho, kdo hru nikdy neviděl, a jestli tón sedí ke hře. Texty jsou v konstantách `GOAL`, `KEY_CONTROLS` a `TOUCH_CONTROLS` v `src/ui/overlay.ts`.
- **Telefon v ruce.** Návod by měl ukázat gesta, ne klávesy, a vejít se na obrazovku bez posouvání.
- **Notebook s dotykovou obrazovkou**, pokud je po ruce: po prvním dotyku se návod přepne na gesta.

## Metriky

- Čas: asi 45 minut od zadání po pull request.
- Nové soubory: `e2e/help.spec.ts`, výuková kapitola a zadání. Změněno 15 souborů (logika, menu, styly, specifikace, programátorská dokumentace, testy).
- Testy: 158 unit testů (stávající rozšířené o novou obrazovku), 48 E2E testů a 4 přeskočené (7 nových v obou projektech, 3 z nich na jednom projektu přeskočené, protože nedávají smysl, například Esc na telefonu).
- Snímky: počítač, telefon na šířku, 640 × 360 a úzké okno.

## Poučení

- Když má něco záviset na zařízení, použij rozhodnutí, které hra už dělá jinde. Druhá detekce „je to mobil?“ by se dřív nebo později rozešla s první.
- Text v menu je taky rozložení. Na malé obrazovce pomohlo zkrátit věty víc než zmenšit písmo.
- Hledej prvky podle přesného názvu. Nové tlačítko „Jak hrát“ rozbilo test, který hledal „Hrát“.
