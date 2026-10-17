/* =========================================================
   Invitation de mariage · Ibrahima & Fatima
   ========================================================= */

/* ------------------ À PERSONNALISER ------------------ */
const CONFIG = {
  // Numéro WhatsApp au format international, sans "+" ni espaces (ex : 221771234567).
  // Utilisé pour l'icône WhatsApp et, si aucun lien Google Sheet n'est renseigné, pour le RSVP.
  whatsapp: "",

  // Lien de l'application Google Apps Script qui enregistre les réponses dans un Google Sheet
  // (voir README.md). Laisser vide pour envoyer les réponses par WhatsApp.
  rsvpEndpoint: "",

  // Date et heure de début (heure de Dakar = GMT).
  date: "2026-10-31T16:30:00Z",

  // Lieu
  place: "Maison Madera, Almadies, Dakar",
  // Coordonnées GPS précises (facultatif mais recommandé) : ex. { lat: 14.7449, lng: -17.5126 }
  coords: null,
};
/* ----------------------------------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------ Préchargement ------------------ */
function preload() {
  const images = ["assets/lace-corner.webp"].map(
    (src) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = src; })
  );
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  // On n'attend jamais plus de 4 s, même sur une connexion lente.
  return Promise.race([Promise.all([...images, fonts]), wait(4000)]);
}

/* ------------------ Ouverture de l'enveloppe ------------------ */
const intro = $("#intro");
const envelope = $("#envelope");
const site = $("#site");
let opened = false;

async function openEnvelope() {
  if (opened) return;
  opened = true;
  if (navigator.vibrate) navigator.vibrate(18);

  const t = reducedMotion ? 0.2 : 1;
  envelope.classList.add("is-opening");       // le sceau se brise
  await wait(650 * t);
  envelope.classList.add("flap-open");        // le rabat s'ouvre
  await wait(500 * t);
  envelope.classList.add("flap-behind");
  await wait(300 * t);
  envelope.classList.add("letter-out");       // la lettre glisse vers le haut
  await wait(1300 * t);
  showSite();
}

function showSite() {
  try { sessionStorage.setItem("invitation-opened", "1"); } catch (_) {}
  intro.classList.add("is-leaving");
  document.body.classList.remove("is-locked");
  site.removeAttribute("aria-hidden");
  site.classList.add("is-visible");
  window.scrollTo(0, 0);
  setTimeout(() => { intro.remove(); }, 1500);
}

$("#seal").addEventListener("click", openEnvelope);

/* ------------------ Apparition des sections ------------------ */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
  }),
  { threshold: 0.18 }
);
$$(".panel").forEach((p) => io.observe(p));

/* ------------------ Menu ------------------ */
const toggle = $("#menu-toggle");
function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
}
toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
$$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { setMenu(false); closeSheet(); }
});

/* ------------------ Compte à rebours ------------------ */
const countdown = $("#countdown");
const target = new Date(CONFIG.date).getTime();
function tick() {
  const diff = target - Date.now();
  if (diff <= 0) {
    countdown.classList.add("is-today");
    countdown.textContent = diff > -12 * 3600e3 ? "C’est aujourd’hui !" : "Merci d’avoir partagé ce jour avec nous.";
    return false;
  }
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  $('[data-cd="d"]', countdown).textContent = d;
  $('[data-cd="h"]', countdown).textContent = String(h).padStart(2, "0");
  $('[data-cd="m"]', countdown).textContent = String(m).padStart(2, "0");
  return true;
}
if (tick()) { const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 20000); }

/* ------------------ Cartes & itinéraire ------------------ */
const ua = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const dest = CONFIG.coords ? `${CONFIG.coords.lat},${CONFIG.coords.lng}` : CONFIG.place;
const q = encodeURIComponent(dest);

const links = {
  google: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
  apple: CONFIG.coords
    ? `https://maps.apple.com/?daddr=${q}&q=${encodeURIComponent("Maison Madera")}`
    : `https://maps.apple.com/?daddr=${q}`,
  waze: CONFIG.coords
    ? `https://waze.com/ul?ll=${q}&navigate=yes`
    : `https://waze.com/ul?q=${q}&navigate=yes`,
};
$("#open-google").href = links.google;
$("#open-apple").href = links.apple;
$("#open-waze").href = links.waze;

// Carte intégrée, chargée seulement quand on approche de la section
const map = $("#map");
const mapIO = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    map.src = `https://maps.google.com/maps?q=${q}&z=15&output=embed&hl=fr`;
    mapIO.disconnect();
  }
}, { rootMargin: "400px" });
mapIO.observe(map);

const sheet = $("#maps-sheet");
function openSheet() { sheet.hidden = false; }
function closeSheet() { sheet.hidden = true; }
$$("[data-close]", sheet).forEach((el) => el.addEventListener("click", closeSheet));
$$(".sheet-option", sheet).forEach((el) => el.addEventListener("click", () => setTimeout(closeSheet, 300)));

// iPhone : on laisse choisir (Plans, Google Maps, Waze). Android / ordinateur : Google Maps directement.
const directions = $("#directions");
directions.href = links.google;
directions.addEventListener("click", (e) => {
  if (isIOS) { e.preventDefault(); openSheet(); }
});
$("#other-apps").addEventListener("click", openSheet);

/* ------------------ WhatsApp ------------------ */
const waNumber = CONFIG.whatsapp.replace(/\D/g, "");
const waLink = (text) => `https://wa.me/${waNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
const waIcon = $("#whatsapp-link");
if (waNumber) waIcon.href = waLink("Assalamou aleykoum Ibrahima & Fatima ! ");
else waIcon.remove();

/* ------------------ RSVP ------------------ */
const form = $("#rsvp-form");
const done = $("#rsvp-done");
const errorEl = $("#rsvp-error");
const submitBtn = $("#rsvp-submit");
const STORAGE_KEY = "rsvp-ibrahima-fatima";

function showDone(entry) {
  form.hidden = true;
  done.hidden = false;
  $("#rsvp-done-text").textContent = entry.presence === "Présent(e)"
    ? `Merci ${entry.nom.split(" ")[0]}, nous avons hâte de vous retrouver le 31 octobre !`
    : `Merci ${entry.nom.split(" ")[0]} de nous avoir prévenus. Vous serez dans nos cœurs et nos prières.`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nom = form.nom.value.trim();
  const presence = (form.querySelector('input[name="presence"]:checked') || {}).value;
  if (!nom) { errorEl.textContent = "Merci d’indiquer votre nom et prénom."; form.nom.focus(); return; }
  if (!presence) { errorEl.textContent = "Merci d’indiquer si vous serez présent(e)."; return; }
  errorEl.textContent = "";
  const entry = { nom, presence, date: new Date().toISOString() };

  if (CONFIG.rsvpEndpoint) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi…";
    try {
      const body = new URLSearchParams({ nom, presence });
      await fetch(CONFIG.rsvpEndpoint, { method: "POST", mode: "no-cors", body });
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirmer ma présence";
      errorEl.textContent = "L’envoi n’a pas abouti. Vérifiez votre connexion et réessayez.";
      return;
    }
  } else {
    const msg = presence === "Présent(e)"
      ? `Assalamou aleykoum ! Je confirme ma présence au mariage d'Ibrahima & Fatima le samedi 31 octobre 2026.\n\nNom : ${nom}`
      : `Assalamou aleykoum ! Je ne pourrai malheureusement pas être présent(e) au mariage d'Ibrahima & Fatima le 31 octobre 2026.\n\nNom : ${nom}`;
    window.open(waLink(msg), "_blank", "noopener");
  }

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entry)); } catch (_) {}
  showDone(entry);
});

$("#rsvp-again").addEventListener("click", () => {
  done.hidden = true;
  form.hidden = false;
  submitBtn.disabled = false;
  submitBtn.textContent = "Confirmer ma présence";
});

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (saved) { showDone(saved); form.nom.value = saved.nom; }
} catch (_) {}

/* ------------------ Démarrage ------------------ */
preload().then(() => {
  $("#loader").classList.add("is-hidden");
  // Si l'invité a déjà ouvert l'enveloppe pendant cette visite (ex : rechargement), on va droit au site.
  let seen = false;
  try { seen = !!sessionStorage.getItem("invitation-opened"); } catch (_) {}
  if (seen) {
    opened = true;
    intro.remove();
    document.body.classList.remove("is-locked");
    site.removeAttribute("aria-hidden");
    site.classList.add("is-visible");
  } else {
    requestAnimationFrame(() => intro.classList.add("is-ready"));
  }
});
