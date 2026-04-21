import { useLocation, useNavigate } from "react-router-dom";
import SourceLensBadge from "../components/SourceLensBadge";
import { useEffect, useState, useRef } from "react";
import { searchNews } from "../services/api";
import { extractKeywords, classifyArticle } from "../utils/sourceLens";

import { db, auth } from "../firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

// Separate component for perspective cards rather than reusing NewsCard —
// the comparison view needs tone labels and perspective numbering that
// don't belong in the general card used on Home and Saved.
function PerspectiveCard({ article, index }) {
  const navigate = useNavigate();

  const toneLabel = {
    breaking: "Live coverage",
    report: "Factual reporting",
    analysis: "In-depth analysis",
    opinion: "Opinion / Commentary",
    controversial: "Contested topic",
    general: "General news",
  };

  const toneColor = {
    breaking: "border-green-500/30",
    report: "border-blue-500/30",
    analysis: "border-yellow-500/30",
    opinion: "border-purple-500/30",
    controversial: "border-red-500/30",
    general: "border-gray-500/30",
  };

  // Reading time is a rough estimate — assumes ~200 words per minute
  const wordCount = [article.title, article.description, article.content]
    .filter(Boolean)
    .join(" ")
    .split(" ").length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div
      onClick={() => navigate("/article", { state: article })}
      className={`cursor-pointer rounded-2xl border bg-[#121821]/80 backdrop-blur-xl p-5 flex flex-col gap-3
                  hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5
                  ${toneColor[article.type] || "border-[#1E293B]"}`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-400">{article.source?.name}</span>
        <SourceLensBadge type={article.type} />
        <span className="text-xs text-gray-500">{readingTime} min read</span>
      </div>

      <div className="text-[10px] uppercase tracking-widest text-cyan-500/60 font-semibold">
        Perspective {index + 1}
      </div>

      <h3 className="text-sm font-semibold leading-snug text-white line-clamp-3">
        {article.title}
      </h3>

      <p className="text-xs text-gray-400 line-clamp-2">
        {article.description}
      </p>

      <div className="mt-auto pt-3 border-t border-[#1E293B] text-[11px] text-gray-500 italic">
        {toneLabel[article.type] || "General news"}
      </div>
    </div>
  );
}


export default function ArticlePage() {
  const { state: article } = useLocation();
  const navigate = useNavigate();

  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Prevents double-fetching related articles in React StrictMode
  const hasFetched = useRef(false);

  useEffect(() => {
    async function checkSaved() {
      const user = auth.currentUser;
      if (!user || !article) return;

      // btoa(url) gives a stable, Firestore-safe document ID for any article
      const safeId = btoa(article.url);
      const ref = doc(db, "users", user.uid, "saved", safeId);
      const snap = await getDoc(ref);
      setSaved(snap.exists());
    }
    checkSaved();
  }, [article]);

  const toggleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !article?.url) return;

      const safeId = btoa(article.url);
      const ref = doc(db, "users", user.uid, "saved", safeId);

      if (saved) {
        await deleteDoc(ref);
        setSaved(false);
      } else {
        // Spread the full article object so the Saved page can render
        // without needing to re-fetch from the API
        await setDoc(ref, { ...article, savedAt: Date.now() });
        setSaved(true);
      }
    } catch (err) {
      console.error("toggleSave failed:", err);
    }
  };

  useEffect(() => {
    if (!article || hasFetched.current) return;
    hasFetched.current = true;

    async function loadRelated() {
      try {
        const query = extractKeywords(article.title);
        const results = await searchNews(query);

        // Filter out the current article then classify the rest
        let filtered = results
          .filter(a => a.url !== article.url)
          .slice(0, 3)
          .map(a => ({ ...a, type: classifyArticle(a) }));

        // If filtering removed everything (e.g. only one result came back),
        // just show what we have without the URL filter
        if (filtered.length === 0) {
          filtered = results.slice(0, 3).map(a => ({ ...a, type: "report" }));
        }

        setRelated(filtered);
      } catch (err) {
        console.error("loadRelated failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRelated();
  }, [article]);

  if (!article) {
    return <div className="p-6 text-white">No article found</div>;
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-[#0B0F14] text-white p-6">

      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-[#22D3EE] hover:underline text-sm"
      >
        ← Back
      </button>

      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        <img
          src={article.image}
          alt=""
          className="w-full h-[300px] object-cover rounded-2xl"
        />

        <div className="flex justify-between items-start gap-4">
          <h1 className="text-3xl font-bold leading-tight">{article.title}</h1>
          <button
            onClick={toggleSave}
            className={`px-4 py-2 rounded-lg text-sm shrink-0 ${
              saved
                ? "bg-green-500/20 text-green-300"
                : "bg-cyan-500/20 text-cyan-300"
            }`}
          >
            {saved ? "Saved ✓" : "Save"}
          </button>
        </div>

        <div className="flex items-center gap-4 text-[#94A3B8]">
          <span>{article.source?.name}</span>
          <SourceLensBadge type={article.type} />
        </div>

        <p className="text-lg text-[#CBD5F5]">{article.description}</p>
        <p className="text-[#94A3B8]">{article.content}</p>

        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="text-[#22D3EE] text-sm"
        >
          Read full article →
        </a>

      </div>

      {/* Compare Perspectives — full width so it feels distinct from the article body */}
      <div className="mt-16 border-t border-[#1E293B] pt-12">
        <div className="max-w-5xl mx-auto px-4">

          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-cyan-400 rounded-full" />
            <h2 className="text-2xl font-bold text-white">Compare Perspectives</h2>
          </div>
          <p className="text-sm text-gray-500 mb-8 ml-4">
            How different sources are covering this story
          </p>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-2xl bg-[#121821] border border-[#1E293B] h-48" />
              ))}
            </div>
          ) : related.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">📭</p>
              <p>No other perspectives found for this story.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((item, index) => (
                <PerspectiveCard key={index} article={item} index={index} />
              ))}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}