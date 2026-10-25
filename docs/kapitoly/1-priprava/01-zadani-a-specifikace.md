# 1.1 Od nápadu ke specifikaci

## Cíl

Z nápadu „klon staré arkády pro web a mobily“ udělat konkrétní zadání: pravidla hry, technologii, grafický styl, název a plán celé práce.

## Zadání

Doslovná zadání jsou v [prompty/1-priprava/01-zadani-a-specifikace.md](../../prompty/1-priprava/01-zadani-a-specifikace.md). Celá kapitola proběhla během jednoho dopoledne (25. 10. 2026, zhruba 08:30 až 11:10) v sedmi zprávách uživatele.

## Co agent udělal

1. **Rešerše originálu.** Agent prošel stránku o hře Head On (Sega/Gremlin, 1979) na Wikipedii a podrobnější popis na arcade-history.com. Zjistil pravidla, která na Wikipedii chybí: 5 pruhů, 140 teček po 5 bodech, jedno tlačítko plynu a tabulku obtížnosti podle počtu a rychlosti aut.
2. **Plánovací dokument.** Místo dlouhé odpovědi v chatu založil sdílený dokument s pravidly hry, doporučenou technologií, právními otázkami klonu a návrhem výukové dokumentace. Na konci se zeptal, jestli má začít, a sám nic nezakládal.
3. **Srovnání technologií.** Na žádost uživatele rozšířil srovnání na šest stacků (Phaser, PixiJS, čistý Canvas, Godot, Flutter, Unity) s tabulkou kritérií a tabulkou pro a proti. Rozhodujícím kritériem bylo, jestli agent v cloudu dokáže hru sestavit a otestovat bez grafického editoru.
4. **Vývoj jen přes GitHub.** Vysvětlil, že pro webovou verzi není potřeba žádné lokální prostředí, popsal cyklus úkol → pull request → GitHub Actions → GitHub Pages a ukázal workflow pro nasazení. Verze akcí ověřil v dokumentaci GitHubu.
5. **Grafický styl.** Uživatel přišel s nápadem pavouků na kruhové pavučině. Agent navrhl, jak pravidla originálu přenést (kruhy jako pruhy, radiální vlákna jako přechody, mouchy jako tečky), nabídl čtyři styly a na požádání vytvořil animovaný náhled dvou z nich přímo v Canvasu.
6. **Specifikace.** Z rozhodnutí sepsal [specifikaci hry](../../specifikace.md) se všemi čísly, která bude kód potřebovat, a s otevřenými otázkami pro uživatele.

## Kde se agent spletl

- **Godot.** V prvním srovnání agent uvedl, že scény v Godotu jsou binární a agent je nevidí. To není pravda, formát `.tscn` je textový. Chybu sám opravil při rozšiřování srovnání, skutečná nevýhoda je v tom, že se Godot ladí v grafickém editoru.
- **Doporučení stacku.** Agent nejdřív doporučil Phaser kvůli pohodlí. Uživatel zvolil čistý Canvas, protože u výukového projektu je důležitější, aby čtenář viděl každý řádek. Agent měl výukový cíl zvážit už v doporučení.
- **Formátování.** Při úpravě dokumentu omylem převedl celý odstavec na kód, protože nahrazovaný text sousedil s formátovaným kódem. Všiml si toho v odpovědi editoru a opravil to.
- **Připojení repozitáře.** Při prvním pokusu o připojení repozitáře agent zjistil, že GitHub účet uživatele není s Claude propojený. Uživatel musel propojení udělat sám.

## Lidská kontrola

Uživatel dělal všechna rozhodnutí, která mění cíl projektu: technologii, rozdělení do fází, grafický styl, název a vytvoření repozitáře. Agent u každého nabídl doporučení s důvodem, ale nerozhodoval za něj.

## Metriky

- Čas: asi 2,5 hodiny včetně pauz uživatele.
- Zprávy uživatele: 7 (+1 omylem odeslaná nedokončená zpráva).
- Výstupy: plánovací dokument, animovaný náhled stylů, specifikace hry.

## Poučení

- Požádej agenta nejdřív o názor a plán. Rozhodnutí pak děláš ty s podklady v ruce.
- Faktická tvrzení agenta ověřuj, i když znějí sebejistě.
- U vizuálních rozhodnutí si nech udělat ukázku. Rozhoduje se nad ní mnohem rychleji než nad popisem.
