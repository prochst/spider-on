# 3.5 Vlastní hosting

## Cíl

Přestěhovat webovou verzi z GitHub Pages na vlastní doménu https://spider-on.prochst.dev/ na běžném webhostingu. Připravit build, který jde nahrát přes FTP, a sepsat k tomu postup.

## Zadání

Viz [prompty/3-web/05-vlastni-hosting.md](../../prompty/3-web/05-vlastni-hosting.md). Uživatel napsal jen „Ano připrav distribuční verzi. Bude publikována na doméně spider-on.prochst.dev“, podrobnosti vyplynuly z předchozího rozhovoru v projektu.

## Co agent udělal

- **Base path.** Vite skládal všechny adresy s předponou `/spider-on/`, protože GitHub Pages servíruje projekt z podsložky. Teď je `base: "/"`. Manifest a odkazy v `index.html` byly relativní (`./`) a service worker se registruje přes `import.meta.env.BASE_URL`, takže se přizpůsobily samy. Stejně tak rozsah (`scope`) service workeru: je to složka, ve které `sw.js` leží.
- **Absolutní adresy.** Jediné místo s pevnou adresou byly značky náhledu odkazu (`og:url`, `og:image`), které musí být absolutní. Míří teď na novou doménu. Spolu s nimi se změnila adresa v E2E testu náhledu, v README a ve specifikaci.
- **Testy a skripty.** Playwright, `scripts/share-image.mjs` a `scripts/check-update.mjs` otevíraly `http://localhost:…/spider-on/`. Teď otevírají kořen.
- **`.htaccess`.** Nový soubor `public/.htaccess` Vite zkopíruje do buildu. Přesměruje http na https, doplní typy souborů, které starší Apache nezná (`.webmanifest`, `.woff2`), zakáže ukládání `index.html`, `sw.js` a manifestu do mezipaměti (jinak by se hráč nedozvěděl o nové verzi) a soubory v `assets/` naopak nechá uložit na rok, protože mají otisk obsahu v názvu. Do offline mezipaměti service workeru nepatří, takže v `PUBLIC_FILES` není.
- **Ikony v `app-icons/`.** Viz „Kde se agent spletl“.
- **Místo nasazení release build.** Workflow `deploy.yml` nasazoval na Pages, kde by build pro kořen domény nefungoval. Nahradil ho `release.yml`: po sloučení do `main` spustí stejné testy jako dřív (včetně E2E) a když projdou, nabídne složku `dist/` ke stažení jako artefakt. Nahrání přes FTP dělá člověk. Pravidlo „k hráčům se dostane jen otestovaný build“ tak platí dál, jen s ručním posledním krokem.
- **Postup nahrání** v [docs/dev-docs/nasazeni.md](../../../dev-docs/nasazeni.md): co hosting potřebuje, kde vzít soubory, nahrání přes FTP, kontrola po nahrání a tabulka častých potíží.
- **Ověření na skutečném Apache.** Agent nainstaloval do svého prostředí Apache 2.4 s `AllowOverride All`, nahrál do něj build a prošel ho prohlížečem: přesměrování na https, typy a hlavičky souborů, gzip, instalace service workeru, všech 12 souborů v mezipaměti a načtení hry offline. Žádný požadavek neskončil chybou.
- Verze 0.3.5, specifikace 0.21.

## Kde se agent spletl

- **Ikony by na hostingu chyběly.** První build prošel všemi testy na `vite preview`. Na Apache ale `/icons/icon.svg` vrátil 404. Debian, cPanel a řada sdílených hostingů mají v hlavní konfiguraci `Alias /icons/` na vlastní obrázky pro výpis složek a ten má přednost před soubory webu. Z `.htaccess` ho přebít nejde. Horší než chybějící ikona byl dopad na offline: service worker ukládá soubory jedním `cache.addAll` a když jediný z nich selže, neuloží nic a nenainstaluje se. Hra by na hostingu tiše přestala fungovat offline. Složka se přejmenovala na `app-icons/`. Agent to nepředvídal, odhalilo to až vyzkoušení na stejném druhu serveru, na jaký hra půjde.
- **Skrytý soubor v artefaktu.** Při psaní `release.yml` si agent vzpomněl, že `actions/upload-artifact` od verze 4.4 vynechává soubory začínající tečkou. Bez `include-hidden-files: true` by ve staženém zipu `.htaccess` chyběl a nikdo by si toho nevšiml, dokud by nepřestala chodit aktualizace. Ověří to až první běh na `main`.
- **`Options -Indexes` může shodit web.** Některé hostingy tuhle direktivu v `.htaccess` nepovolují a vrátí chybu 500. Agent ji nechal, protože výpis složek je zbytečně prozrazený, ale v postupu nahrání je jako první řádek tabulky potíží.

## Lidská kontrola

- **Nahrát build a projít „Kontrolu po nahrání“** z [docs/dev-docs/nasazeni.md](../../../dev-docs/nasazeni.md): https, přesměrování z http, manifest a service worker v Nástrojích pro vývojáře, hra offline, instalace na telefonu, náhled odkazu v chatu.
- **Hra nainstalovaná z GitHub Pages** se na novou adresu sama nepřestěhuje. Je to jiná doména, tedy jiná aplikace s vlastním úložištěm i tabulkou výsledků. Starou ikonu je potřeba odinstalovat a hru nainstalovat znovu z nové adresy.
- **Stará verze na Pages.** Zůstane viset, dokud ji uživatel v nastavení repozitáře nevypne (Settings → Pages).

## Metriky

- Čas: asi 45 minut od zadání po pull request.
- Nové soubory: `public/.htaccess`, `.github/workflows/release.yml`, `docs/dev-docs/nasazeni.md`, kapitola a zadání. Smazaný `deploy.yml`, přejmenovaná složka ikon.
- Testy: 158 unit testů a 41 E2E testů beze změny počtu, `check-update.mjs` prošel. Navíc jednorázová kontrola na Apache.

## Poučení

- Statický build není hotový, dokud neběží na stejném druhu serveru, na jaký půjde. Vývojový server nemá výchozí konfiguraci hostingu.
- Service worker, který ukládá všechno najednou, je citlivý na jediný chybějící soubor. Chyba se neprojeví hned, jen hra přestane fungovat offline.
- Skryté soubory (`.htaccess`) se ztrácejí v archivech i v FTP klientech. V postupu na ně upozorni výslovně.
