import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import NewsCard from "../components/NewsCard";

export default function Saved() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const snap = await getDocs(
          collection(db, "users", user.uid, "saved")
        );

        const data = snap.docs
          .map(doc => doc.data())
          .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0)); // 🔥 newest first

        setArticles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSaved();
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cyan-400 animate-pulse text-sm">Loading saved articles...</p>
      </div>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-5xl">🗂️</div>
        <h2 className="text-xl font-semibold text-white">Nothing saved yet</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          When you save an article, it'll appear here. Open any article and hit "Save".
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-6 bg-cyan-400 rounded-full" />
        <h1 className="text-2xl font-bold">Saved Articles</h1>
        <span className="text-xs text-gray-500 bg-[#1E293B] px-2 py-1 rounded-full">
          {articles.length}
        </span>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a, i) => (
          <div key={i} className="flex flex-col gap-1">
            <NewsCard article={a} compact />
            {/* 🔥 saved on label */}
            {a.savedAt && (
              <p className="text-[11px] text-gray-600 pl-1">
                Saved {new Date(a.savedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}