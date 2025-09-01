"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../lib/http"; // axios client

export function AuthPage({ isSignIn }: { isSignIn: boolean }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    try {
      if (isSignIn) {
        const res = await api.post("/signin", { username, password });
        localStorage.setItem("token", res.data.token);
        setMessage("Signed in successfully!");

        // ✅ Redirect to canvas page
        router.push("/canvas");
      } else {
        const res = await api.post("/signup", { username, password, name });
        setMessage("Account created. Your UserID: " + res.data.userId);

        // ✅ After signup, go to signin OR directly to canvas
        router.push("/signin"); // or "/canvas"
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="px-8 py-10 w-[380px] rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
        <div className="text-4xl mb-8 font-extrabold text-center bg-gradient-to-r from-green-400 via-green-600 to-green-400 bg-[length:200%_200%] animate-gradient bg-clip-text text-transparent">
          SYNCDRAW
        </div>

        <div className="text-white/80 text-center mb-6 text-lg">
          {isSignIn ? "Login to your Account" : "Create an Account"}
        </div>

        {!isSignIn && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-white/30 bg-white/10 placeholder-white/60 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>
        )}

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-white/30 bg-white/10 placeholder-white/60 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-white/30 bg-white/10 placeholder-white/60 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? "Please wait..." : isSignIn ? "Sign In" : "Sign Up"}
        </button>

        {message && (
          <p className="text-center text-sm text-green-400 mt-4">{message}</p>
        )}

        <p className="text-center text-sm text-white/60 mt-6">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={isSignIn ? "/signup" : "/signin"}
            className="text-green-400 hover:underline"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
}
