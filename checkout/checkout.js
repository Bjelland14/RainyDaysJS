const statusEl = document.querySelector("#status");
const listEl = document.querySelector("#cart-list");
const subtotalEl = document.querySelector("#sum-subtotal");
const totalEl = document.querySelector("#sum-total");
const shippingEl = document.querySelector("#sum-shipping");
const taxEl = document.querySelector("#sum-tax");
const completeBtn = document.querySelector("#complete");

const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

function setStatus(msg, variant = "info") {
  statusEl.hidden = !msg;
  statusEl.textContent = msg || "";
  statusEl.dataset.variant = msg ? variant : "";
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function line(item) {
  const lineTotal = item.price * item.qty;
  return `
    <div class="cart-item" data-id="${item.id}" data-size="${item.size || ""}">
      <img src="${item.imageUrl || "https://via.placeholder.com/200x150"}" alt="${item.title}" />
      <div>
        <p class="item-title">${item.title}</p>
        <p class="item-meta">Size: ${item.size || "-"}</p>
        <div class="item-actions">
          <label>Qty
            <input class="qty" type="number" min="1" value="${item.qty}" />
          </label>
          <button class="remove" type="button">Remove</button>
        </div>
      </div>
      <div class="price">${money.format(lineTotal)}</div>
    </div>
  `;
}

function render() {
  const cart = getCart();
  if (!cart.length) {
    listEl.innerHTML = `<p>Your cart is empty.</p>`;
    subtotalEl.textContent = money.format(0);
    totalEl.textContent = money.format(0);
    return;
  }
  listEl.innerHTML = cart.map(line).join("");

  calcTotals();
  bindRowEvents();
}

function calcTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = 0; 
  const tax = 0; 
  subtotalEl.textContent = money.format(subtotal);
  shippingEl.textContent = money.format(shipping);
  taxEl.textContent = money.format(tax);
  totalEl.textContent = money.format(subtotal + shipping + tax);
}

function bindRowEvents() {
  listEl.querySelectorAll(".cart-item").forEach(row => {
    const id = row.dataset.id;
    const size = row.dataset.size || null;
    const qtyInput = row.querySelector(".qty");
    const removeBtn = row.querySelector(".remove");

    qtyInput.addEventListener("change", () => {
      const val = Math.max(1, Number(qtyInput.value) || 1);
      qtyInput.value = val;
      const cart = getCart();
      const item = cart.find(x => x.id === id && (x.size || null) === size);
      if (item) {
        item.qty = val;
        saveCart(cart);
        render();
      }
    });

    removeBtn.addEventListener("click", () => {
      const cart = getCart().filter(x => !(x.id === id && (x.size || null) === size));
      saveCart(cart);
      render();
    });
  });
}

function validateForms() {
  const shipping = document.querySelector("#shipping");
  const payment = document.querySelector("#payment");
  if (!shipping.checkValidity()) {
    setStatus("Please fill out all required shipping fields.", "error");
    shipping.reportValidity();
    return false;
  }
  if (!payment.checkValidity()) {
    setStatus("Please fill out all required payment fields.", "error");
    payment.reportValidity();
    return false;
  }
  setStatus("");
  return true;
}

function completeOrder() {
  if (!validateForms()) return;
  location.href = "../checkoutsuccsess/checkoutsuccess.html";
}

(function init() {
  try {
    setStatus("Loading cart…", "loading");
    render();
    setStatus("");
  } catch (e) {
    console.error(e);
    setStatus("Could not load your cart.", "error");
  }

  completeBtn.addEventListener("click", completeOrder);
})();
