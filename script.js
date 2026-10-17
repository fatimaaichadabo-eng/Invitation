/* =========================================================
   Invitation de mariage · Ibrahima & Fatima
   ========================================================= */

/* ------------------ À PERSONNALISER ------------------ */
const CONFIG = {
  // Boutons WhatsApp de la dernière page (numéro international, sans "+" ni espaces).
  whatsapp: [
    { name: "Ibrahima", number: "221781101620" },
    { name: "Fatima", number: "221785469101" },
  ],

  // Application Google Apps Script qui enregistre les réponses RSVP dans le Google Sheet.
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbyiTAa2-JNwyizhkaVgbVOP3wNTfwJX4QUxnCmYBJRw4jQWvdXxbxIuteh195bpEKa7-A/exec",

  // Date et heure de début (heure de Dakar = GMT).
  date: "2026-10-31T16:00:00Z",

  // Lieu
  place: "Maison Madera, Almadies, Dakar",
  // Coordonnées GPS précises (facultatif) : ex. { lat: 14.7449, lng: -17.5126 }
  coords: null,
};
/* ----------------------------------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

/* ------------------ Préchargement ------------------ */
const INTRO_IMAGES = [
  "assets/enveloppe-fermee.webp", "assets/enveloppe-ouverte.webp", "assets/sceau.webp",
  "assets/dentelle-coin.webp", "assets/dentelle-bordure.webp", "assets/gypsophile.webp", "assets/papier.jpg",
];
const LATER_IMAGES = ["assets/notre-jour.webp", "assets/merci.webp"];

const loadImage = (src) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = src; });

function preload() {
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  // On n'attend jamais plus de 5 s, même sur une connexion lente.
  return Promise.race([Promise.all([...INTRO_IMAGES.map(loadImage), fonts]), wait(5000)]);
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

  const t = reducedMotion ? 0.15 : 1;
  envelope.classList.add("is-breaking");     // le sceau se brise
  await wait(550 * t);
  envelope.classList.add("is-opening");      // le rabat se soulève…
  await wait(380 * t);
  envelope.classList.add("flap-up");         // …et se rabat vers le haut
  await wait(550 * t);
  envelope.classList.add("letter-out");      // la lettre glisse hors de l'enveloppe
  await wait(1900 * t);
  showSite(true);
}

function showSite(animate) {
  try { sessionStorage.setItem("invitation-opened", "1"); } catch (_) {}
  root.classList.remove("is-locked");
  site.removeAttribute("aria-hidden");
  site.classList.add("is-visible");
  window.scrollTo(0, 0);
  if (animate) {
    intro.classList.add("is-leaving");
    setTimeout(() => intro.remove(), 1500);
  } else {
    intro.remove();
  }
}

$("#seal").addEventListener("click", openEnvelope);

/* ------------------ Pages : apparition et défilement ------------------ */
const panels = $$(".panel");

const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.intersectionRatio >= 0.3) e.target.classList.add("is-visible");
    else if (!e.isIntersecting) e.target.classList.remove("is-visible");
  }),
  { threshold: [0, 0.3] }
);
panels.forEach((p) => io.observe(p));

// « Faites défiler » en bas de chaque page, sauf la dernière
const chevron = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
panels.slice(0, -1).forEach((panel, i) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "scroll-hint";
  btn.setAttribute("aria-label", "Page suivante");
  btn.innerHTML = `<span>Faites défiler</span>${chevron}`;
  btn.addEventListener("click", () => panels[i + 1].scrollIntoView({ behavior: "smooth" }));
  panel.appendChild(btn);
});

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

// Carte intégrée, chargée seulement à l'approche de la section
const map = $("#map");
const mapIO = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    map.src = `https://maps.google.com/maps?q=${q}&z=15&output=embed&hl=fr`;
    mapIO.disconnect();
  }
}, { rootMargin: "600px" });
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
const waIcon = $("#wa-icon").content;
const waBox = $("#wa-buttons");
CONFIG.whatsapp.forEach(({ name, number }) => {
  const a = document.createElement("a");
  a.className = "wa-btn";
  a.href = `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(`Assalamou aleykoum ${name} ! `)}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", `Écrire à ${name} sur WhatsApp`);
  a.append(waIcon.cloneNode(true), name);
  waBox.appendChild(a);
});

/* ------------------ RSVP ------------------ */
const form = $("#rsvp-form");
const done = $("#rsvp-done");
const errorEl = $("#rsvp-error");
const submitBtn = $("#rsvp-submit");
const STORAGE_KEY = "rsvp-ibrahima-fatima";

function showDone(entry) {
  const first = entry.nom.split(" ")[0];
  form.hidden = true;
  done.hidden = false;
  $("#rsvp-done-text").textContent = entry.presence === "Présent(e)"
    ? `Merci ${first}, nous avons hâte de vous retrouver le 31 octobre !`
    : `Merci ${first} de nous avoir prévenus. Vous serez dans nos cœurs et nos prières.`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nom = form.nom.value.trim();
  const presence = (form.querySelector('input[name="presence"]:checked') || {}).value;
  if (!nom) { errorEl.textContent = "Merci d’indiquer votre nom et prénom."; form.nom.focus(); return; }
  if (!presence) { errorEl.textContent = "Merci d’indiquer si vous serez présent(e)."; return; }
  errorEl.textContent = "";
  const entry = { nom, presence };

  submitBtn.disabled = true;
  submitBtn.textContent = "Envoi…";
  try {
    // "no-cors" : Google n'autorise pas la lecture de la réponse, mais la ligne est bien ajoutée.
    await fetch(CONFIG.rsvpEndpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(entry) });
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Confirmer ma présence";
    errorEl.textContent = "L’envoi n’a pas abouti. Vérifiez votre connexion internet et réessayez.";
    return;
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
  LATER_IMAGES.forEach(loadImage);
  // Si l'invité a déjà ouvert l'enveloppe pendant cette visite (ex : rechargement), on va droit au site.
  let seen = false;
  try { seen = !!sessionStorage.getItem("invitation-opened"); } catch (_) {}
  if (seen) { opened = true; showSite(false); }
  else requestAnimationFrame(() => intro.classList.add("is-ready"));
});
