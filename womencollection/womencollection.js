const API = "https://v2.api.noroff.dev/rainy-days";
const listEl = document.querySelector("#product-list");
const statusEl = document.querySelector("#status");
const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

function setStatus(msg, variant = "info") {
  statusEl.hidden = !msg;
  statusEl.textContent = msg || "";
  statusEl.dataset.variant = msg ? variant : "";
}

function card(p) {
  const onSale = p.onSale && p.discountedPrice < p.price;
  const price = onSale
    ? `<s>${money.format(p.price)}</s> <strong>${money.format(p.discountedPrice)}</strong>`
    : `<strong>${money.format(p.price)}</strong>`;

  return `
    <article class="product">
      <a href="../product/product.html?id=${encodeURIComponent(p.id)}">
        <img src="${p.image?.url}" alt="${p.image?.alt || p.title}" loading="lazy" />
      </a>
      <div class="product-info">
        <h2>${p.title}</h2>
        <p>${p.description}</p>
        <p class="price">${price}</p>
        <a class="button" href="../product/product.html?id=${encodeURIComponent(p.id)}">View details</a>
      </div>
    </article>
  `;
}

function render(list) {
  listEl.innerHTML = list.length ? list.map(card).join("") : "<p>No products found.</p>";
}

(async function init() {
  try {
    setStatus("Loading products…", "loading");
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data = [] } = await res.json();
    render(data.filter(p => p.gender === "Female"));
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus("Could not load products. Try again later.", "error");
  }
})();
