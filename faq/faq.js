const SCOPE = "faq-v1";

const main = document.querySelector("main");
const faq = document.querySelector(".faq");
const items = Array.from(faq.querySelectorAll("details"));

/* Toolbar (search + open/close) */
const toolbar = document.createElement("div");
toolbar.className = "faq-toolbar";
toolbar.innerHTML = `
  <form id="faq-tools" class="faq-tools" role="search" aria-label="Search FAQs">
    <input id="faq-search" name="q" type="search" placeholder="Search questions…" autocomplete="off" />
    <div class="faq-actions">
      <button type="button" id="open-all">Open all</button>
      <button type="button" id="close-all">Close all</button>
    </div>
  </form>
`;
main.insertBefore(toolbar, faq);

/* Persist open/closed state */
function loadState() {
  try { return JSON.parse(localStorage.getItem(SCOPE) || "{}"); }
  catch { return {}; }
}
function saveState(state) {
  localStorage.setItem(SCOPE, JSON.stringify(state));
}
const state = loadState();

/* ARIA + IDs + state restore */
items.forEach((d, idx) => {
  if (!d.id) d.id = `faq-${idx + 1}`;
  const summary = d.querySelector("summary");
  summary.setAttribute("role", "button");
  summary.setAttribute("aria-controls", `${d.id}-panel`);

  // Wrap content (everything but summary) for aria-controls
  let panel = d.querySelector(":scope > .faq-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.className = "faq-panel";
    const rest = [];
    for (const node of Array.from(d.childNodes)) {
      if (node !== summary) rest.push(node);
    }
    rest.forEach(n => panel.appendChild(n));
    d.appendChild(panel);
  }
  panel.id = `${d.id}-panel`;

  // restore open/close
  const wasOpen = state[d.id];
  if (typeof wasOpen === "boolean") d.open = wasOpen;

  summary.setAttribute("aria-expanded", d.open ? "true" : "false");
  d.addEventListener("toggle", () => {
    state[d.id] = d.open;
    saveState(state);
    summary.setAttribute("aria-expanded", d.open ? "true" : "false");
  });
});

/* Open/close all */
document.querySelector("#open-all").addEventListener("click", () => {
  items.forEach(d => (d.open = true));
  items.forEach(d => (state[d.id] = true));
  saveState(state);
});
document.querySelector("#close-all").addEventListener("click", () => {
  items.forEach(d => (d.open = false));
  items.forEach(d => (state[d.id] = false));
  saveState(state);
});

/* Search */
const searchInput = document.querySelector("#faq-search");
function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "");
}
function matches(details, q) {
  if (!q) return true;
  const txt = normalize(details.textContent);
  return txt.includes(q);
}
function applyFilter(qRaw) {
  const q = normalize(qRaw);
  let firstMatch = null;
  items.forEach(d => {
    const hit = matches(d, q);
    d.style.display = hit ? "" : "none";
    if (hit && !firstMatch) firstMatch = d;
  });
  if (q && firstMatch && !firstMatch.open) firstMatch.open = true;
}
searchInput.addEventListener("input", (e) => applyFilter(e.target.value));

/* Deep-link: faq.html#faq-shipping opens that item */
function openFromHash() {
  const id = location.hash?.slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (target && target.tagName.toLowerCase() === "details") {
    target.open = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    const s = target.querySelector("summary");
    if (s) s.focus({ preventScroll: true });
  }
}
window.addEventListener("hashchange", openFromHash);
openFromHash();

/* Keyboard polish: Enter toggles details */
faq.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.tagName.toLowerCase() === "summary") {
    e.preventDefault();
    e.target.click();
  }
});
