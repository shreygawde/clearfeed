import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/NavBar.jsx";
import ArticlePage from "./pages/ArticlePage";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Saved from "./pages/Saved";
import Search from "./pages/Search";

export default function App() {
  const [category, setCategory] = useState("general");
  const [user, setUser] = useState(null);

  // Blocks rendering until we know auth state AND have loaded user prefs.
  // Without this flag, the app flashes "general" before switching to the
  // user's actual preferred category, which looks broken.
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        // Restore the category the user was last on.
        // Firestore write happens in NavBar on every category click.
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            const preferred = snap.data().preferredCategory;
            if (preferred) setCategory(preferred);
          }
        } catch (err) {
          // Non-fatal — just fall back to general
          console.error("Could not load user preferences:", err);
        }
      }

      setLoadingPrefs(false);
    });

    return () => unsubscribe();
  }, []);

  if (loadingPrefs) {
    return (
      <div className="bg-[#0B0F14] min-h-screen flex items-center justify-center">
        <div className="text-cyan-400 text-sm animate-pulse">Loading Clearfeed...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="bg-[#0B0F14] text-white min-h-screen">
        <div className="absolute inset-0 -z-10">
          <div className="absolute w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] top-[-150px] left-[20%]" />
          <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[120px] bottom-[-150px] right-[20%]" />
        </div>

        <Navbar setCategory={setCategory} category={category} />

        <Routes>
          {!user ? (
            <Route path="*" element={<Login />} />
          ) : (
            <>
              {/*
                key={category} is intentional — it forces Home to fully remount
                on every category switch instead of relying on the effect re-running.
                This was the cleanest fix for a stale fetch bug caused by React 19's
                stricter effect behavior in StrictMode.
              */}
              <Route path="/" element={<Home key={category} category={category} />} />
              <Route path="/article" element={<ArticlePage />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/search" element={<Search />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}