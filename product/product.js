const API = "https://v2.api.noroff.dev/rainy-days";
const statusEl = document.querySelector("#status");
const detailEl = document.querySelector("#product-detail");
const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

function setStatus(msg, type = "info") {
  statusEl.hidden = !msg;
  statusEl.textContent = msg || "";
  statusEl.dataset.variant = msg ? type : "";
}

function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const match = cart.find(x => x.id === item.id && x.size === item.size);
  if (match) {
    match.qty += item.qty;
  } else {
    cart.push(item);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderProduct(p) {
  const onSale = p.onSale && p.discountedPrice < p.price;
  const priceHtml = onSale
    ? `<s>${money.format(p.price)}</s> <strong>${money.format(p.discountedPrice)}</strong>`
    : `<strong>${money.format(p.price)}</strong>`;

  detailEl.innerHTML = `
    <div>
      <img class="product-image" src="${p.image?.url}" alt="${p.image?.alt || p.title}" />
    </div>
    <div class="product-info">
      <h1>${p.title}</h1>
      <p>${p.description}</p>
      <p><strong>Color:</strong> ${p.baseColor}</p>
      <p><strong>Gender:</strong> ${p.gender}</p>
      <p class="price">${priceHtml}</p>

      <form id="buy" class="buy">
        <label>
          Size
          <select name="size" required>
            ${p.sizes.map(size => `<option value="${size}">${size}</option>`).join("")}
          </select>
        </label>
        <label>
          Qty
          <input type="number" name="qty" min="1" value="1" required />
        </label>
        <button type="submit">Add to Cart</button>
      </form>
    </div>
  `;

  const form = detailEl.querySelector("#buy");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const size = fd.get("size");
    const qty = Math.max(1, Number(fd.get("qty")) || 1);
    const price = onSale ? p.discountedPrice : p.price;

    addToCart({
      id: p.id,
      title: p.title,
      price,
      size,
      qty,
      imageUrl: p.image?.url
    });

    alert(`${p.title} (${size}) ble lagt i handlekurven ✅`);
  });
}

(async function init() {
  try {
    setStatus("Laster produkt …");

    const url = new URL(location.href);
    const id = url.searchParams.get("id");
    if (!id) throw new Error("Mangler id i URL");

    const res = await fetch(`${API}/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data } = await res.json();

    renderProduct(data);
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus("Kunne ikke hente produktet", "error");
  }
})();
