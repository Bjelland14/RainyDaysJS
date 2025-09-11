const API = "https://v2.api.noroff.dev/rainy-days";
const listEl = document.querySelector("#product-list");
const controlsEl = document.querySelector("#controls");
const statusEl = document.querySelector("#status");

const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

function setStatus(msg) {
  if (!statusEl) return;
  statusEl.hidden = !msg;
  statusEl.textContent = msg || "";
}

function productHref(p) {
  if (p.gender === "Male") return `menscollection/?id=${encodeURIComponent(p.id)}`;
  if (p.gender === "Female") return `womencollection/?id=${encodeURIComponent(p.id)}`;
  return `product/?id=${encodeURIComponent(p.id)}`;
}

function card(p) {
  const onSale = p.onSale && p.discountedPrice < p.price;
  const price = onSale
    ? `<s>${money.format(p.price)}</s> <strong>${money.format(p.discountedPrice)}</strong>`
    : `<strong>${money.format(p.price)}</strong>`;

  return `
    <article class="card">
      <a href="${productHref(p)}">
        <img src="${p.image.url}" alt="${p.image.alt}" />
        <h3>${p.title}</h3>
      </a>
      <p class="price">${price}</p>
      <a class="button" href="${productHref(p)}">Show details</a>
    </article>
  `;
}

function render(list) {
  listEl.innerHTML = list.length ? list.map(card).join("") : "<p>No products found.</p>";
}

(async function init() {
  try {
    setStatus("Loading…");
    const res = await fetch(API);
    const { data } = await res.json();
    render(data);

    controlsEl.innerHTML = `
      <form id="filters">
        <select name="gender">
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <button>Filter</button>
      </form>
    `;
    const form = document.querySelector("#filters");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const g = new FormData(form).get("gender");
      render(g ? data.filter((p) => p.gender === g) : data);
    });
  } catch (e) {
    setStatus("Error loading products.");
  } finally {
    setStatus("");
  }
})();
