 RainyDays- JS assignment 1

RainyDays is a prototype e-commerce webshop.
The application simulates an online store for rain jackets, where users can browse products, view product details, add items to a cart, and complete a checkout process with an order confirmation screen.  



- Assignment Requirements  

 User Stories  
- As a user, I want to view a list of products on the homepage.  
- As a user, I want to filter products by category (men’s or women’s).  
- As a user, I want to view a single product page with more detail.  
- As a user, I want to add a product to my basket.  
- As a user, I want to remove a product from my basket.  
- As a user, I want to view a summary of my cart on the checkout page.  
- As a user, I want to view an order-confirmation screen after checking out.  

 Required Pages  
- Home Page: `/index/index.html` – product list with filters.  
- Product Page: `/product/product.html` – detailed product view.  
- Checkout Page: `/checkout/checkout.html` – cart summary and forms.  
- Confirmation Page: `/checkoutsuccsess/checkoutsuccsess.html` – order confirmation.  

 Optional Pages Implemented  
- Men’s Collection  
- Women’s Collection  
- FAQ  
- About

- Tech Stack  
- HTML – semantic and accessible structure  
- CSS3 – responsive design with flexbox & grid  
- LocalStorage – cart persistence across pages  
- Noroff API – products fetched dynamically from `https://v2.api.noroff.dev/rainy-days`  

- Features Implemented  
- Filter by gender: Men’s / Women’s collections.  
- Product details page with sizes, quantity selector, and add-to-cart.  
- Cart management: update quantity, remove items.  
- Checkout page: shipping form, payment form, order summary.  
- Confirmation page: thank you message, order summary, continue shopping.  
- Loading indicators  when fetching data.  
- Accessible navigation via header and footer across all pages.  
