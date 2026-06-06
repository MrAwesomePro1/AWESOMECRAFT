const searchInput = document.querySelector("#app-search");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const cards = [...document.querySelectorAll(".app-card")];
const emptyState = document.querySelector(".empty-state");

let activeFilter = "all";

function normalize(value) {
  return value.trim().toLowerCase();
}

function cardMatchesFilter(card) {
  if (activeFilter === "all") {
    return true;
  }

  if (activeFilter === "soon") {
    return card.dataset.tags.includes("soon");
  }

  return card.dataset.tags.includes(activeFilter);
}

function cardMatchesSearch(card, query) {
  if (!query) {
    return true;
  }

  const text = `${card.innerText} ${card.dataset.tags}`.toLowerCase();
  return text.includes(query);
}

function updateCards() {
  const query = normalize(searchInput.value);
  let visibleCount = 0;

  cards.forEach((card) => {
    const isVisible = cardMatchesFilter(card) && cardMatchesSearch(card, query);
    card.classList.toggle("is-hidden", !isVisible);
    if (isVisible) {
      visibleCount += 1;
    }
  });

  emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    updateCards();
  });
});

searchInput.addEventListener("input", updateCards);
updateCards();
