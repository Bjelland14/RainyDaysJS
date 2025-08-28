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
    ? `<s>${money.format(p.price)}</s> <strong>${money.format(p.discountedPrice)}</strong> <span class="badge">SALE</span>`
    : `<strong>${money.format(p.price)}</strong>`;
  return `
    <article class="product">
      <a href="../product/index.html?id=${encodeURIComponent(p.id)}">
        <img src="${p.image?.url}" alt="${p.image?.alt || p.title}" loading="lazy" />
      </a>
      <div class="product-info">
        <h2>${p.title}</h2>
        <p>${p.description || ""}</p>
        <p class="price">${price}</p>
        <div>
          <button type="button" onclick="location.href='../product/index.html?id=${encodeURIComponent(p.id)}'">View Details</button>
          <button class="add" data-id="${p.id}" data-title="${p.title}" data-price="${onSale ? p.discountedPrice : p.price}">Add to Cart</button>
        </div>
      </div>
    </article>`;
}

function render(list) {
  listEl.innerHTML = list.length ? list.map(card).join("") : "<p>No products found.</p>";

  // Legg i handlekurv direkte fra kort
  listEl.querySelectorAll(".add").forEach(btn => {
    btn.addEventListener("click", () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const item = {
        id: btn.dataset.id,
        title: btn.dataset.title,
        price: parseFloat(btn.dataset.price),
        qty: 1,
        size: null
      };
      const hit = cart.find(x => x.id === item.id && x.size === item.size);
      if (hit) hit.qty += 1; else cart.push(item);
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${item.title} ble lagt i handlekurven 🛒`);
    });
  });
}

(async function init() {
  try {
    setStatus("Loading products …");
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data = [] } = await res.json();
    const males = data.filter(p => p.gender === "Male");
    render(males);
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus("Could not load products. Try again later.", "error");
  }
})();
