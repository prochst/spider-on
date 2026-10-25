# 2.4 AI nepřátel a bonusové balíčky

## Cíl

Dát nepřátelům chování, které hráče opravdu ohrožuje, a od 6. kola přidat bonusové balíčky. Všechno náhodné musí jít v testech zopakovat.

## Zadání

Viz [prompty/2-hra/04-ai-a-balicky.md](../../prompty/2-hra/04-ai-a-balicky.md). Agent pracoval podle plánu fáze 2 a kapitol 4 a 7 specifikace. Během práce přišly dva poznatky uživatele z ručního testování: hra je moc rychlá a změna kruhu se špatně trefuje.

## Co agent udělal

- **Náhoda se semínkem** (`src/game/random.ts`). Herní logika nesmí volat `Math.random()`, jinak by testy nešly opakovat. Agent zvolil generátor Mulberry32: dvanáct řádků, které se dají přečíst a vysvětlit. Semínko vybere prohlížeč při spuštění. S `?debug&seed=123` v adrese jde stejnou hru přehrát znovu. Test „stejné semínko, stejná hra“ odehraje 20 sekund se zatáčením dvakrát a výsledný stav porovná.
- **AI nepřátel** (`src/game/ai.ts`). Přesně podle specifikace: ve chvíli, kdy nepřítel dorazí na přechodové vlákno, s pravděpodobností `p` přeleze o jeden kruh směrem ke kruhu, kam hráč míří. `p` je 0,6 na stupni 1, roste o 0,05 a končí na 0,95. „Kam hráč míří“ znamená konec rozpracovaného přelézání, kruh zapamatovaného pokynu, jinak hráčův kruh. Nepřítel tak reaguje i na hráčův úmysl, ne jen na jeho polohu.
- **Rozhodnutí přesně na vlákně.** Do `spider.ts` přibyla funkce `reachesGate`, která řekne, jestli pavouk v tomto kroku dorazí na vlákno. Teprve tehdy si nepřítel vybere. Dřívější rozhodnutí (při vjezdu do 15° zóny) by reagovalo na zastaralou polohu hráče.
- **Bonusové balíčky** (`src/game/bonus.ts`). Od 6. kola se po náhodné době 5 až 20 s objeví balíček místo náhodné mouchy na protější polovině pavučiny. Zmizí, když ho hráč sní, nebo když kolem něj proleze po jiném kruhu. Obsah se losuje 75 / 22 / 3 %: 250 bodů, zpomalení nepřátel na polovinu do doby, než hráč oběhne celý kruh, nebo život navíc (nejvýš 5). Po srážce balíček i zpomalení zmizí.
- **Neonový vzhled balíčků** (`src/render/bonus.ts`), jak bylo domluveno na konci fáze 1: každý obsah má vlastní tvar i barvu, aby je hráč rozeznal na první pohled. Body jsou zlatý kosočtverec s jiskrou, zpomalení modré přesýpací hodiny v rámečku, život růžové srdce. Balíčky jemně pulzují, aby se odlišily od much. Zpomalení nepřátelé zmodrají do barvy balíčku se zpomalením.
- **Zpomalení o 40 % a pak o dalších 20 %.** Na pokyn uživatele klesla základní rychlost z 0,7 na 0,42 a pak na 0,336 R/s. Nepřátelé mají rychlost jako násobek hráčovy, takže zpomalili s ní. Agent změny nejdřív zapsal do specifikace (verze 0.6 a 0.7), pak upravil jednu konstantu v `config.ts`.
- **Snazší změna kruhu.** Uživatel napsal, že se těžko trefuje do zóny před vláknem a „změna vlevo a vpravo se mi nepovedla vůbec“. Agent to vyložil tak, že u bočních vláken zkoušel šipky vlevo a vpravo, které hra neznala. Přidal proto funkci `turnForDirection`: směr na obrazovce porovná se směrem vlákna, ke kterému pavouk míří. U pravého vlákna je šipka vpravo „ven“, vlevo „dovnitř“. Stejné pravidlo specifikace předepisuje pro tah po touchpadu, takže ho kapitola 2.6 použije znovu. Zónu pro zapamatování pokynu agent rozšířil z 15° na 30°. Spolu se zpomalením má hráč na vnějším kruhu na stisk 1,4 s místo původních 0,34 s. Protože 15° bylo výslovné rozhodnutí uživatele z kapitoly 1.1, agent mu změnu předložil k potvrzení a uživatel ji schválil.

## Kde se agent spletl

- **Testy s natvrdo zapsaným časem, dvakrát.** Po prvním zpomalení selhaly 2 ze 110 testů, které čekaly pevně zapsaný počet sekund. Agent je přepsal na výpočet z konstant a napsal o tom poučení. Po druhém zpomalení ale selhalo dalších 10 testů: všechny používaly `simulate(game, 0.5)` jako „dost dlouho na první mouchu“. Agent tehdy opravil jen testy, které spadly, a podobná místa nehledal. Teď je nahradil pomocnou funkcí `timeToCrawl(stupně)`, která čas počítá z rychlosti a poloměru kruhu.
- **Testovaná verze nebyla ta opravená.** Uživatel po prvním zpomalení napsal „stále velká rychlost“. Na webu ale ještě běžela verze bez zpomalení, protože pull request kapitoly 2.4 nebyl sloučený a GitHub Pages nasazuje jen `main`. Agent to měl říct hned u první změny. Uživatel tak dostal zpomalení o 52 % najednou a možná ho bude chtít vrátit.
- **Mezera ve specifikaci: poslední moucha.** Kdyby balíček nahradil poslední nesebranou mouchu, kolo by v tu chvíli skončilo samo, bez hráčova přičinění. Specifikace to neřešila. Agent přidal pravidlo, že balíček poslední mouchu nikdy nebere (verze 0.6), a test, který to hlídá.
- **Zavádějící náhled.** Pro ukázku balíčků agent v prohlížeči ručně vložil balíček na místo mouchy, ale mouchu nesmazal. Náhled pak ukazoval mouchu prosvítající balíčkem, jako by šlo o chybu vykreslování. Ve hře ta situace nenastane, protože `spawnPackage` mouchu označí jako sebranou. Agent náhled udělal znovu správně. Ponaučení: když testovací skript obchází herní logiku, musí udělat všechno, co by udělala ona.

## Lidská kontrola

- **Ruční testování sloučené verze.** Uživatel hru po kapitole 2.3 zkoušel a poslal, že je moc rychlá a změna kruhu se špatně trefuje. To unit testy nepoznají: hlídají pravidla, ne pocit ze hry.
- **Šířka zóny.** Agent nabídl tři možnosti (15°, 30°, 45°) a doporučil 30°. Uživatel zvolil 30°.
- **Vzhled balíčků.** Agent ho ukazuje v pull requestu na náhledu, uživatel rozhodne, jestli tvary a barvy sedí.
- **Upřesnění specifikace 0.6**: balíček nebere poslední mouchu a nepřítel se rozhoduje ve chvíli příchodu na vlákno.

## Metriky

- Nové soubory: 7 v `src/` (náhoda, AI, balíčky, vykreslení balíčků, 3 testy), upravených 9.
- Testy: 114 (33 nových), všechny procházejí.
- Velikost sestavené hry: 17,0 kB JavaScriptu (6,5 kB po kompresi).
- Iterace: dvě kola poznatků uživatele, oprava 2 a pak 10 testů, dva pokusy o náhled balíčků.

## Poučení

- Náhodu v logice předávej jako parametr. Testy pak můžou dosadit „vždy ano“ nebo „vždy ne“ a hra se dá přehrát ze semínka.
- Časy a vzdálenosti v testech počítej z konstant. Laditelné hodnoty se změní, jakmile člověk hru poprvé zkusí.
- Ruční hraní odhalí věci, na které testy nemají měřítko: tempo, obtížnost, čitelnost. Hraj sloučenou verzi po každé kapitole.
- Když opravuješ chybu, hledej i stejná místa, která zatím nespadla. Agent po první opravě testů přepsal jen dva rozbité, a o kolo později spadlo deset dalších se stejnou chybou.
- Ujasni si, kterou verzi člověk zkouší. Bez nasazení každého pull requestu zvlášť vidí na webu jen `main`.
