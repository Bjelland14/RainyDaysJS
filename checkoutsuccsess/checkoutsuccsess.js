const statusEl = document.querySelector("#status");
const summary = document.querySelector("#order-summary");
const rowsEl = document.querySelector("#summary-rows");
const totalEl = document.querySelector("#summary-total");
const orderIdEl = document.querySelector("#order-id");

const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

function setStatus(msg, variant = "info") {
  statusEl.hidden = !msg;
  statusEl.textContent = msg || "";
  statusEl.dataset.variant = msg ? variant : "";
}

function renderSummary(items) {
  if (!items?.length) {
    setStatus("We couldn’t find items in your cart, but your order is confirmed.", "info");
    summary.hidden = true;
    return;
  }
  setStatus("");

  let total = 0;
  rowsEl.innerHTML = items.map(item => {
    const line = item.price * item.qty;
    total += line;
    return `
      <tr>
        <td>${item.title}</td>
        <td>${item.size || "-"}</td>
        <td>${item.qty}</td>
        <td>${money.format(item.price)}</td>
        <td>${money.format(line)}</td>
      </tr>`;
  }).join("");

  totalEl.textContent = money.format(total);
  summary.hidden = false;
}

(function init() {
  const id = "RD-" + String(Date.now()).slice(-8);
  orderIdEl.textContent = `Order ID: ${id}`;

  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    renderSummary(cart);

    localStorage.removeItem("cart");
  } catch {
    setStatus("Something went wrong reading your order.", "error");
  }
})();
