# Clearfeed

A news aggregator with a perspective-aware feed, built with React, Express, and Firebase.

## What it does

Clearfeed pulls live news headlines and lets users browse them in a full-screen snap-scroll feed — similar to how short-form video apps present content, but for news articles.

Each article is automatically classified using a keyword-based utility (Source Lens) that tags it as breaking news, a report, opinion, analysis, or controversial content. This gives readers immediate context about what kind of content they're reading before they click through.

On the article page, the Compare Perspectives section fetches related articles on the same topic so users can see how different sources are covering the same story.

## Features

- Email auth via Firebase Authentication
- Per-user category preference saved and restored across sessions (Firestore)
- Article classification (Source Lens) — rule-based, runs entirely on the frontend
- Save/unsave articles, stored per-user in Firestore
- Compare Perspectives — related articles fetched via keyword extraction
- Search across all news via the /api/search endpoint
- Keyboard navigation (arrow keys) through the feed
- Category filtering: general, sports, technology, business

## Stack

- **Frontend:** React 19, React Router, Tailwind CSS, Vite
- **Backend:** Node.js, Express (proxy server to keep API key off the client)
- **Auth + DB:** Firebase Authentication, Firestore
- **News data:** GNews API

## Project structure
src/
pages/         Home, ArticlePage, Login, Saved, Search
components/    NavBar, NewsCard, SkeletonCard, SourceLensBadge
services/      api.js (all fetch calls)
utils/         sourceLens.js (classification + keyword extraction)
firebase.js
App.jsx
server.js        Express proxy

## Running locally

```bash
# Backend
node server.js

# Frontend
npm run dev
```

Requires a `.env` file with `API_KEY` (GNews) and `PORT`.

## Known limitations

- Source Lens classification uses keyword matching, not NLP — false positives exist
- Search cache in localStorage has no expiry
- Firebase config is currently in source — would move to environment variables for production