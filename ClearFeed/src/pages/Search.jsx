import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchNews } from "../services/api";
import { classifyArticle } from "../utils/sourceLens";
import NewsCard from "../components/NewsCard";
import SkeletonCard from "../components/SkeletonCard";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) {
      navigate("/");
      return;
    }

    async function doSearch() {
      try {
        setLoading(true);
        setError(false);

        const data = await searchNews(query);

        const enriched = (data || []).map(a => ({
          ...a,
          type: classifyArticle(a),
        }));

        setResults(enriched);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    doSearch();
  }, [query]);

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-6 bg-cyan-400 rounded-full" />
        <h1 className="text-2xl font-bold text-white">
          Results for <span className="text-cyan-400">"{query}"</span>
        </h1>
        {!loading && (
          <span className="text-xs text-gray-500 bg-[#1E293B] px-2 py-1 rounded-full">
            {results.length} articles
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <SkeletonCard />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-20 text-red-400">
          Search failed. Try again.
        </div>
      )}

      {/* Empty */}
      {!loading && !error && results.length === 0 && (
        <div className="text-center py-20 flex flex-col items-center gap-3">
          <div className="text-5xl">🔍</div>
          <p className="text-gray-400">No results found for "{query}"</p>
          <button
            onClick={() => navigate("/")}
            className="text-cyan-400 text-sm hover:underline"
          >
            Back to home
          </button>
        </div>
      )}

      {/* Results grid */}
      {!loading && results.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((article, i) => (
            <NewsCard key={i} article={article} compact />
          ))}
        </div>
      )}

    </div>
  );
}