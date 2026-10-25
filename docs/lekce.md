# Poučení

Průběžný seznam obecných poučení z práce s AI agentem. U každého je odkaz na kapitolu, kde vzniklo.

- **Nech agenta nejdřív rešeršovat a navrhovat, ne hned programovat.** První odpověď na „chci udělat klon hry“ byla rešerše, srovnání technologií a otázky, ne kód. Rozhodnutí o stacku, stylu a názvu tak udělal člověk s podklady v ruce. ([kapitola 1.1](kapitoly/1-priprava/01-zadani-a-specifikace.md))
- **Ověřuj faktická tvrzení agenta.** Při srovnání technologií agent napsal, že scény v Godotu jsou binární. Nejsou, jsou textové, a agent to sám opravil až při rozšiřování srovnání. ([kapitola 1.1](kapitoly/1-priprava/01-zadani-a-specifikace.md))
- **Vizuální rozhodnutí dělej nad ukázkou, ne nad popisem.** Animovaný náhled dvou stylů rozhodl rychleji než jakýkoli popis. ([kapitola 1.1](kapitoly/1-priprava/01-zadani-a-specifikace.md))
- **Testuj čas v herní logice s konkrétními čísly.** Animace 1,1 s běžela o krok déle, protože 1,1 není v počítači přesně 132 × 1/120. Odhalil to test, který simuloval přesně 1,1 s, ne ruční zkoušení. ([kapitola 2.1](kapitoly/2-hra/01-herni-smycka.md))
- **Pojistky v kódu ověřuj odebráním.** Když agent přidá toleranci nebo výjimku „pro jistotu“, ať ji zkusmo odebere a ukáže test, který pak selže. Jinak v kódu zůstávají pojistky, o kterých nikdo neví, jestli jsou potřeba. ([kapitola 2.1](kapitoly/2-hra/01-herni-smycka.md))
- **Nejasnou větu ve specifikaci rovnou přepiš.** Když agent musí pravidlo vyložit, ať výklad zapíše do specifikace, ne jen do kódu. Při další změně pak nikdo nemusí výklad zpětně luštit z implementace. ([kapitola 2.2](kapitoly/2-hra/02-pohyb-pavouku.md))
- **Tabulky ze specifikace testuj opisem tabulky.** Test, který porovná výstup kódu s řádkem čísel ze specifikace, zkontroluje člověk za pár sekund. ([kapitola 2.3](kapitoly/2-hra/03-mouchy-a-bodovani.md))
- **Ptej se, co se stane mezi dvěma kroky.** U simulace v pevných krocích může rychlý objekt jiný přeskočit. Ať agent spočítá nejhorší případ a hlídá ho testem. ([kapitola 2.3](kapitoly/2-hra/03-mouchy-a-bodovani.md))
- **Čísla v testech odvozuj z laditelných konstant.** Po první změně rychlosti selhaly právě testy s natvrdo zapsaným časem. ([kapitola 2.4](kapitoly/2-hra/04-ai-a-balicky.md))
- **Hraj hru po každé kapitole.** Testy ověří pravidla, ale ne tempo. To, že je hra o 40 % rychlejší, než má být, poznal až člověk. ([kapitola 2.4](kapitoly/2-hra/04-ai-a-balicky.md))
- **Při opravě hledej i sourozence chyby.** Oprava jen toho, co spadlo, nechá stejnou chybu na dalších místech. ([kapitola 2.4](kapitoly/2-hra/04-ai-a-balicky.md))
- **Řekni, kde je změna vidět.** Uživatel zkoušel web, kam se nesloučený pull request ještě nedostal, a zpětná vazba se týkala staré verze. ([kapitola 2.4](kapitoly/2-hra/04-ai-a-balicky.md))
