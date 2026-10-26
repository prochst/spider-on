# 2.7 Zvuk, nastavení a tabulka výsledků

## Cíl

Dokončit hru jako celek: syntetizované zvuky, obrazovka Nastavení (jméno, vzhled, zvuk) a tabulka deseti nejlepších her uložená v zařízení. Úvod ukáže nejlepší skóre a konec hry umístění v tabulce.

## Zadání

Viz [prompty/2-hra/07-zvuk-nastaveni-vysledky.md](../../prompty/2-hra/07-zvuk-nastaveni-vysledky.md). Uživatel napsal jen „Ovládání na mobilu je OK. Pokračuj.“ Obsah dal plán fáze 2 a specifikace.

## Co agent udělal

- **Nejdřív specifikace (verze 0.15).** Kapitoly 10, 12 a 13 nechávaly otevřené otázky, na které kód musí odpovědět: Co když dvě hry mají stejné skóre? Zapíše se hra s nulou? Kdy přesně zazní přelezení kruhu? Je zvuk ve výchozím stavu zapnutý? Ukládá se nastavení hned, nebo tlačítkem? Agent odpovědi zapsal: při shodě je výš starší výsledek, nula se nezapisuje, hra ukončená volbou Zpět do menu taky ne, přelezení zní při začátku každého lezení na další kruh, zvuk je zapnutý a každá změna nastavení platí hned.
- **Tabulka a nastavení jako čistá logika** (`src/game/scores.ts`, `src/game/settings.ts`). Zařazení výsledku, nejlepší skóre, úprava jména (ořez mezer, nejvýš 16 znaků, prázdné jméno se neuloží) a čtení uložených dat jsou funkce bez prohlížeče, takže mají testy. Datum přichází zvenku, logika nesmí volat `Date`.
- **Uložená data nejsou důvěryhodná.** Tabulka v `localStorage` mohla vzniknout ve starší verzi nebo se poškodit. `parseScores` proto vyhodí rozbité řádky a zbytek znovu seřadí a ořízne na deset. `parseSettings` doplní chybějící nebo nesmyslné hodnoty výchozími. Samotné čtení a zápis (`src/storage/`) jsou v `try/catch`: v anonymním okně nebo se zablokovaným úložištěm hra běží dál, jen si nic nepamatuje.
- **Události pro zvuk.** Logika nesmí přehrávat zvuk, ale ví, kdy se co stalo. Hra proto sbírá události (`fly`, `bonus`, `climb`, `crash`, `roundClear`, `gameOver`) do seznamu `game.events` a `main.ts` je jednou za snímek přehraje a seznam vyprázdní. Testy kontrolují, že události vznikají ve správnou chvíli, třeba že pokračování v lezení o další kruh je druhé `climb`.
- **Zvuky bez souborů** (`src/audio/sound.ts`). Každý zvuk je pár tónů popsaných daty: tvar vlny, výška, začátek, délka, hlasitost. Srážka přidá bílý šum. Moucha je nejtišší a nejkratší, protože zní nejčastěji. Více much v jednom snímku zazní jednou. Prohlížeče pustí zvuk až po gestu hráče, proto se `AudioContext` vytvoří při prvním dotyku nebo stisku klávesy.
- **Konec hry zapíše výsledek.** Událost `gameOver` zařadí hru do tabulky pod jménem z nastavení a dnešním datem. Obrazovka Konec hry pak ukáže „3. místo v tabulce výsledků“, nebo že to tentokrát nestačilo.
- **Obrazovky.** Nastavení je HTML formulář (pole se jménem, výběr vzhledu, přepínač zvuku), takže psaní, fokus a čtečky obrazovky řeší prohlížeč. Výběr vzhledu má zatím jen Neon, Čmáranice se do seznamu jen přidá. Výsledky jsou tabulka s pořadím, jménem, skóre, kolem a datem ve formátu „26. 10. 2026“.
- **Ověření v prohlížeči** skriptem: jméno se ořízne, prázdné se vrátí na předchozí, nastavení přežije obnovení stránky, po třech srážkách se hra zapíše na 1. místo, úvod ukáže nejlepší skóre. Počet vytvořených oscilátorů ukázal, že zvuky hrají (moucha 1, srážka 1, konec hry 4) a že po vypnutí zvuku nehraje nic.

## Kde se agent spletl

- **Tabulka se na telefon nevešla.** Deset řádků s nadpisem a tlačítkem bylo na telefonu na šířku (390 px) o 40 px vyšší než obrazovka a tlačítko Zpět bylo uříznuté. Agent přidal posouvání panelu jako pojistku a pro nízké obrazovky zmenšil okraje, nadpis a řádky. Teď se vejde celá.
- **Výběr vzhledu užší než pole se jménem.** Stejná šířka v CSS, ale jiný výpočet okraje (`box-sizing`). Bylo to vidět až na snímku.
- **Délka jména a emoji.** Délka textu v JavaScriptu počítá části znaků UTF-16, takže emoji se počítá jako dva znaky. Ořez jména proto počítá skutečné znaky, test to hlídá. Omezení přímo v políčku formuláře (`maxlength`) ale počítá po staru. U emoji tak políčko pustí jen 8 pavouků místo 16. Agent to nechal, je to okrajový případ.
- **Typ pro `autocomplete`.** První verze nastavila políčku `autocomplete = "nickname"`, které TypeScript u vlastnosti nepřijal. Kontrola typů to chytila hned. Agent automatické vyplňování vypnul, u jména do hry nedává smysl.

## Lidská kontrola

- **Jak zvuky zní.** Testy a skript ověří, že zvuky hrají ve správnou chvíli, ale ne, jestli nejsou otravné, moc hlasité nebo moc tiché. Tóny jsou data na začátku `sound.ts` a dají se snadno přeladit.
- **Pravidla tabulky**, která agent doplnil do specifikace (shoda skóre, nulové skóre, ukončení přes menu). Pokud uživatel chce jinak, změní se jedna funkce a její testy.

## Metriky

- Nové soubory: 6 v `src/` (tabulka, nastavení, 2 testy, úložiště, zvuk), změněno 6.
- Testy: 148 (19 nových), všechny procházejí.
- Velikost sestavené hry: 30,6 kB JavaScriptu (11,9 kB po kompresi).
- Iterace: jedna úprava vzhledu po snímcích (tabulka na telefonu, šířka výběru).

## Poučení

- Specifikace psaná člověkem nechává otevřené okrajové případy (shoda skóre, nula, ukončení hry). Agent je musí najít a rozhodnout, a rozhodnutí patří do specifikace, aby je člověk viděl a mohl změnit.
- Data z úložiště čti jako cizí vstup. Co si hra uložila včera, nemusí dnes odpovídat kódu.
- Logika nemusí umět přehrát zvuk, stačí, když řekne, co se stalo. Seznam událostí drží hranici mezi logikou a prohlížečem a dá se testovat.
