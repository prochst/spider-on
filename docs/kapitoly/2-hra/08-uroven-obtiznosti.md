# 2.8 Úroveň obtížnosti

## Cíl

Přidat do úvodního menu volbu Úroveň obtížnosti: lehká hra začíná 1. kolem, střední na 4 kruzích se 3 pomalými nepřáteli, těžká na 5 kruzích se 3 rychlými.

## Zadání

Viz [prompty/2-hra/08-uroven-obtiznosti.md](../../prompty/2-hra/08-uroven-obtiznosti.md). Přání přišlo z ručního testu mezi kapitolami fáze 3. Mění pravidla hry, proto je to kapitola fáze 2.

## Co agent udělal

- **Nejdřív porovnal zadání s tabulkou.** Uživatel napsal „střední začíná 6. kolem (4 kruhy, 3 pomalí)“ a „těžká 9. kolem (5 kruhů, 3 rychlí)“. Podle tabulky ve specifikaci ale kolo 6 hraje stupeň obtížnosti 5 (2 rychlí) a kolo 9 je ještě na 4 kruzích. Tři pomalí jsou až v kole 7. Pět kruhů se třemi rychlými je až v kole 14, protože větší pavučina začíná o stupeň lehčí. Agent rozpor nevyřešil potichu. Položil uživateli otázku s doporučením (popis je důležitější než číslo) a mezitím pracoval podle doporučené varianty. Uživatel ji potvrdil.
- **Specifikace (verze 0.16).** Kapitola 6 má novou tabulku úrovní, kapitola 10 úroveň v tabulce výsledků a kapitola 12 volbu v úvodu. Agent zapsal i důsledky, na které se zadání neptalo: číslo kola je skutečné (bonus za kolo 14 je 1 400 bodů, balíčky se objevují hned), volba se pamatuje a platí pro Hrát znovu.
- **Úroveň jen vybírá začáteční kolo.** V kódu už existoval „stupeň obtížnosti“ (`level`, určuje nepřátele). Nová volba se proto jmenuje `Difficulty` a komentář vysvětluje rozdíl. Začáteční kola jsou laditelná konstanta `START_ROUND` v `config.ts`. Zbytek hry se nemění: kolo 7 na střední úrovni je stejné jako kolo 7 na lehké.
- **Logika o nastavení neví.** Hra má pole `game.difficulty`, které `main.ts` drží podle nastavení, podobně jako plyn. Příkaz Hrát z něj založí novou hru a úroveň si hra zapamatuje i v `session`, aby se do tabulky zapsala ta, se kterou hra začala.
- **Tabulka výsledků má sloupec Úroveň.** Výsledky uložené dřív úroveň nemají. Hra je načte jako lehké, protože tehdy vždy začínala 1. kolem. Řádek s neznámou úrovní se zahodí jako každý jiný poškozený řádek.
- **Volba v menu je rozbalovací seznam** se stejným vzhledem jako ve formuláři Nastavení. Fokus zůstává na tlačítku Hrát, takže Enter pořád hned spustí hru.
- **Testy.** Unit testy opisují tabulku ze specifikace (úroveň, kolo, počet kruhů, rychlosti nepřátel), ověřují Hrát znovu a bonus za kolo 14. Nový E2E soubor `e2e/difficulty.spec.ts` vybere úroveň v prohlížeči, ověří kolo a pavučinu, uložení po obnovení stránky a sloupec v tabulce výsledků.

## Kde se agent spletl

- **Šipky v rozbalovacím seznamu nefungovaly.** Klávesnice hry bere šipky jako řízení pavouka a zastaví jejich výchozí chování. Výjimku měla jen textová pole. Seznam úrovní by tak šipkami nešel přepnout. Stejná chyba byla od kapitoly 2.7 i u výběru vzhledu v Nastavení, jen si jí nikdo nevšiml, protože seznam má zatím jedinou položku. Agent ji našel při psaní volby, ne testem. Oprava platí pro oba seznamy, E2E test hlídá šipky ve volbě úrovně.
- **Úroveň zarovnaná doprava.** V tabulce výsledků jsou čísla zarovnaná doprava a nový textový sloupec to zdědil. Bylo to vidět až na snímku z telefonu.
- **Testovací data se nevešla do pravidel.** Pro snímek plné tabulky agent použil jméno se 17 znaky. Hra ho při načtení správně zahodila (jméno má nejvýš 16), takže tabulka byla prázdná. Kontrola vstupu z kapitoly 2.7 tak zafungovala i proti agentovi.

## Lidská kontrola

- **Rozpor v zadání** rozhodl uživatel: platí popis plochy, ne čísla kol.
- **Jestli jsou střední a těžká úroveň hratelné.** Těžká úroveň začíná se třemi rychlými nepřáteli na největší pavučině. Jestli je to výzva, nebo frustrace, pozná jen člověk.

## Metriky

- Čas: asi 15 minut od zadání po pull request, včetně otázky na rozpor.
- Změněno 13 souborů (kód, testy, specifikace, dokumentace), k tomu nový E2E soubor a dva výukové soubory.
- Testy: 155 unit testů (7 nových), 23 E2E testů (4 nové), všechny procházejí.
- Iterace: jedna oprava vzhledu po snímku.

## Poučení

- Čísla v zadání porovnej s tabulkou ve specifikaci. Člověk si pamatuje, jak hra vypadá, ne v kterém kole to nastane.
- Když zadání obsahuje rozpor, ať agent pracuje na doporučené variantě a zeptá se. Odpověď stačí jedno klepnutí a práce nečeká.
- Nový ovládací prvek otestuj klávesnicí. Globální zkratky hry snadno ukradnou klávesy, které prvek potřebuje.
