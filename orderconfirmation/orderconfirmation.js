// ---------- Konfig / helpers ----------
const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

function $(sel) { return document.querySelector(sel); }

function setStatus(msg, variant = "info") {
  const el = $("#status");
  if (!el) return;
  el.hidden = !msg;
  el.textContent = msg || "";
  el.dataset.variant = msg ? variant : "";
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

function clearCart() {
  localStorage.removeItem("cart");
}

// ---------- Element-referanser ----------
const orderIdEl   = $("#order-id");
const orderBox    = $("#order-summary");
const rowsEl      = $("#summary-rows");
const totalEl     = $("#summary-total");

// ---------- Render-funksjoner ----------
function renderOrderId() {
  const orderId = sessionStorage.getItem("orderId");
  if (orderId && orderIdEl) {
    orderIdEl.textContent = `Order ID: ${orderId}`;
  } else if (orderIdEl) {
    orderIdEl.textContent = "";
  }
}

function renderSummary(cart) {
  if (!rowsEl || !totalEl || !orderBox) return;

  if (!cart.length) {
    rowsEl.innerHTML = `<tr><td colspan="5">Your cart was empty.</td></tr>`;
    totalEl.textContent = money.format(0);
    orderBox.hidden = false;
    return;
  }

  let total = 0;
  rowsEl.innerHTML = cart.map(item => {
    const line = item.price * item.qty;
    total += line;

    const img = item.imageUrl || "https://via.placeholder.com/80x60";
    const title = item.title || "Product";

    return `
      <tr>
        <td>
          <span style="display:inline-flex; align-items:center; gap:8px;">
            <img 
              src="${img}" 
              alt="${title}" 
              style="width:60px; height:60px; object-fit:cover; border-radius:6px;"
            />
            ${title}
          </span>
        </td>
        <td>${item.size || "-"}</td>
        <td>${item.qty}</td>
        <td>${money.format(item.price)}</td>
        <td>${money.format(line)}</td>
      </tr>`;
  }).join("");

  totalEl.textContent = money.format(total);
  orderBox.hidden = false;
}

// ---------- Init ----------
(function init() {
  try {
    setStatus("Preparing your order…", "loading");

    // 1) Vis OrderID om vi har det
    renderOrderId();

    // 2) Hent cart og vis oppsummering
    const cart = getCart();
    renderSummary(cart);

    // 3) Tøm handlekurven etter at oppsummeringen er renderet
    clearCart();

    setStatus(""); // skjul status
  } catch (e) {
    console.error(e);
    setStatus("Could not show your order confirmation. Please try refreshing the page.", "error");
  }
})();
