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
  if (msg) {

    if (!statusEl.hasAttribute("tabindex")) statusEl.setAttribute("tabindex", "-1");
    statusEl.focus({ preventScroll: true });
  }
}

function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const sizeKey = String(item.size || "").trim();
  const found = cart.find((x) => x.id === item.id && String(x.size) === sizeKey);
  if (found) found.qty += item.qty;
  else cart.push({ ...item, size: sizeKey });
  localStorage.setItem("cart", JSON.stringify(cart));
}

function priceHtml(p) {
  const onSale = p.onSale && typeof p.discountedPrice === "number" && p.discountedPrice < p.price;
  return onSale
    ? `<s>${money.format(p.price)}</s> <strong>${money.format(p.discountedPrice)}</strong>`
    : `<strong>${money.format(p.price)}</strong>`;
}

function safeImage(p) {
  const url = p?.image?.url || "https://static.cloud.noroff.dev/placeholder-square.jpg";
  const alt = p?.image?.alt || p?.title || "Product image";
  return { url, alt };
}

function renderProduct(p) {
  if (crumbGenderEl) {
    const genderLabel = p.gender === "Male" ? "Men’s" : p.gender === "Female" ? "Women’s" : "All";
    const genderHref =
      p.gender === "Male"
        ? "../menscollection/menscollection.html"
        : p.gender === "Female"
        ? "../womencollection/womencollection.html"
        : "../index/index.html";
    crumbGenderEl.textContent = genderLabel;
    crumbGenderEl.href = genderHref;
  }
  if (crumbTitleEl) crumbTitleEl.textContent = p.title;

  const onSale = p.onSale && p.discountedPrice < p.price;
  const tags = Array.isArray(p.tags) ? p.tags : [];
  const sizes = Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ["One Size"];
  const { url: imgUrl, alt: imgAlt } = safeImage(p);

  detailEl.innerHTML = `
    <div class="product-media">
      <img class="product-image" src="${imgUrl}" alt="${imgAlt}" />
      <div class="badges">
        ${onSale ? `<span class="badge sale">SALE</span>` : ""}
        ${p.favorite ? `<span class="badge">★ Favorite</span>` : ""}
      </div>
    </div>

    <div class="product-info">
      <h1>${p.title}</h1>
      <p>${p.description || ""}</p>
      <p class="product-meta"><strong>Gender:</strong> ${p.gender || "Unisex"} • <strong>Color:</strong> ${p.baseColor || "-"}</p>
      <div class="tags">${tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>

      <p class="price">${priceHtml(p)}</p>

      <form id="buy" class="buy" aria-label="Add to cart">
        <label>
          Size
          <select name="size" required>
            ${sizes.map((s) => `<option value="${s}">${s}</option>`).join("")}
          </select>
        </label>
        <label>
          Qty
          <input name="qty" type="number" inputmode="numeric" min="1" step="1" value="1" required />
        </label>
        <button type="submit">Add to Cart</button>
      </form>
    </div>
  `;

  const form = detailEl.querySelector("#buy");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const size = String(fd.get("size") || "").trim();
    const qty = Math.max(1, Math.floor(Number(fd.get("qty")) || 1));
    const unitPrice = onSale ? p.discountedPrice : p.price;

    addToCart({
      id: p.id,
      title: p.title,
      imageUrl: p.image?.url,
      size,
      qty,
      price: unitPrice,
    });

    setStatus(`${p.title} (${size}) added to cart ✅`, "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function cardSmall(p) {
  const { url, alt } = safeImage(p);
  return `
    <article class="card">
      <a class="card-link" href="../product/product.html?id=${encodeURIComponent(p.id)}">
        <img src="${url}" alt="${alt}" loading="lazy" />
        <h3>${p.title}</h3>
      </a>
      <p class="price">${priceHtml(p)}</p>
    </article>
  `;
}

async function loadRelated(currentId, gender) {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("related");
    const { data = [] } = await res.json();
    const filtered = data
      .filter((p) => p.id !== currentId && (gender ? p.gender === gender : true))
      .slice(0, 4);
    relatedEl.innerHTML = filtered.length
      ? filtered.map(cardSmall).join("")
      : "<p>No related products.</p>";
  } catch {
    relatedEl.innerHTML = "<p>Could not load related products.</p>";
  }
}

(async function init() {
  try {
    setStatus("Loading product …", "loading");

    const url = new URL(location.href);
    const id = url.searchParams.get("id");
    if (!id) throw new Error("MISSING_ID");

    const res = await fetch(`${API}/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const { data } = await res.json();

    renderProduct(data);
    await loadRelated(data.id, data.gender);
    setStatus("");
  } catch (err) {

    setStatus("Could not retrieve the product. Please try again later.", "error");
  }
})();
