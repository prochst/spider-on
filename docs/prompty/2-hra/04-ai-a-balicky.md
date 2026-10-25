# Zadání: kapitola 2.4

Samostatné zadání pro kapitolu nebylo, agent pokračoval podle odsouhlaseného plánu fáze 2 (viz [zadání kapitoly 2.1](01-herni-smycka.md)) po sloučení kapitoly 2.3. Během práce poslal uživatel první poznatek z ručního testování sloučené verze:

## 1. Poznatky z ručního testování

> Poznatky z ručního testování:
>
> 1. zpomalit rychlost pohybu o 40%

## 2. Další poznatky z ručního testování

> Poznatky z ručního testování:
>
> * Stále velká rychlost, spomal o dalších 20%
> * je těžké strefit se do stisknutí klávesy pro změnu kruhu, změna vlevo a vpravo se mi nepovedla vůbec

## 3. Pravidlo pro další postup

> Po sloučení PR nezačínej automaticky další krok, počkej na ruční test a pokyn k opravě nebo k pokračování podle plánu

## 4. Ovládání podle směru na obrazovce

Po ručním testu sloučené verze:

> Rychlost je už je dobrá.
> Chci změnit ovládání přechodu na jiný kruh., tak aby stisknutá šipka odpovídala požadovanému směru přesunu:
> když se chci přesunout po vertikální cestě, tak se používají šipky nahoru a dolů z pohledu herní desky a ne, že dolu je dovnitř kruhu a nahoru je ven z kruhu. Podobně u horizontálního přesunu budou fungovat šipky vlevo a vpravo.

## 5. Balíčky od prvního kola

Po ručním testu verze se šipkami podle směru (napoprvé prohlížeč ukazoval starou verzi z mezipaměti):

> Nyní šipky fungují správně.
> Pro otestování balíčků je zobraz dočasně hned od prvního kola

## 6. Zpráva o bonusu a mírnější obtížnost

> Doplnění k zadání:
>
> * balíčky fungují, doplň, aby se po úspěšném sebrání zobrazila na 3s v centru pavučiny informace o získaném obonusu.
> * hra je stále dost obtížná už od začátku, změn rychlost nepřátel na interval 0,3 až 0,9 rychlosti pavouka.
> * za krok obtížnosti 3 přidej krok 4 jeden pomalý, druhý rychlý, pak teprve krok 5 dva rychlí. stejně tak u tří nepřátel budou všichni pomalí, pak jen jeden rychlí, dva rychlí, ...
