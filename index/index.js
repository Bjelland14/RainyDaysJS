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

function productHref(id) {

  return `product/?id=${encodeURIComponent(id)}`;
}

function card(p) {
  const onSale = p.onSale && typeof p.discountedPrice === "number" && p.discountedPrice < p.price;
  const priceHtml = onSale
    ? `<s>${money.format(p.price)}</s> <strong aria-label="Discounted price">${money.format(p.discountedPrice)}</strong>`
    : `<strong>${money.format(p.price)}</strong>`;

  const imgUrl = p.image?.url || "";
  const imgAlt = p.image?.alt || p.title || "Product image";

  return `
    <article class="card">
      <a class="card-link" href="${productHref(p.id)}" aria-label="View ${p.title}">
        <img src="${imgUrl}" alt="${imgAlt}" loading="lazy" />
        <h3>${p.title}</h3>
      </a>
      <p class="price">${priceHtml}</p>
      <p class="meta">
        <span>${p.gender || "Unisex"}</span>
        ${Array.isArray(p.tags) && p.tags.length ? ` • <span>${p.tags.join(", ")}</span>` : ""}
      </p>
      <a class="button" href="${productHref(p.id)}">Show details</a>
    </article>
  `;
}

function render(list) {
  if (!listEl) return;
  listEl.innerHTML = list && list.length
    ? list.map(card).join("")
    : `<p role="status">Found no products.</p>`;
}

(async function init() {
  try {
    setStatus("Laster produkter …");

    const res = await fetch(API, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    const data = Array.isArray(payload?.data) ? payload.data : [];

    const url = new URL(location.href);
    const genderFromURL = url.searchParams.get("gender") || "";

    const initial = genderFromURL ? data.filter(p => p.gender === genderFromURL) : data;
    render(initial);

    if (controlsEl) {
      controlsEl.innerHTML = `
        <form id="filters" class="filters">
          <label>
            Gender:
            <select name="gender">
              <option value="">All</option>
              <option value="Male"${genderFromURL==="Male"?" selected":""}>Male</option>
              <option value="Female"${genderFromURL==="Female"?" selected":""}>Female</option>
            </select>
          </label>
          <button type="submit">Use filter</button>
        </form>
      `;

      const form = controlsEl.querySelector("#filters");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const g = new FormData(form).get("gender") || "";
        const filtered = g ? data.filter(p => p.gender === g) : data;
        render(filtered);

        const next = new URL(location.href);
        if (g) next.searchParams.set("gender", g);
        else next.searchParams.delete("gender");
        history.replaceState({}, "", next);
      });
    }
  } catch (e) {
    console.error(e);
    setStatus("Could not retrieve products. Please try again later.");
  } finally {
    setStatus("");
  }
})();
