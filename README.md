# Tiquets: escàner de tiquets cap al teu correu

App web per al mòbil. Fas una foto d'un tiquet (taxi, restaurant, menú…), l'app troba les vores, el posa recte, el deixa net, en fa un **PDF** i te l'envia per correu. A més, cada tiquet es desa al teu Google Drive i el **dia 1 de cada mes** reps un correu amb tots els tiquets del mes anterior, una taula (data, tipus, import, nota) i el **total**.

Cada persona fa servir el **seu** correu i el **seu** Drive: l'enviament el fa un petit script dins el compte de Google de cadascú. Ningú més no veu els tiquets.

## Què hi ha a la carpeta

| Fitxer | Per a què serveix |
|---|---|
| `index.html` | L'app sencera |
| `jspdf.umd.min.js` | Llibreria que genera el PDF (inclosa, funciona sense connexió) |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | Permeten instal·lar-la a la pantalla d'inici i obrir-la amb poca cobertura |
| `google-apps-script/Code.gs` | Script de Google: envia el correu, desa al Drive i fa el resum mensual |
| `INSTRUCCIONS-PER-A-CLAUDE.md` | Guia perquè Claude t'ajudi a fer tota la instal·lació |

## Pas 1: l'app a internet (https)

Tens dues opcions:

- **Fer servir l'app que ja està publicada:** <https://jormarllor.github.io/escaner-tiquets/>. L'app no guarda ni envia res pel seu compte: només parla amb l'script que tu configuris. Pots saltar directament al pas 2.
- **Publicar-ne la teva còpia:** puja tots aquests fitxers (l'arrel de la carpeta) a un repositori **públic** de GitHub i activa *Settings → Pages → Branch: main, / (root) → Save*. Al cap d'un o dos minuts la tindràs a `https://EL-TEU-USUARI.github.io/NOM-DEL-REPO/`. També serveixen Netlify, Cloudflare Pages o qualsevol servidor amb https.

## Pas 2: instal·lar-la al telèfon

- **iPhone (Safari):** obre l'adreça, toca *Compartir* → *Afegir a la pantalla d'inici*.
- **Android (Chrome):** obre l'adreça, menú ⋮ → *Instal·la l'aplicació*.

A l'iPhone, l'app de la pantalla d'inici guarda la configuració per separat de Safari: configura-la (pas 3, punt 8) des de la icona de la pantalla d'inici.

## Pas 3: l'script de Google (correu + Drive + resum mensual)

Millor des de l'ordinador: l'editor de Google al mòbil funciona malament.

1. Ves a <https://script.google.com> amb el compte de Google que vulguis fer servir i crea un **Projecte nou**.
2. **Buida l'editor del tot** (Ctrl+A, Suprimeix: no hi ha de quedar el `function myFunction() {}` que hi posa Google) i enganxa tot el contingut de `google-apps-script/Code.gs`. Al panell de l'esquerra hi ha d'haver **un sol fitxer**.
3. Canvia les dues primeres variables:
   - `SECRET`: una clau llarga inventada (p. ex. `tiquets-8f3k2-pruna-vermella-71`).
   - `DESTINATARI`: l'adreça on vols rebre els tiquets. Si la deixes buida (`''`), arriben al mateix compte de Google.
   - Opcional: `ENVIA_AL_MOMENT = false` si només vols el resum mensual i no un correu per cada tiquet.
4. **Desa** (icona del disquet o Ctrl+S). L'avís de "canvis sense desar" ha de desaparèixer. Si surt un error de sintaxi, és que el pas 2 no ha quedat net.
5. Al desplegable de funcions de la barra de dalt, tria **configura** i toca **Executa**. Accepta els permisos (Google dirà que l'app no està verificada: *Configuració avançada → Ves a…*; és el teu propi script). Al registre ha de sortir "Fet. El resum mensual arribarà el dia 1…".
6. **Implementa → Nova implementació →** engranatge **→ Aplicació web**:
   - *Executa com a:* **Jo**
   - *Qui hi té accés:* **Qualsevol usuari** (no "Qualsevol usuari amb compte de Google")
   - **Implementa** i copia l'**URL de l'aplicació web** (acaba en `/exec`).
7. Prova l'URL en una **pestanya privada** del navegador: ha de mostrar `{"ok":true,"message":"Tiquets: script actiu."}`. Si demana iniciar sessió, revisa *Qui hi té accés*.
8. A l'app, toca la **roda dentada**, enganxa l'URL i la mateixa clau, i **Desa**. L'app comprova la connexió i ha de dir **"Script connectat correctament"**.

> Quan canviïs el codi de l'script, fes sempre **Implementa → Gestiona les implementacions → llapis → Versió: Versió nova → Implementa**. Així l'URL no canvia i no cal tocar l'app.

> Seguretat: l'script només envia a l'adreça configurada i comprova la clau secreta, per això ningú no el pot fer servir per enviar correus a tercers. No pugis mai a GitHub el `Code.gs` amb la clau posada. Límit de Google: unes 100 enviades al dia amb un compte gratuït.

### Sense script

Si no configures l'script, el botó obre el menú *Compartir* del telèfon amb el PDF adjunt i tries l'app de correu. En aquest cas no hi ha Drive ni resum mensual.

## Com s'utilitza

1. **Fes una foto del tiquet**: millor sobre una superfície fosca i amb bona llum.
2. L'app marca les vores automàticament. Si cal, arrossega les cantonades. Tria el filtre **Document**, **Gris** o **Color**. Toca **Fet**.
3. Si el tiquet és llarg, **Afegeix una altra pàgina**: totes aniran al mateix PDF.
4. Tria el tipus (Taxi, Restaurant…), escriu l'**import** i, si vols, una nota. L'import és el que suma al total del resum mensual.
5. **Envia al correu**. Assumpte: `Tiquet Taxi – 18/11/2026 – 38,60 € – Aeroport`, fitxer `tiquet_2026-11-18_taxi_38-60eur.pdf`.

**Resum mensual:** el dia 1 a les 8 h arriba un correu amb tots els PDF del mes anterior i el total. Per demanar el del mes en curs abans d'hora: roda dentada → **Envia ara el resum d'aquest mes**. Els PDF són al Drive a `Tiquets/AAAA-MM`; si n'esborres un (per exemple, una prova), deixa de sortir al resum.

Les fotos no es desen al telèfon: només hi són fins que s'envien.
