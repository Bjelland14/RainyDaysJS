const API = "https://v2.api.noroff.dev/rainy-days";
const listEl = document.querySelector("#product-list");
const controlsEl = document.querySelector("#controls");
const statusEl = document.querySelector("#status");
const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

function setStatus(msg) {
  if (!statusEl) return;
  statusEl.hidden = !msg;
  statusEl.textContent = msg || "";
  statusEl.dataset.variant = msg ? "info" : "";
}

function card(p) {
  const onSale = p.onSale && p.discountedPrice < p.price;
  const price = onSale
    ? `<s>${money.format(p.price)}</s> <strong>${money.format(p.discountedPrice)}</strong>`
    : `<strong>${money.format(p.price)}</strong>`;
  return `
    <article class="card">
      <a class="card-link" href="product/index.html?id=${encodeURIComponent(p.id)}">
        <img src="${p.image?.url}" alt="${p.image?.alt || p.title}" loading="lazy" />
        <h3>${p.title}</h3>
      </a>
      <p class="price">${price}</p>
      <p class="meta"><span>${p.gender}</span> • <span>${(p.tags||[]).join(", ")}</span></p>
      <a class="button" href="/product/product.html?id=${encodeURIComponent(p.id)}">Show details</a>
    </article>`;
}

function render(list) {
  if (!listEl) return;
  listEl.innerHTML = list.length ? list.map(card).join("") : "<p>Fant ingen produkter.</p>";
}

(async function init() {
  try {
    setStatus("Laster produkter …");
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data = [] } = await res.json();

    const url = new URL(location.href);
    const genderFromURL = url.searchParams.get("gender") || ""; 

    const initial = genderFromURL ? data.filter(p => p.gender === genderFromURL) : data;
    render(initial);

    if (controlsEl) {
      controlsEl.innerHTML = `
        <form id="filters" class="filters">
          <label>
            Kjønn
            <select name="gender">
              <option value="">Alle</option>
              <option value="Male"${genderFromURL==="Male"?" selected":""}>Male</option>
              <option value="Female"${genderFromURL==="Female"?" selected":""}>Female</option>
            </select>
          </label>
          <button type="submit">Bruk filter</button>
        </form>`;
      const form = controlsEl.querySelector("#filters");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const g = new FormData(form).get("gender") || "";
        const filtered = g ? data.filter(p => p.gender === g) : data;
        render(filtered);
      });
    }
  } catch (e) {
    setStatus("Kunne ikke hente produkter. Prøv igjen senere.");
  } finally {
    setStatus("");
  }
})();
