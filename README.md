# Invitation · Ibrahima & Fatima — 31 octobre 2026

Invitation de mariage numérique : enveloppe à ouvrir en touchant le sceau, accueil, notre jour,
programme, localisation (Google Maps / Plans / Waze), RSVP, verset et page de remerciement.

Fichiers : `index.html` (contenu), `style.css` (design), `script.js` (animations et réglages),
`assets/` (dentelle et image d'aperçu WhatsApp). Aucune installation n'est nécessaire.

## 1. Réglages (en haut de `script.js`)

```js
const CONFIG = {
  whatsapp: "221XXXXXXXXX",   // votre numéro, sans + ni espaces
  rsvpEndpoint: "",           // lien Google Sheet (étape 2), facultatif
  coords: null,               // ex. { lat: 14.74, lng: -17.51 } pour un itinéraire précis
};
```

- Sans `whatsapp`, l'icône WhatsApp de la dernière page est masquée.
- Pour `coords` : sur Google Maps, faites un appui long sur la Maison Madera et copiez les deux nombres affichés.

## 2. Réception des réponses RSVP

**Option A : WhatsApp (rien à configurer).** Si `rsvpEndpoint` est vide, le bouton
« Confirmer ma présence » ouvre WhatsApp avec un message déjà rédigé vers votre numéro.
L'invité doit encore appuyer sur « Envoyer ».

**Option B : Google Sheet (recommandé).** Toutes les réponses arrivent dans un seul tableau, sans
action supplémentaire de l'invité.

1. Créez un Google Sheet, ligne 1 : `Date | Nom | Présence`.
2. Menu **Extensions → Apps Script**, remplacez le code par :

   ```js
   function doPost(e) {
     SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
       .appendRow([new Date(), e.parameter.nom, e.parameter.presence]);
     return ContentService.createTextOutput("ok");
   }
   ```
3. **Déployer → Nouveau déploiement → Application Web**, « Exécuter en tant que : moi »,
   « Accès : Tout le monde ». Autorisez, puis copiez l'URL (`https://script.google.com/macros/s/…/exec`).
4. Collez-la dans `rsvpEndpoint`.

## 3. Mise en ligne (GitHub Pages, gratuit)

Dépôt GitHub → **Settings → Pages** → Source : *Deploy from a branch*, choisir la branche et `/ (root)`.
Le site sera disponible à `https://fatimaaichadabo-eng.github.io/invitation/`.

Si l'adresse finale est différente, mettez à jour la balise `og:image` dans `index.html`
(c'est l'image qui apparaît dans l'aperçu du lien sur WhatsApp).

## Test en local

Ouvrez simplement `index.html` dans un navigateur. Pour revoir l'animation de l'enveloppe après
l'avoir ouverte, fermez l'onglet et rouvrez-le (elle n'est montrée qu'une fois par visite).
