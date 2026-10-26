# 2.5 Neonové vykreslování a systém šablon

## Cíl

Nahradit provizorní kresby skutečným neonovým vzhledem podle náhledu z fáze 1 a oddělit vzhled od vykreslování tak, aby šla přidat další šablona (Čmáranice) bez zásahu do logiky i vykreslování. Písmo musí být součástí hry, aby fungovala offline.

## Zadání

Viz [prompty/2-hra/05-neon-a-sablony.md](../../prompty/2-hra/05-neon-a-sablony.md). Uživatel napsal jen „pokračuj dalším krokem“. Obsah kapitoly dal plán fáze 2, kapitola 14 specifikace a dvě rozhodnutí z plánování: neonový vzhled podle náhledu stylů a přibalené písmo Chakra Petch.

## Co agent udělal

- **Rozhraní šablony** (`src/themes/theme.ts`). Šablona je objekt s paletou menu, písmem a kreslicími funkcemi: pozadí, pavučina, moucha, balíček, zpráva o bonusu, pavouk, srážka a HUD. Klíčové rozhodnutí: šablona **nedostává stav hry**, jen hotová data v pixelech. Pavučinu jako seznam bodů kruhů a konců vláken, pavouka jako místo, natočení, velikost, fázi kroku a roli (hráč, nepřítel, zpomalený nepřítel). Šablona tedy nemusí znát geometrii pavučiny ani pravidla a nemůže je rozbít. Čmáranice pak bude jen jiný způsob, jak ty samé čáry nakreslit.
- **Dělba práce.** `src/render/` rozhoduje, co je na obrazovce a kde: přepočet na pixely (`layout.ts`), velikosti společné všem šablonám, texty zprávy o bonusu, pořadí kreslení (`scene.ts`). `src/themes/neon/` rozhoduje jen, jak to vypadá. Velikosti zůstaly mimo šablony záměrně: pavouk, který by v jiné šabloně vypadal dvakrát větší, by klamal o vzdálenosti srážky.
- **Šablona Neon** (`src/themes/neon/`) podle náhledu z fáze 1: fialový opar za pavučinou, azurové kruhy, růžová přechodová vlákna, mouchy jako blikající světlušky (každá v jiném rytmu, aby pavučina neblikala celá naráz), obrysoví pavouci s výplní barvou pozadí a svítícíma očima, srážka jako bílý kruh s jiskrami. Kreslení balíčků se přestěhovalo z kapitoly 2.4 beze změny tvarů.
- **Nohy, které kráčí.** Nohy se hýbou podle toho, kolik pavouk na obrazovce urazil, takže při pauze stojí a při plynu běží rychleji. Vykreslování ale nesmí měnit stav hry. Agent proto ušlou dráhu každého pavouka pamatuje v `WeakMap` uvnitř `src/render/legs.ts`. Když hra pavouka nahradí novým (nové kolo, srážka), stará položka zmizí sama. První nápad počítat fázi z úhlu na kruhu agent zahodil: při přelézání na jiný kruh a při přechodu úhlu přes 360° by nohy poskočily.
- **Písmo Chakra Petch** (`src/assets/fonts/chakra-petch/`). Jen dvě řezy, které hra používá (500 a 700), a jen latinka rozdělená jako na Google Fonts na základní a rozšířenou část. Prohlížeč stáhne rozšířenou část jen kvůli českým písmenům. Celkem 38 kB, licence OFL je přiložená a uvedená v README. Žádná nová závislost: soubory agent vzal z balíčku `@fontsource/chakra-petch` a zkopíroval do repozitáře.
- **Menu přebírá šablonu.** Barvy a písmo menu jsou CSS proměnné, které nastaví `applyMenuTheme` podle šablony. Přepnutí šablony v nastavení (kapitola 2.7) tak změní i menu.
- **Testy** pro přepočet na pixely a pro animaci nohou. Kreslení samo testy nemá, kontroluje se snímky v prohlížeči.

## Kde se agent spletl

- **Zpomalení nepřátelé k nerozeznání od hráče.** Agent převzal z kapitoly 2.4 pravidlo „zpomalení nepřátelé zmodrají do barvy balíčku“. Na snímku s novými barvami ale byli ledově modří nepřátelé skoro stejní jako bílo-azurový hráč. Agent zpomalení přebarvil na fialovou, a protože barvu sdílí balíček i zpráva o bonusu, přebarvil i ty. Bez snímku by to odhalil až uživatel při hraní.
- **České znaky v Canvasu.** Canvas si webové písmo sám nevyžádá. První verze načítala písmo předem, ale bez textu, a prohlížeč tak stáhl jen základní latinku. „Ž“ v nápisu ŽIVOTY by se kreslilo náhradním písmem. Agent to zachytil při psaní, ještě před zkouškou: `document.fonts.load` teď dostane i ukázku českých písmen.
- **Rozházené pořadí ve specifikaci.** Při čtení specifikace agent zjistil, že v seznamu rozhodnutí uživatele je verze 0.10 před 0.9 a 0.11 na konci. Vkládal nové řádky za nalezený text místo na konec seznamu. Opravil to ještě v pull requestu kapitoly 2.4.
- **Server pro náhled umíral.** `vite preview` spuštěný na pozadí uvnitř příkazu skončil s ním a další zkouška v prohlížeči selhala na odmítnutém spojení. Agent server spustil jako samostatnou úlohu na pozadí.

## Lidská kontrola

- **Vzhled.** Agent vzhled ukazuje v pull requestu na snímcích: menu, hra, zpomalení se zprávou o bonusu, srážka a detail balíčků. Uživatel rozhodne, jestli sedí, nejlépe ručním hraním po sloučení.
- **Fialová místo modré.** Změna barvy zpomalení je odchylka od kapitoly 2.4, kterou agent udělal sám. V pull requestu ji výslovně uvádí.

## Metriky

- Nové soubory: 11 v `src/` (rozhraní šablony, 6 souborů šablony Neon, přepočet na pixely, animace nohou, 2 testy), písmo (4 soubory a licence), smazané 4 provizorní kresby.
- Testy: 122 (5 nových), všechny procházejí.
- Velikost sestavené hry: 20,7 kB JavaScriptu (8,1 kB po kompresi) a 38 kB písma.
- Iterace: jedna úprava barev po prvním snímku.

## Poučení

- Šabloně dávej hotová data, ne stav hry. Čím méně toho šablona ví, tím snáz se píše další a tím méně může pokazit.
- Barvy kontroluj vedle sebe ve hře, ne v paletě. Barva, která sama o sobě vypadá dobře, může splynout s jinou postavou.
- Přibalené písmo rozděl podle znaků. Čeština potřebuje rozšířenou latinku a Canvas si ji sám nevyžádá.
