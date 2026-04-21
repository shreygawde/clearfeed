import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login"); // toggle between login and signup

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err.code));
    }
  };

  const handleSignup = async () => {
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err.code));
    }
  };

  const handleSubmit = mode === "login" ? handleLogin : handleSignup;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0B0F14] text-white relative overflow-hidden">

      {/* Background glow — matches the rest of the app */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] top-[-100px] left-[20%]" />
        <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-[120px] bottom-[-100px] right-[20%]" />
      </div>

      <div className="w-full max-w-sm px-6 flex flex-col gap-8">

        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-wide">
            <span className="text-[#22D3EE] drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
              Clear
            </span>
            feed
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            News with context and perspective
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121821]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-8 flex flex-col gap-5">

          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[#1E293B]">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm transition-all duration-200
                ${mode === "login"
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-gray-500 hover:text-gray-300"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2 text-sm transition-all duration-200
                ${mode === "signup"
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-gray-500 hover:text-gray-300"
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
              {error}
            </div>
          )}

          {/* Inputs */}
          <div className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-[#1E293B] text-sm text-white placeholder-gray-500
                         px-4 py-3 rounded-xl border border-[#2D3748]
                         focus:outline-none focus:border-cyan-500/50 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#1E293B] text-sm text-white placeholder-gray-500
                         px-4 py-3 rounded-xl border border-[#2D3748]
                         focus:outline-none focus:border-cyan-500/50 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98]
                       text-white font-medium py-3 rounded-xl transition-all duration-200"
          >
            {mode === "login" ? "Login" : "Create Account"}
          </button>

        </div>

      </div>
    </div>
  );
}

function getErrorMessage(code) {
  switch (code) {
    case "auth/invalid-email": return "Invalid email format";
    case "auth/user-not-found": return "No account found";
    case "auth/wrong-password": return "Incorrect password";
    case "auth/email-already-in-use": return "Email already registered";
    case "auth/weak-password": return "Password must be at least 6 characters";
    default: return "Something went wrong";
  }
}