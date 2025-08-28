# 🌧️ RainyDays – Online Store

This is my **JavaScript 1 Course Assignment** at Noroff.  
The project is a simple e-commerce site built with HTML, CSS, and JavaScript that fetches products from the Noroff API.

## 📌 Pages

- `index.html` → Homepage displaying product list and filter (from API).
- `product/product.html` → Single product page, showing details based on ID in URL.
- `checkout/index.html` → Checkout page showing cart items (stored in localStorage).
- `checkoutsuccsess/checkoutsuccsess.html` → Confirmation page after checkout.
- `mencollection/` and `womencollection/` → Extra category pages.
- `about/` and `faq/` → About us and customer service.

## 🚀 Technologies

- **HTML5** for structure  
- **CSS3** for styling (both shared and page-specific stylesheets)  
- **JavaScript (ES6)** for:
  - Fetching products from API
  - Filtering products (gender)
  - Displaying single product details
  - Adding and removing items from cart
  - Saving cart data in `localStorage`

## 🔗 API

The project uses the [Noroff Rainy Days API](https://v2.api.noroff.dev/rainy-days) to fetch product data.

Example request:
```js
fetch("https://v2.api.noroff.dev/rainy-days")
