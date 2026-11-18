# Tiquets: escàner de tiquets cap al teu correu

App web per al mòbil. Fas una foto d'un tiquet (taxi, restaurant, menú…), l'app troba les vores, el posa recte, el deixa blanc i negre net, en fa un PDF i te l'envia per correu.

## Què hi ha a la carpeta

| Fitxer | Per a què serveix |
|---|---|
| `index.html` | L'app sencera |
| `jspdf.umd.min.js` | Llibreria que genera el PDF (inclosa, funciona sense connexió) |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | Permeten instal·lar-la a la pantalla d'inici i obrir-la sense cobertura |
| `google-apps-script/Code.gs` | Script opcional per enviar el correu amb un sol toc |

## Pas 1: l'app a internet

Està publicada amb **GitHub Pages** a <https://jormarllor.github.io/escaner-tiquets/> (https, necessari perquè el telèfon la pugui instal·lar). Cada canvi que es pugi a la branca `main` es publica sol en un parell de minuts.

## Pas 2: instal·lar-la al telèfon

- **iPhone (Safari):** obre l'adreça, toca *Compartir* i després *Afegir a la pantalla d'inici*.
- **Android (Chrome):** obre l'adreça, toca el menú ⋮ i després *Instal·la l'aplicació*.

## Pas 3: triar com arriba el correu

### Opció A: enviament directe amb un sol toc (recomanada)

Fa servir un script gratuït al teu compte de Google, que envia el correu des del teu Gmail cap a tu mateix.

1. Ves a <https://script.google.com> i crea un **Projecte nou**.
2. Esborra el que hi hagi i enganxa el contingut de `google-apps-script/Code.gs`.
3. Canvia `SECRET` per una clau llarga inventada (p. ex. `tiquets-8f3k2-pruna-vermella`).
   Si vols que els tiquets vagin a una altra bústia (p. ex. la de la feina), posa-la a `DESTINATARI`.
4. **Implementa → Nova implementació →** engranatge **→ Aplicació web**
   - *Executa com a:* **Jo**
   - *Qui hi té accés:* **Qualsevol usuari**
5. Autoritza els permisos (Google avisarà que l'app no està verificada: *Configuració avançada → Ves a…*. És el teu propi script).
6. Copia l'URL que acaba en `/exec`.
7. A l'app, toca la roda dentada i enganxa l'URL i la mateixa clau secreta. Desa.

El botó passarà a dir **Envia al correu** i el PDF arribarà directament, sense passos intermedis.

**Resum mensual.** Cada tiquet també es desa a Google Drive, a la carpeta `Tiquets/AAAA-MM`. El dia 1 de cada mes reps un correu amb tots els PDF del mes anterior i una taula amb data, tipus, import, nota i el total. Per activar-ho, a l'editor de l'script tria la funció `configura` i toca **Executa** (només cal un cop). Des de la roda dentada de l'app pots demanar el resum del mes en curs quan vulguis. Si només vols el resum mensual i no el correu de cada tiquet, posa `ENVIA_AL_MOMENT = false`.

> Quan canviïs el codi de l'script, fes sempre **Implementa → Gestiona les implementacions → llapis → Versió nova**. Així l'URL no canvia.

> Seguretat: l'script només envia a la teva adreça i comprova la clau secreta, per això ningú no el pot fer servir per enviar correus a altres persones. Límit de Google: unes 100 enviades al dia amb un compte gratuït.

### Opció B: sense configurar res

Si no poses cap script, el botó **Comparteix per correu** obre el menú *Compartir* del telèfon amb el PDF adjunt. Tries Mail o Gmail i escrius la teva adreça (normalment s'autocompleta).

## Com s'utilitza

1. **Fes una foto del tiquet**: millor sobre una superfície fosca i amb bona llum.
2. L'app marca les vores automàticament. Si cal, arrossega les cantonades. Tria el filtre **Document**, **Gris** o **Color**. Toca **Fet**.
3. Si el tiquet és llarg, **Afegeix una altra pàgina**: totes aniran al mateix PDF.
4. Tria el tipus (Taxi, Restaurant…) i, si vols, l'import i una nota.
5. **Envia**. L'assumpte del correu queda així: `Tiquet Taxi – 18/11/2026 – 38,60 € – Aeroport`, amb el fitxer `tiquet_2026-11-18_taxi_38-60eur.pdf`.

Les fotos no es desen enlloc: només viuen al telèfon fins que s'envien.
