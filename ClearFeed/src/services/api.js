// All outbound fetch calls go through here.
// The BASE_URL points to the local Express server which proxies GNews —
// this keeps the API key off the client entirely.
// TODO: move this to an env variable before deploying anywhere

const BASE_URL = "https://clearfeed-backend.onrender.com/api";

// Simple in-memory cache for search results, persisted to localStorage
// so repeat searches within the same session don't burn API quota.
// No expiry logic yet — stale results are acceptable for now since
// news search results don't change that dramatically within a session.
const searchCache = (() => {
  try {
    return JSON.parse(localStorage.getItem("searchCache")) || {};
  } catch {
    return {};
  }
})();

export async function fetchNews(category = "general") {
  try {
    const res = await fetch(`${BASE_URL}/news?category=${category}`);

    if (!res.ok) {
      console.error(`News API returned ${res.status} for category: ${category}`);
      return [];
    }

    const data = await res.json();
    return data.articles || [];

  } catch (err) {
    console.error("fetchNews failed:", err);
    return [];
  }
}

// Used by both the search page and ArticlePage's Compare Perspectives section.
// Results are cached by query string to avoid duplicate requests when a user
// navigates back to the same article.
export async function searchNews(query) {
  if (!query) return [];

  try {
    if (searchCache[query]) {
      return searchCache[query];
    }

    const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);

    if (!res.ok) return [];

    const data = await res.json();

    if (!data?.articles) return [];

    searchCache[query] = data.articles;
    localStorage.setItem("searchCache", JSON.stringify(searchCache));

    return data.articles;

  } catch (err) {
    console.error("searchNews failed:", err);
    return [];
  }
}