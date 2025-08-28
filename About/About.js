console.log("Welcome to the About page of RainyDays!");

const cards = document.querySelectorAll(".card");

cards.forEach(card => {
  card.addEventListener("mouseenter", () => {
    card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
  });
  card.addEventListener("mouseleave", () => {
    card.style.boxShadow = "none";
  });
});

const footer = document.querySelector("footer nav ul");
if (footer) {
  const year = new Date().getFullYear();
  const li = document.createElement("li");
  li.textContent = `© RainyDays ${year}`;
  footer.appendChild(li);
}
