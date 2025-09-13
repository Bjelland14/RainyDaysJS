document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.boxShadow = "none";
    });
  });

  const footerList = document.querySelector("footer nav ul");
  if (footerList) {
    const year = new Date().getFullYear();
    const li = document.createElement("li");
    li.textContent = `© RainyDays ${year}`;
    footerList.appendChild(li);
  }
});
