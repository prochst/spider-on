# Zadání: kapitola 1.1

Doslovná zadání uživatele z 25. 10. 2026, včetně překlepů. Agent pracoval v projektu Claude (vlákno s jedním agentem), odpovědi agenta tu nejsou, shrnuje je kapitola.

## 1. Úvodní zadání

> Najdi informace o staré video hře Head Ono d Sega/Gremlin.
> https://en.wikipedia.org/wiki/Head_On_(video_game)
> Chtěl bych udělat pomocí Claude agenta klon v jiném grafickém provedení.
> Ideálně pro prohlížeč, Android a IOS.
> Zároveň bych chtěl celý proces tvorby pomocí agenta dokumentovat jako výukový materiál k používání AI pro vývoj.
> Jaký je tvůj názor?

## 2. Rozšíření srovnání a vývoj přes GitHub

> Doplň do dokumentu podrobnější srovnání doporučených vývojových stacků. a tabulku pro porovnání pro a proti jednotlivých možností.
> Pokud to chápu správně, tak se nebude používat, žadné lokální vývojové prostředí (např. VS Code, WSL a Docker) ale bude to probíhat jen v Githubu.
> Popiš mi to podrobněji a vysvětli použití GitHub Pages přes GitHub Actions
> Se strukturou výukové dokumentace souhlasím.

## 3. Volba stacku a fáze

> Kloním se k výukově čiští variantě s čistým Canvasem.
> Celý vývojový a výukový proces bych rozdělil na hlavní fáze:
>
> * Příprava projektu a zadání
> * Kostra hry,  logika a grafika hry, hlavní komponenty
> * Webová verze
> * Android a publikování na Google Play
> * IOS a publikování na Apple store

## 4. Grafický styl

> Ještě se zamysleme nad grafickým stylem.
> Chci místo aut použít pavouky, herní plocha by nebyla čtvercová ale kulatá, takže by evokovala pavučinu.
> Jaký grafický styl by byl vhodný?

## 5. Náhled stylů

> Mohl by jsi vygenerovat jednoduchý náhled pro styly 1. a 4. pro představu?

## 6. Volba stylu a název

> Volím neonový styl, mohl by se do výukt zabudovat i princip změny šablony vzhledu ( jiné barvy a případně vzhled pavouků a sbíraných mušek).
> Jako název mě napadá jednoduchý "Spider On", máš i jiné návrhy?

## 7. Repozitář

> Kloním se také k názvu Spider On.
> Mám tak pojmenovat i repo v Githubu?

> Repo je připraveno
> https://github.com/prochst/spider-on

## 8. Připomínky ke specifikaci

> Připomínky ke specifikaci:
>
> 1.  Hra začne pouze se 3 soustřednými kruhy jako nejmenší obtížnost  a bude mít první 3 kola podle definice. Pak bude následovat plocha se  4 kruhy a začne se rovnou 3 kolem a bude bude mít kola 3 až 8 podle definice. Pak se přepne na plochu s 5 kruhy začne se rovnou 5 kolem.
> 2.  Po skončení kola se nové kolo nezačne automaticky ale až na pokyn hráče.
> 3. V nastavení jsi hráč může zadat jméno,  pod kterým se pak ukazuje jeho skóre v celkové tabulce výsledků. Od 6 kola místo mouchy zobrazovat bonusové balíčky na náhodném místě ale vždy na protější straně plochy než je pavouk. Balíček je k dispozici dokud ho pavouk nesebere nebo ho nemine na jiném kruhu. Balíček může obsahovat  body navíc, zpomalení nepřátel na 1 okruh, mimořádně extra život navíc.
>
>
> Otevřené otázky ke schválení:
>
> 1. Bodování 10 za mouchu a bonus 100 × kolo
> 2. Po srážce obnoví celé herní pole
> 3.  Kompromisní řešení, změna se zapamatuje jen 15 stupňů před přechodem
> 4. Ovládání na mobilu nebo tabletu zvolit podobné jako je na malých herních konzolích.  Zobrazení hry je na šířku, vpravo od hrací plochy je virtuální touchpad, kde smět tahu prstu určuje pohyb po přechodovém vlákně. Vlevo pak virtuální tlačítko pro plyn.

## 9. Doplnění k balíčkům

> Ještě uprav aby zobrazování balíčků nebylo pravidelně po 8s ale náhodně v rozmezí 5 až 20s
