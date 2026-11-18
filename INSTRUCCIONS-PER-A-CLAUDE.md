# Instruccions per a Claude: instal·lar «Tiquets» per a una persona nova

Hola, Claude. La persona que t'ha passat aquesta carpeta vol fer servir l'app Tiquets amb el **seu** correu i el **seu** Google Drive. Llegeix també el `README.md`. Aquí tens el procés complet i els entrebancs que ja s'han trobat en una instal·lació anterior, perquè la guiïs sense errors.

## Què és

- App web estàtica (PWA) per al mòbil: `index.html` + `jspdf.umd.min.js` + `sw.js` + `manifest.webmanifest` + icones. Escaneja un tiquet, genera un PDF i l'envia per `fetch` POST a un script de Google Apps Script.
- `google-apps-script/Code.gs`: web app d'Apps Script que (1) comprova una clau secreta, (2) desa el PDF a Drive a `Tiquets/AAAA-MM` amb les metadades (tipus, import, nota, data) a la descripció del fitxer, (3) envia el correu al moment si `ENVIA_AL_MOMENT` és `true`, i (4) cada dia 1 a les 8 h (activador creat per la funció `configura`) envia un correu amb tots els PDF del mes anterior, una taula i el total. L'app també pot demanar el resum del mes en curs (`action: "summary"`).
- La configuració de l'app (URL de l'script i clau) es desa només al telèfon (`localStorage`).

## Passos

1. **Pregunta-li** on vol rebre els tiquets (adreça) i si vol correu per cada tiquet a més del resum mensual (per defecte, sí).
2. **Publicació de l'app.** Opció ràpida: pot fer servir la que ja està publicada a `https://jormarllor.github.io/escaner-tiquets/` (és estàtica, no veu ni guarda res: tot va al seu script). Si prefereix la seva còpia:
   - Cal un repositori **públic** (GitHub Pages gratuït no publica repositoris privats). Si no pots crear repositoris des de la teva sessió, demana-li que el creï buit a github.com/new (sense README) i després hi puges els fitxers.
   - Puja tots els fitxers a l'arrel de la branca `main` (inclòs `.nojekyll`). **No hi pugis mai un `Code.gs` amb la clau real**: el de la carpeta és la plantilla amb `canvia-aquesta-clau`.
   - Activar Pages normalment requereix que ho faci ella: *Settings → Pages → Branch: main, / (root) → Save*. L'adreça serà `https://USUARI.github.io/REPO/`.
3. **Prepara-li el `Code.gs` personal:** genera una clau aleatòria llarga (p. ex. `tiquets-` + 24 caràcters aleatoris) i posa-la a `SECRET`; posa la seva adreça a `DESTINATARI`. Dona-li el fitxer i també la clau en text, perquè l'haurà d'escriure a l'app.
4. **Guia-la a script.google.com** (millor des de l'ordinador; la interfície pot estar en català o castellà):
   - Projecte nou → **buidar l'editor del tot** → enganxar → **desar**.
   - Funció **configura** → **Executa** → acceptar permisos (Gmail, Drive i activadors).
   - **Implementa → Nova implementació → Aplicació web**, *Executa com a: Jo*, *Qui hi té accés: Qualsevol usuari*.
   - Copiar l'URL `/exec` i provar-lo en una **pestanya privada**.
   - A l'app: roda dentada → URL + clau → **Desa** → ha de sortir «Script connectat correctament».
5. **Prova final:** enviar un tiquet de prova, comprovar que arriba el correu i que el PDF és a Drive a `Tiquets/AAAA-MM`. Després pot provar «Envia ara el resum d'aquest mes» i esborrar les proves del Drive (i buidar la paperera).

## Problemes ja vistos i què volen dir

| Símptoma | Causa | Solució |
|---|---|---|
| Error de sintaxi en desar | Ha quedat `function myFunction() {}`, hi ha dos fitxers al projecte, o s'han copiat les tres cometes del bloc de codi | Ctrl+A, Suprimeix, tornar a enganxar; deixar un sol fitxer |
| L'URL mostra «No s'ha trobat la funció de l'script: doGet» | S'ha implementat abans de desar el codi (la implementació és una còpia fixa) | Desar i fer **Gestiona les implementacions → llapis → Versió nova → Implementa** |
| A l'app: «Load failed» o «L'script no respon» | L'app té l'URL d'una implementació antiga, o l'accés és «Qualsevol usuari amb compte de Google» | Copiar l'URL de *Gestiona les implementacions*, provar-lo en pestanya privada, revisar l'accés |
| No apareix l'opció «Qualsevol usuari» | L'script està creat amb un compte d'empresa (Google Workspace) que ho prohibeix | Crear l'script amb un Gmail personal i posar l'adreça de la feina a `DESTINATARI` |
| URL amb `/u/1/` al mig | Copiat de la barra d'adreces amb diversos comptes oberts | L'app ja ho neteja sola; millor copiar-lo del diàleg d'implementació |
| L'app sembla no canviar després d'una actualització | Memòria cau de Safari / GitHub Pages (uns 10 min) | Esperar i recarregar, o obrir l'adreça amb `?v=2` al final |
| A l'iPhone, a la pantalla d'inici «ha perdut» la configuració | La icona de la pantalla d'inici té un emmagatzematge separat del de Safari | Tornar a posar URL i clau des de la icona |

## Recorda

- Quan canviïs el `Code.gs`, la implementació s'ha d'actualitzar amb **Versió nova** (no «Nova implementació»), així l'URL no canvia.
- Si canvies fitxers de l'app, incrementa `CACHE` a `sw.js` (p. ex. `tiquets-v6`).
- Parla-li en el seu idioma i amb passos curts; dona els noms dels botons tal com els veurà.
