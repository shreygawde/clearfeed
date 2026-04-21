import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";

export default function Navbar({ setCategory, category }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["general", "sports", "technology", "business"];

  const handleCategory = async (cat) => {
    setCategory(cat);
    navigate("/");

    const user = auth.currentUser;
    if (!user) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { preferredCategory: cat },
        { merge: true }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#121821]/70 border-b border-[#1E293B] px-6 py-4 flex justify-between items-center gap-4">

      {/* Logo */}
      <h1
        onClick={() => navigate("/")}
        className="text-xl font-semibold tracking-wide cursor-pointer shrink-0"
      >
        <span className="text-[#22D3EE] drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
          Clear
        </span>
        feed
      </h1>

      {/* 🔥 Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search news..."
          className="w-full bg-[#1E293B] text-sm text-white placeholder-gray-500
                     px-4 py-1.5 rounded-full border border-[#2D3748]
                     focus:outline-none focus:border-cyan-500/50 transition"
        />
      </form>

      {/* Right side */}
      <div className="flex items-center gap-4 text-[#94A3B8] shrink-0">

        {/* Categories */}
        <div className="hidden md:flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-300
                ${category === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                  : "bg-[#1E293B] hover:bg-cyan-500/10 hover:text-white"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button onClick={() => navigate("/saved")} className="hover:text-white transition">
          Saved
        </button>

        <span className="hidden md:block text-xs text-gray-400">
          {auth.currentUser?.email}
        </span>

        <button onClick={() => signOut(auth)} className="hover:text-white transition">
          Logout
        </button>

        <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-sm">
          {auth.currentUser?.email?.[0]?.toUpperCase()}
        </div>

      </div>
    </div>
  );
}