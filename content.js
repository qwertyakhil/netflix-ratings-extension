const getOmdbKey = () =>
  new Promise((resolve) => {
    chrome.storage.sync.get(["omdbKey"], (result) => resolve(result.omdbKey));
  });

async function fetchRatings(title) {
  const apiKey = await getOmdbKey();
  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "False") return null;
    return data;
  } catch (e) {
    return null;
  }
}

function createBadge(text) {
  const el = document.createElement("div");
  el.className = "nr-badge";
  el.innerText = text;
  return el;
}

async function processCard(card) {
  if (card.dataset.ratingsAdded === "true") return;

  const titleEl = card.querySelector(".fallback-text, .title-card-container, img[alt]");
  if (!titleEl) return;

  const title = titleEl.innerText || titleEl.getAttribute("alt");
  if (!title) return;

  const ratings = await fetchRatings(title);
  if (!ratings) return;

  const container = document.createElement("div");
  container.className = "nr-rating-box";

  if (ratings.imdbRating && ratings.imdbRating !== "N/A") {
    container.appendChild(createBadge(`IMDb: ${ratings.imdbRating}`));
  }

  const rt = ratings.Ratings?.find((r) => r.Source === "Rotten Tomatoes");
  if (rt) {
    container.appendChild(createBadge(`RT: ${rt.Value}`));
  }

  card.appendChild(container);
  card.dataset.ratingsAdded = "true";
}

function observeNetflix() {
  const observer = new MutationObserver(() => {
    const cards = document.querySelectorAll('[data-list-context], .previewModal--player-container, .title-card-container');
    cards.forEach(processCard);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener("load", observeNetflix);
