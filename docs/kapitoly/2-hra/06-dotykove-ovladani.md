# 2.6 Dotykové ovládání na šířku

## Cíl

Hrát hru na telefonu a tabletu bez klávesnice: vpravo virtuální touchpad, kterým se tahem prstu mění kruh, vlevo tlačítko plynu. Hra běží na šířku a na výšku vyzve k otočení. Na počítači se nic nemění.

## Zadání

Viz [prompty/2-hra/06-dotykove-ovladani.md](../../prompty/2-hra/06-dotykove-ovladani.md). Uživatel napsal jen „Test proběhl OK. Pokračuj dalším krokem“. Rozložení ovládání rozhodl už ve fázi 1, kapitola 11 specifikace ho popisovala v hrubých rysech.

## Co agent udělal

- **Nejdřív specifikace.** Kapitola 11 neříkala, jak velký tah je „tah“, co je klepnutí, kam přesně sahat ani kdy se ovládání ukáže. Agent to dopsal do specifikace (verze 0.13), než začal programovat: tah od 24 px, po rozpoznání se počítá znovu od nového místa, klepnutí do 10 px a 0,3 s, ovládání jen na dotykových zařízeních nebo po prvním dotyku, výzva k otočení jen na dotykových zařízeních. Prahy jsou v `config.ts`.
- **Rozpoznání gesta jako čistá funkce** (`src/input/gesture.ts`). Rozhodnutí „tah, nebo klepnutí“ nepotřebuje prohlížeč, jen body a časy. Proto je zvlášť a má vlastní testy. Druhý tah bez zvednutí prstu je druhý tah: hráč tak během přelézání může přidat další kruh, jak to umí šipky (kapitola 5 specifikace).
- **Dotyk přes Pointer Events** (`src/input/touch.ts`). Každý prst má vlastní id, takže oba palce fungují zároveň. Myš se ignoruje, na počítači se klikáním do plátna nic nemění. Prst, který zůstal na displeji při přepnutí aplikace, by nikdy neposlal „zvednuto“, proto ztráta fokusu všechny prsty uvolní a plyn nezůstane zaseknutý.
- **Plocha pro palec je větší než kresba.** Celá pravá polovina obrazovky je touchpad a celá levá plyn. Nakreslené kruhy jen ukazují, kde ovládání je. Palec na skle nemá hmat jako na tlačítku a hráč se dívá na pavučinu, ne na palec.
- **Místo pro ovládání** (`src/render/view.ts`). S dotykovým ovládáním nechá pohled po stranách pavučiny volné pruhy. Na telefonu na šířku omezuje pavučinu výška, takže se skoro nezmenší. Na tabletu, který je skoro čtvercový, ji omezí pruhy po stranách.
- **Zpětná vazba.** Plyn se při držení vyplní, touchpad se rozsvítí a krátce ukáže šipku ve směru rozpoznaného tahu. Vykreslení dělá šablona Neon přes novou funkci rozhraní `drawTouchControls`, takže Čmáranice si ovladače nakreslí po svém.
- **Klepnutí spustí kolo jen na obrazovce „připraveno“.** Ostatní menu jsou HTML tlačítka a dotyk na ně funguje sám. Klepnutí jinde nedělá nic, aby náhodný dotyk během hry nic nespustil.
- **Text podle ovládání.** Obrazovka před kolem píše „Enter nebo mezerník spustí kolo“ na počítači a „Klepnutí na pravou polovinu spustí kolo“ na dotykovém zařízení.
- **Na výšku** CSS ukáže neprůhlednou výzvu „Otoč zařízení na šířku“ s otáčejícím se telefonem a hra se pozastaví. Uživatelům s omezeným pohybem se telefon neotáčí.
- **Testy:** 4 pro gesta, 2 pro rozložení (bez dotyku žádné ovladače, s dotykem se ovladače nepřekrývají s pavučinou na telefonu i tabletu). Celé ovládání agent ověřil v prohlížeči s emulací dotyku: klepnutí spustí kolo, tah doleva u pravého vlákna zapamatuje „dovnitř“, plyn zrychlí, otočení na výšku hru pozastaví.

## Kde se agent spletl

- **Uživatel testoval nesloučenou verzi.** „Test proběhl OK“ přišel, když pull request kapitoly 2.5 ještě nebyl sloučený, takže na webu žádný neon být nemohl. Agent na to upozornil a s kapitolou 2.6 počkal na sloučení, aby se dvě kapitoly nesmíchaly v jednom pull requestu. Stejná situace jako v kapitole 2.4: říkat, kde je změna vidět, je potřeba opakovaně.
- **HUD pod tlačítkem pauzy.** Na prvním snímku z telefonu ležel nápis ŽIVOTY pod HTML tlačítkem pauzy v rohu. HUD kreslí Canvas, tlačítko je HTML a ani jedno o druhém neví. Šablona teď nechává v pravém horním rohu místo pro tlačítko.
- **Průhledná výzva k otočení.** Výzva měla poloprůhledné pozadí menu a prosvítal přes ni panel pauzy. Šablona dostala barvu `backdrop` pro neprůhledný podklad.
- **Obří ovladače na tabletu.** Místo pro ovládání bylo podílem výšky, takže na tabletu vyšly kruhy velké jako dlaň a pavučina zbytečně malá. Agent místo omezil na 190 px.
- **Slepá ulička: sloučené události.** Agent zvažoval číst `getCoalescedEvents`, aby nepřišel o rychlý pohyb prstu. Pak si uvědomil, že by z jednoho pohybu mohl udělat víc tahů a hráč by nečekaně přeskočil dva kruhy. Pro tah stačí poslední poloha, nápad zahodil.

## Lidská kontrola

- **Hraní na skutečném telefonu.** Emulace v prohlížeči ověří, že gesta dojdou do hry, ale ne, jestli se palcem dobře míří, jestli 24 px není moc nebo málo a jestli ovladače nejsou příliš nízko. Prahy jsou laditelné a uživatel je posoudí po sloučení.
- **Rozložení na tabletu.** Agent volil omezení na 190 px od oka podle snímku. Uživatel ho může změnit.

## Metriky

- Nové soubory: 5 v `src/` (gesta, dotyk, kresba ovladačů, 2 testy), změněno 12 souborů.
- Testy: 128 (6 nových), všechny procházejí.
- Iterace: tři opravy po snímcích z emulace (HUD, výzva na výšku, tablet).

## Poučení

- Dotykové ovládání vyžaduje čísla, která specifikace obvykle nemá: kolik je tah, co je klepnutí, kam sahá plocha. Dopiš je do specifikace dřív, než je agent schová do kódu.
- Rozpoznání gesta oddělené od prohlížeče se dá testovat stejně jako herní logika.
- Snímky na různých velikostech obrazovky odhalí chyby, které na jedné velikosti nejsou vidět.
- Emulace dotyku nenahradí palec na skle.
