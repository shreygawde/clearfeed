import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

// Proxy endpoint for top headlines.
// The backend handles the GNews API call so the key never touches the client.
app.get("/api/news", async (req, res) => {
  try {
    const category = req.query.category;

    // GNews treats "general" differently — omitting the category param
    // returns a broader top-headlines feed than passing category=general explicitly.
    // Took a while to figure out why general was returning fewer articles.
    let url;
    if (!category || category === "general") {
      url = `https://gnews.io/api/v4/top-headlines?lang=en&max=10&apikey=${API_KEY}`;
    } else {
      url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=10&apikey=${API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);

  } catch (err) {
    console.error("News fetch failed:", err);
    res.status(500).json({ articles: [] });
  }
});

// Search endpoint — used by both the search page and the Compare Perspectives feature.
// Keeping search server-side means the API key stays protected even for user queries.
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) return res.json({ articles: [] });

    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${API_KEY}`
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Search fetch failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);