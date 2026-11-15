# Nasazení webové verze na vlastní hosting

[← Programátorská dokumentace](README.md)

Hra běží na **https://spider-on.prochst.dev/**, v kořeni subdomény na běžném webhostingu s Apache. Je to statický web: žádné PHP, databáze ani Node.js na serveru. Stačí nahrát soubory přes FTP.

## Co hosting potřebuje

- **HTTPS s platným certifikátem** (např. Let's Encrypt, většina hostingů ho zapne jedním kliknutím). Bez HTTPS prohlížeč nespustí service worker, takže hra nepůjde nainstalovat ani hrát offline.
- **Subdoménu `spider-on.prochst.dev`** s vlastním kořenovým adresářem (např. `/www/subdom/spider-on/` nebo `/public_html/spider-on/`, podle hostingu). Hra počítá s tím, že leží v kořeni domény, ne v podsložce jiného webu.
- **Apache, který čte `.htaccess`** (u sdíleného hostingu obvyklé). Na Nginx `.htaccess` nefunguje, viz poznámka na konci.

## Kde vzít soubory

Jedna z možností:

1. **Z GitHubu (doporučeno).** Po každém sloučení do `main` workflow *Release build* spustí všechny testy a pak sestaví hru. V záložce **Actions** otevři poslední zelený běh a dole v části **Artifacts** stáhni `spider-on-web-<commit>`. Je to zip s obsahem složky `dist/`. Když testy neprojdou, artefakt nevznikne.
2. **Sestavit u sebe.** `npm ci` a `npm run build`. Výsledek je ve složce `dist/`. Číslo verze na úvodní obrazovce pak ukáže „local“ místo otisku commitu, pokud před buildem nenastavíš `GITHUB_SHA=$(git rev-parse HEAD)`.

Obsah buildu:

```
.htaccess              nastavení serveru (skrytý soubor!)
index.html
sw.js                  service worker
manifest.webmanifest
share.png              obrázek pro náhled odkazu
app-icons/             ikony aplikace
assets/                kód, styly a písmo (názvy s otiskem obsahu)
```

## Nahrání přes FTP

1. Rozbal zip.
2. Připoj se FTP klientem (FileZilla, WinSCP, Total Commander) k hostingu. Údaje najdeš v administraci hostingu. Pokud hosting umí **FTPS nebo SFTP**, použij je, obyčejné FTP posílá heslo nešifrovaně.
3. Otevři kořenový adresář subdomény `spider-on.prochst.dev`.
4. Zapni zobrazení skrytých souborů (FileZilla: *Server → Vynutit zobrazení skrytých souborů*), jinak `.htaccess` neuvidíš a snadno ho vynecháš.
5. Nahraj **obsah** rozbalené složky (ne složku samotnou), tak aby `index.html` ležel přímo v kořeni subdomény.
6. Starou složku `assets/` při aktualizaci klidně nech, nebo ji smaž až po nahrání nových souborů. Staré soubory nikomu nevadí, jen zabírají místo. Doporučené pořadí při aktualizaci je: nejdřív `assets/`, pak ostatní soubory a úplně nakonec `index.html` a `sw.js`, aby hráč nikdy nedostal stránku, ke které ještě chybí kód.

## Co dělá `.htaccess`

- přesměruje `http://` na `https://`,
- nastaví správné typy souborů (`.webmanifest`, `.js`, `.woff2`, `.svg`), které starší servery neznají,
- `index.html`, `sw.js` a `manifest.webmanifest` posílá s `Cache-Control: no-cache`, aby prohlížeč vždy zjistil novou verzi,
- soubory v `assets/` nechá prohlížeč uložit na rok (`immutable`), protože se jejich název mění s obsahem,
- zapne kompresi gzip a vypne výpis obsahu složek.

Každý blok je obalený v `<IfModule>`, takže hosting bez některého modulu hru neshodí.

## Kontrola po nahrání

1. Otevři https://spider-on.prochst.dev/. Na úvodní obrazovce dole je číslo verze, např. „verze 0.3.5 · a1b2c3d“.
2. Zkus i http://spider-on.prochst.dev/, musí přesměrovat na https.
3. V Chromu: Nástroje pro vývojáře → **Application**. V *Manifest* nesmí být chyby a ikony se musí zobrazit. V *Service workers* má být `sw.js` ve stavu *activated*.
4. V záložce **Network** zaškrtni *Offline* a obnov stránku. Hra se musí načíst.
5. Na telefonu nabídne prohlížeč instalaci na plochu (Android: menu → Nainstalovat aplikaci; iPhone: Sdílet → Přidat na plochu).
6. Pošli si odkaz do chatu a ověř náhled s obrázkem.

Po nahrání nové verze nainstalovaná hra při dalším otevření nabídne „Je dostupná nová verze“.

## Když něco nejde

| Příznak | Příčina a řešení |
| --- | --- |
| Chyba 500 hned po nahrání | Hosting nepovoluje některou direktivu v `.htaccess`, nejčastěji `Options -Indexes`. Smaž ten řádek. |
| Ikony vrací 404 | Hra je má schválně v `app-icons/`, protože Apache často mapuje `/icons/` na vlastní složku. Zkontroluj, že se složka nahrála celá. |
| Hra nejde offline, service worker chybí | Stránka neběží přes HTTPS, nebo některý soubor ze seznamu v `sw.js` vrací chybu (stačí jeden a service worker se nenainstaluje). V *Network* hledej červené řádky. |
| Po nahrání se pořád ukazuje stará verze | Chybí `.htaccess` (prohlížeč si drží starý `sw.js`). Nahraj ho a obnov stránku bez mezipaměti (Ctrl+Shift+R). |
| Prázdná černá stránka | `index.html` není v kořeni subdomény (nahraná složka místo jejího obsahu), nebo chybí `assets/`. |

## Hosting s Nginx

Nginx `.htaccess` ignoruje. Stejné chování dá v konfiguraci serveru: `types { application/manifest+json webmanifest; }`, pro `index.html`, `sw.js` a `manifest.webmanifest` hlavička `Cache-Control: no-cache`, pro `/assets/` `Cache-Control: public, max-age=31536000, immutable` a přesměrování z portu 80 na https.

## GitHub Pages

Do verze 0.3.4 hra běžela na https://prochst.github.io/spider-on/. Build teď počítá s kořenem domény, takže na Pages (podsložka `/spider-on/`) by se nenačetl. Automatické nasazení na Pages je zrušené. Starou verzi na Pages vypneš v repozitáři: *Settings → Pages → Unpublish site*, nebo ji tam nech, jen se už nebude aktualizovat.
