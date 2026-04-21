// sourceLens.js
// Classifies articles by tone using keyword matching against the title,
// description, and content fields. Rule-based by design — fast, predictable,
// and good enough for this use case without needing an NLP model.
//
// Known limitation: priority order matters a lot here. "Controversial" is checked
// first because conflict-heavy articles often also contain opinion/analysis language,
// and we want the stronger classification to win.

export function classifyArticle(article) {
  const text = (
    (article.title || "") + " " +
    (article.description || "") + " " +
    (article.content || "")
  ).toLowerCase();

  const controversialWords = [
    "protest", "clash", "conflict", "controversy", "violence",
    "attack", "war", "tension", "accuse", "criticism",
    "outrage", "backlash", "arrest", "strike"
  ];

  const opinionWords = [
    "opinion", "should", "must", "debate", "argues",
    "view", "believe", "claim", "suggests", "criticizes"
  ];

  const analysisWords = [
    "analysis", "explained", "insight", "why", "how",
    "breakdown", "what it means", "key takeaways",
    "deep dive", "understanding"
  ];

  const breakingWords = [
    "breaking", "just in", "urgent", "live", "update",
    "developing", "latest", "alert"
  ];

  // Report is both a category and the default fallback — most straight news
  // articles use attribution language like "said" or "according to"
  const reportWords = [
    "report", "reports", "reported", "according",
    "announced", "said", "says", "statement",
    "officials", "sources", "confirmed",
    "data", "survey", "study", "findings",
    "reveals", "shows"
  ];

  if (controversialWords.some(word => text.includes(word))) return "controversial";
  if (opinionWords.some(word => text.includes(word))) return "opinion";
  if (analysisWords.some(word => text.includes(word))) return "analysis";
  if (breakingWords.some(word => text.includes(word))) return "breaking";
  if (reportWords.some(word => text.includes(word))) return "report";

  return "report";
}


// Pulls meaningful keywords from a headline to use as a search query
// for the Compare Perspectives feature.
//
// Originally filtered words shorter than 5 characters which was too aggressive —
// short words like "war", "ban", "AI", "UK" carry most of the meaning in news headlines.
// Lowered the threshold to 3 characters which gave much better search results.
export function extractKeywords(title) {
  if (!title) return "news";

  const stopwords = [
    "the", "and", "for", "with", "this", "that",
    "from", "will", "have", "after", "over", "into",
    "about", "what", "when", "where", "who", "why", "how",
    "its", "are", "was", "has", "had", "been", "but", "not"
  ];

  const words = title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(" ")
    .filter(word => word.length > 2 && !stopwords.includes(word));

  return words.slice(0, 4).join(" ") || "news";
}