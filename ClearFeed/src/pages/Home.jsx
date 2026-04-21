import { useEffect, useState, useRef } from "react";
import NewsCard from "../components/NewsCard";
import { fetchNews } from "../services/api";
import { classifyArticle } from "../utils/sourceLens";
import SkeletonCard from "../components/SkeletonCard";

export default function Home({ category }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fetchedAt, setFetchedAt] = useState(null);

  const cardRefs = useRef([]);
  const containerRef = useRef(null);

  // setLoading(true) fires synchronously before the fetch starts —
  // putting it inside the async function caused a timing gap in React 19
  // StrictMode where the component could briefly render with stale state.
  // The active flag discards responses from the unmounted (first) render.
 useEffect(() => {
  let active = true;

  setLoading(true);
  setError(false);

  fetchNews(category)
    .then((data) => {
      if (!active) return;

      // 🔥 DO NOT overwrite with empty
      if (!data || data.length === 0) {
        console.log("⚠️ Ignoring empty response");
        return;
      }

      const enriched = data.map((article) => ({
        ...article,
        type: classifyArticle(article),
      }));

      setArticles(enriched);
      setFetchedAt(new Date());
    })
    .catch((err) => {
      if (!active) return;
      console.error("loadNews failed:", err);
      setError(true);
    })
    .finally(() => {
      if (!active) return;
      setLoading(false);
    });

  return () => { active = false; };
}, [category]);

  // Keyboard navigation — scrolls the container by exact clientHeight
  // rather than using scrollIntoView, which was fighting with CSS snap scroll
  // and landing on wrong positions when cards had padding.
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex(prev => {
          const next = Math.min(prev + 1, articles.length - 1);
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: next * containerRef.current.clientHeight,
              behavior: "smooth"
            });
          }
          return next;
        });
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex(prev => {
          const next = Math.max(prev - 1, 0);
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: next * containerRef.current.clientHeight,
              behavior: "smooth"
            });
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [articles]);

  // Syncs the counter with actual scroll position —
  // keyboard nav updates currentIndex directly, but mouse/trackpad
  // scroll doesn't, so we listen to the scroll event as well.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight);
      setCurrentIndex(index);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll while the snap feed is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400">
        Failed to load news. Try again later.
      </div>
    );
  }

  return (
    <div className="relative">

      <div className="fixed top-20 right-6 z-50 flex flex-col items-end gap-1">
        <span className="text-xs text-gray-500">
          {articles.length > 0 ? `${currentIndex + 1} / ${articles.length}` : ""}
        </span>
        {fetchedAt && (
          <span className="text-[10px] text-gray-600">
            Updated {fetchedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                      text-[11px] text-gray-600 bg-[#121821]/80 border border-[#1E293B]
                      px-4 py-2 rounded-full backdrop-blur-md pointer-events-none">
        ↑ ↓ arrow keys to navigate
      </div>

      <div ref={containerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory">
        {articles.map((article, index) => (
          <div
            key={index}
            ref={el => cardRefs.current[index] = el}
            className="h-screen overflow-hidden flex items-center justify-center snap-start pb-24"
          >
            <div className="w-full max-w-6xl px-4 overflow-hidden">
              <NewsCard article={article} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}