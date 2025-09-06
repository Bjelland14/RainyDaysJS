const API = "https://v2.api.noroff.dev/rainy-days";
const statusEl = document.querySelector("#status");
const detailEl = document.querySelector("#product-detail");
const relatedEl = document.querySelector("#related-list");
const crumbGenderEl = document.querySelector("#crumb-gender");
const crumbTitleEl = document.querySelector("#crumb-title");
const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

function setStatus(msg, type = "info") {
  if (!statusEl) return;
  statusEl.hidden = !msg;
  statusEl.textContent = msg || "";
  statusEl.dataset.variant = msg ? type : "";
}

function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const found = cart.find(x => x.id === item.id && x.size === item.size);
  if (found) found.qty += item.qty;
  else cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
}

function priceHtml(p) {
  const onSale = p.onSale && p.discountedPrice < p.price;
  return onSale
    ? `<s>${money.format(p.price)}</s> <strong>${money.format(p.discountedPrice)}</strong>`
    : `<strong>${money.format(p.price)}</strong>`;
}

function renderProduct(p) {
  if (crumbGenderEl) {
    const gender = p.gender === "Male" ? "Men's" : p.gender === "Female" ? "Women's" : "All";
    const genderHref =
      p.gender === "Male" ? "../mencollection/mencollection.html" :
      p.gender === "Female" ? "../womencollection/womencollection.html" :
      "../index.html";
    crumbGenderEl.textContent = gender;
    crumbGenderEl.href = genderHref;
  }
  if (crumbTitleEl) crumbTitleEl.textContent = p.title;

  const onSale = p.onSale && p.discountedPrice < p.price;
  const tags = (p.tags || []).map(t => `<span class="tag">${t}</span>`).join("");

  detailEl.innerHTML = `
    <div class="product-media">
      <img class="product-image" src="${p.image?.url}" alt="${p.image?.alt || p.title}" />
      <div class="badges">
        ${onSale ? `<span class="badge sale">SALE</span>` : ""}
        ${p.favorite ? `<span class="badge">★ Favorite</span>` : ""}
      </div>
    </div>

    <div class="product-info">
      <h1>${p.title}</h1>
      <p>${p.description}</p>
      <p class="product-meta"><strong>Gender:</strong> ${p.gender} • <strong>Color:</strong> ${p.baseColor}</p>
      <div class="tags">${tags}</div>

      <p class="price">${priceHtml(p)}</p>

      <form id="buy" class="buy" aria-label="Add to cart">
        <label>
          Size
          <select name="size" required>
            ${p.sizes.map(s => `<option value="${s}">${s}</option>`).join("")}
          </select>
        </label>
        <label>
          Qty
          <input name="qty" type="number" min="1" value="1" required />
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
    const unitPrice = onSale ? p.discountedPrice : p.price;

    addToCart({
      id: p.id,
      title: p.title,
      imageUrl: p.image?.url,
      size,
      qty,
      price: unitPrice
    });

    setStatus(`${p.title} (${size}) Added to cart ✅`, "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function cardSmall(p) {
  return `
    <article class="card">
      <a class="card-link" href="../product/product.html?id=${encodeURIComponent(p.id)}">
        <img src="${p.image?.url}" alt="${p.image?.alt || p.title}" loading="lazy" />
        <h3>${p.title}</h3>
      </a>
      <p class="price">${priceHtml(p)}</p>
    </article>
  `;
}

async function loadRelated(currentId, gender) {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("related fail");
    const { data = [] } = await res.json();
    const filtered = data
      .filter(p => p.id !== currentId && (gender ? p.gender === gender : true))
      .slice(0, 4);
    if (relatedEl) relatedEl.innerHTML = filtered.length ? filtered.map(cardSmall).join("") : "<p>No related products.</p>";
  } catch {
    if (relatedEl) relatedEl.innerHTML = "<p>Could not load related products.</p>";
  }
}

(async function init() {
  try {
    setStatus("Loading product …", "loading");
    const url = new URL(location.href);
    const id = url.searchParams.get("id");
    if (!id) throw new Error("Missing ID in URL");

    const res = await fetch(`${API}/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data } = await res.json();

    renderProduct(data);
    await loadRelated(data.id, data.gender);
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus("Could not retrieve the product. Please try again later", "error");
  }
})();
