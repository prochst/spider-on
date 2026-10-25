# 2.4 AI nepřátel a bonusové balíčky

## Cíl

Dát nepřátelům chování, které hráče opravdu ohrožuje, a od 6. kola přidat bonusové balíčky. Všechno náhodné musí jít v testech zopakovat.

## Zadání

Viz [prompty/2-hra/04-ai-a-balicky.md](../../prompty/2-hra/04-ai-a-balicky.md). Agent pracoval podle plánu fáze 2 a kapitol 4 a 7 specifikace. Během práce přišel první poznatek uživatele z ručního testování: zpomalit pohyb o 40 %.

## Co agent udělal

- **Náhoda se semínkem** (`src/game/random.ts`). Herní logika nesmí volat `Math.random()`, jinak by testy nešly opakovat. Agent zvolil generátor Mulberry32: dvanáct řádků, které se dají přečíst a vysvětlit. Semínko vybere prohlížeč při spuštění. S `?debug&seed=123` v adrese jde stejnou hru přehrát znovu. Test „stejné semínko, stejná hra“ odehraje 20 sekund se zatáčením dvakrát a výsledný stav porovná.
- **AI nepřátel** (`src/game/ai.ts`). Přesně podle specifikace: ve chvíli, kdy nepřítel dorazí na přechodové vlákno, s pravděpodobností `p` přeleze o jeden kruh směrem ke kruhu, kam hráč míří. `p` je 0,6 na stupni 1, roste o 0,05 a končí na 0,95. „Kam hráč míří“ znamená konec rozpracovaného přelézání, kruh zapamatovaného pokynu, jinak hráčův kruh. Nepřítel tak reaguje i na hráčův úmysl, ne jen na jeho polohu.
- **Rozhodnutí přesně na vlákně.** Do `spider.ts` přibyla funkce `reachesGate`, která řekne, jestli pavouk v tomto kroku dorazí na vlákno. Teprve tehdy si nepřítel vybere. Dřívější rozhodnutí (při vjezdu do 15° zóny) by reagovalo na zastaralou polohu hráče.
- **Bonusové balíčky** (`src/game/bonus.ts`). Od 6. kola se po náhodné době 5 až 20 s objeví balíček místo náhodné mouchy na protější polovině pavučiny. Zmizí, když ho hráč sní, nebo když kolem něj proleze po jiném kruhu. Obsah se losuje 75 / 22 / 3 %: 250 bodů, zpomalení nepřátel na polovinu do doby, než hráč oběhne celý kruh, nebo život navíc (nejvýš 5). Po srážce balíček i zpomalení zmizí.
- **Neonový vzhled balíčků** (`src/render/bonus.ts`), jak bylo domluveno na konci fáze 1: každý obsah má vlastní tvar i barvu, aby je hráč rozeznal na první pohled. Body jsou zlatý kosočtverec s jiskrou, zpomalení modré přesýpací hodiny v rámečku, život růžové srdce. Balíčky jemně pulzují, aby se odlišily od much. Zpomalení nepřátelé zmodrají do barvy balíčku se zpomalením.
- **Zpomalení o 40 %.** Na pokyn uživatele klesla základní rychlost z 0,7 na 0,42 R/s. Nepřátelé mají rychlost jako násobek hráčovy, takže zpomalili s ní. Agent změnu nejdřív zapsal do specifikace (verze 0.6), pak upravil jednu konstantu v `config.ts`.

## Kde se agent spletl

- **Testy s natvrdo zapsaným časem.** Po zpomalení selhaly 2 ze 110 testů. Oba čekaly pevně zapsaný počet sekund (1,9 s do zóny před vláknem, 7,5 s do konce kola), spočítaný pro starou rychlost. Agent je přepsal tak, aby čas počítaly z konstant (`PLAYER_SPEED`, `TURN_ZONE`, poloměr kruhu). Další ladění rychlosti je už nerozbije.
- **Mezera ve specifikaci: poslední moucha.** Kdyby balíček nahradil poslední nesebranou mouchu, kolo by v tu chvíli skončilo samo, bez hráčova přičinění. Specifikace to neřešila. Agent přidal pravidlo, že balíček poslední mouchu nikdy nebere (verze 0.6), a test, který to hlídá.
- **Zavádějící náhled.** Pro ukázku balíčků agent v prohlížeči ručně vložil balíček na místo mouchy, ale mouchu nesmazal. Náhled pak ukazoval mouchu prosvítající balíčkem, jako by šlo o chybu vykreslování. Ve hře ta situace nenastane, protože `spawnPackage` mouchu označí jako sebranou. Agent náhled udělal znovu správně. Ponaučení: když testovací skript obchází herní logiku, musí udělat všechno, co by udělala ona.

## Lidská kontrola

- **Ruční testování sloučené verze.** Uživatel hru po kapitole 2.3 zkoušel a jako první poznatek poslal, že je moc rychlá. To unit testy nepoznají: hlídají pravidla, ne pocit ze hry.
- **Vzhled balíčků.** Agent ho ukazuje v pull requestu na náhledu, uživatel rozhodne, jestli tvary a barvy sedí.
- **Upřesnění specifikace 0.6**: balíček nebere poslední mouchu a nepřítel se rozhoduje ve chvíli příchodu na vlákno.

## Metriky

- Nové soubory: 7 v `src/` (náhoda, AI, balíčky, vykreslení balíčků, 3 testy), upravených 9.
- Testy: 110 (29 nových), všechny procházejí.
- Velikost sestavené hry: 17,0 kB JavaScriptu (6,5 kB po kompresi).
- Iterace: jedna změna laditelné hodnoty podle uživatele, oprava 2 testů, dva pokusy o náhled balíčků.

## Poučení

- Náhodu v logice předávej jako parametr. Testy pak můžou dosadit „vždy ano“ nebo „vždy ne“ a hra se dá přehrát ze semínka.
- Časy a vzdálenosti v testech počítej z konstant. Laditelné hodnoty se změní, jakmile člověk hru poprvé zkusí.
- Ruční hraní odhalí věci, na které testy nemají měřítko: tempo, obtížnost, čitelnost. Hraj sloučenou verzi po každé kapitole.
