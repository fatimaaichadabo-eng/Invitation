# Invitation · Ibrahima & Fatima — 31 octobre 2026

Invitation de mariage numérique : enveloppe à ouvrir en touchant le sceau, accueil, notre jour,
programme, localisation (Google Maps / Plans / Waze), RSVP, verset et page de remerciement.

Fichiers : `index.html` (contenu), `style.css` (design), `script.js` (animations et réglages),
`assets/` (dentelle et image d'aperçu WhatsApp). Aucune installation n'est nécessaire.

## 1. Réglages (en haut de `script.js`)

```js
const CONFIG = {
  whatsapp: [ { name: "Ibrahima", number: "221781101620" }, { name: "Fatima", number: "221785469101" } ],
  rsvpEndpoint: "https://script.google.com/macros/s/…/exec",  // Google Sheet des réponses
  coords: { lat: 14.742158, lng: -17.520318 },   // entrée principale (l itinéraire arrive par devant)
};
```

## 2. Réponses RSVP (Google Sheet)

Chaque réponse ajoute une ligne `Date | Nom et prénom | Présence` au Google Sheet relié au script
Apps Script ci-dessous (Extensions → Apps Script, déployé en « Application Web », accès « Tout le monde ») :

```js
function doPost(e) {
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
    .appendRow([new Date(), e.parameter.nom, e.parameter.presence]);
  return ContentService.createTextOutput("ok");
}
```

## Images (`assets/`)

`enveloppe-fermee.webp` et `enveloppe-ouverte.webp` partagent le même cadre (1516 × 1478 à l'origine) pour
que le rabat s'ouvre sans saut ; les découpes de l'animation dans `style.css` dépendent de ce cadre.

## 3. Mise en ligne (GitHub Pages, gratuit)

Dépôt GitHub → **Settings → Pages** → Source : *Deploy from a branch*, choisir la branche et `/ (root)`.
Le site sera disponible à `https://fatimaaichadabo-eng.github.io/Invitation/`.

Si l'adresse finale est différente, mettez à jour la balise `og:image` dans `index.html`
(c'est l'image qui apparaît dans l'aperçu du lien sur WhatsApp).

## Test en local

Ouvrez simplement `index.html` dans un navigateur. Pour revoir l'animation de l'enveloppe après
l'avoir ouverte, fermez l'onglet et rouvrez-le (elle n'est montrée qu'une fois par visite).
