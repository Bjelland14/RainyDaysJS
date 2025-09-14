const SUCCESS_PATH = "../orderconfirmation/orderconfirmation.html";

const statusEl    = document.querySelector("#status");
const listEl      = document.querySelector("#cart-list");
const subtotalEl  = document.querySelector("#sum-subtotal");
const totalEl     = document.querySelector("#sum-total");
const shippingEl  = document.querySelector("#sum-shipping");
const taxEl       = document.querySelector("#sum-tax");
const completeBtn = document.querySelector("#complete");

const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

function setStatus(msg, variant = "info") {
  if (!statusEl) return;
  statusEl.hidden = !msg;
  statusEl.textContent = msg || "";
  statusEl.dataset.variant = msg ? variant : "";
  statusEl.setAttribute("role", variant === "error" ? "alert" : "status");
}
function showLoading(msg = "Processing order…") { setStatus(msg, "loading"); }
function hideStatus() { setStatus(""); }

function getCart() {
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); }
  catch { return []; }
}
function saveCart(cart) { localStorage.setItem("cart", JSON.stringify(cart)); }

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
    </div>`;
}

function render() {
  const cart = getCart();
  if (!cart.length) {
    listEl.innerHTML = `<p>Your cart is empty.</p>`;
    subtotalEl.textContent = money.format(0);
    shippingEl.textContent = money.format(0);
    taxEl.textContent = money.format(0);
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
    const id   = row.dataset.id;
    const size = row.dataset.size || null;
    const qtyInput  = row.querySelector(".qty");
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

function digitsOnly(str) { return String(str || "").replace(/\D+/g, ""); }

function invalid(el, message) {
  if (!el) return false;
  el.setCustomValidity(message || "");
  el.reportValidity();
  el.focus();
  return false;
}

function validateForms() {
  const shipping = document.querySelector("#shipping");
  const payment  = document.querySelector("#payment");

  if (!shipping?.checkValidity()) {
    setStatus("Please fill out all required shipping fields.", "error");
    shipping?.reportValidity();
    return false;
  }
  if (!payment?.checkValidity()) {
    setStatus("Please fill out all required payment fields.", "error");
    payment?.reportValidity();
    return false;
  }

  const cardName   = payment.querySelector('input[name="cardName"]');
  const cardNumber = payment.querySelector('input[name="cardNumber"]');
  const expiry     = payment.querySelector('input[name="expiry"]');
  const cvv        = payment.querySelector('input[name="cvv"]');
  const email      = shipping.querySelector('input[name="email"]');
  const phone      = shipping.querySelector('input[name="phone"]');

  const ccDigits = digitsOnly(cardNumber?.value);
  cardNumber.setCustomValidity("");
  if (ccDigits.length < 12 || ccDigits.length > 19) {
    return invalid(cardNumber, "Card number must be 12–19 digits.");
  }

  const cvvDigits = digitsOnly(cvv?.value);
  cvv.setCustomValidity("");
  if (!/^\d{3,4}$/.test(cvvDigits)) {
    return invalid(cvv, "CVV must be 3 or 4 digits.");
  }

  expiry.setCustomValidity("");

  const raw = digitsOnly(expiry.value);
  let mmStr = "", yyStr = "";

  if (raw.length === 3) {            
    mmStr = "0" + raw[0];
    yyStr = raw.slice(1);
  } else if (raw.length >= 4) {      
    mmStr = raw.slice(0, 2);
    yyStr = raw.slice(2, 4);
  } else {
    return invalid(expiry, "Expiry must be in MM/YY format.");
  }

  const mm = Number(mmStr);
  const yy = Number(yyStr);

  if (!Number.isInteger(mm) || !Number.isInteger(yy)) {
    return invalid(expiry, "Expiry must be in MM/YY format.");
  }
  if (mm < 1 || mm > 12) {
    return invalid(expiry, "Expiry month must be 01–12.");
  }

  const fullYear = 2000 + yy;

  const now = new Date();
  const expYM = fullYear * 12 + (mm - 1);
  const nowYM = now.getFullYear() * 12 + now.getMonth();

  if (expYM < nowYM) {
    return invalid(expiry, "Card has expired.");
  }

  expiry.value = `${mmStr.padStart(2, "0")}/${yyStr}`;

  email.setCustomValidity("");
  if (!email.checkValidity()) {
    return invalid(email, "Please enter a valid email address.");
  }

  phone.setCustomValidity("");
  if (digitsOnly(phone.value).length < 8) {
    return invalid(phone, "Please enter a valid phone number (at least 8 digits).");
  }

  if (getCart().length === 0) {
    setStatus("Your cart is empty.", "error");
    return false;
  }

  hideStatus();
  return true;
}

async function completeOrder(ev) {
  if (ev && ev.preventDefault) ev.preventDefault();

  if (!validateForms()) return;

  const btn = ev?.currentTarget;
  btn?.setAttribute("disabled", "true");

  showLoading("Processing order…");

  try {
    await new Promise(r => setTimeout(r, 600));

    const orderId = "RD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    sessionStorage.setItem("orderId", orderId);

    window.location.href = SUCCESS_PATH;
  } catch {
    setStatus("Something went wrong while processing your order.", "error");
  } finally {
    btn?.removeAttribute("disabled");
  }
}

(function init() {
  try {
    setStatus("Loading cart…", "loading");
    render();
    hideStatus();
  } catch {
    setStatus("Could not load your cart.", "error");
  }

  completeBtn?.addEventListener("click", completeOrder);

  document.querySelector("#shipping")?.addEventListener("submit", e => e.preventDefault());
  document.querySelector("#payment")?.addEventListener("submit", e => e.preventDefault());

  const payment  = document.querySelector("#payment");
  const cardNumber = payment?.querySelector('input[name="cardNumber"]');
  const cvv        = payment?.querySelector('input[name="cvv"]');
  const expiry     = payment?.querySelector('input[name="expiry"]');

  cardNumber?.addEventListener("input", () => {
    const digits = digitsOnly(cardNumber.value).slice(0, 19);
    cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  });

  cvv?.addEventListener("input", () => {
    cvv.value = digitsOnly(cvv.value).slice(0, 4);
  });

  expiry?.addEventListener("input", () => {
    const raw = digitsOnly(expiry.value).slice(0, 4);
    let mm = "", yy = "";

    if (raw.length <= 2) {           
      mm = raw;
      expiry.value = mm;
      return;
    }
    if (raw.length === 3) {          
      mm = "0" + raw[0];
      yy = raw.slice(1);
    } else {                         
      mm = raw.slice(0, 2);
      yy = raw.slice(2, 4);
    }
    expiry.value = `${mm}/${yy}`;
  });
})();
