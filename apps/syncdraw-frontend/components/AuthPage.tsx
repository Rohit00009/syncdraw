"use client";

import Link from "next/link";

export function AuthPage({ isSignIn }: { isSignIn: boolean }) {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div
        className="px-8 py-10 w-[380px] rounded-3xl 
        bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl"
      >
        {/* Logo / Title */}
        <div
          className="text-4xl mb-8 font-extrabold text-center 
          bg-gradient-to-r from-green-400 via-green-600 to-green-400 
          bg-[length:200%_200%] animate-gradient bg-clip-text text-transparent"
        >
          SYNCDRAW
        </div>

        {/* Subtitle */}
        <div className="text-white/80 text-center mb-6 text-lg">
          {isSignIn ? "Login to your Account" : "Create an Account"}
        </div>

        {/* Name Input (only for Sign Up) */}
        {!isSignIn && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border border-white/30 bg-white/10 
             placeholder-white/60 text-white px-4 py-3 rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-green-400 
              transition"
            />
          </div>
        )}

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-white/30 bg-white/10 
              placeholder-white/60 text-white px-4 py-3 rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-green-400 
              transition"
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-white/30 bg-white/10 
              placeholder-white/60 text-white px-4 py-3 rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-green-400 
              transition"
          />
        </div>

        {/* Button */}
        <button
          onClick={() => {}}
          className="w-full py-3 rounded-xl font-semibold 
            bg-gradient-to-r from-green-400 to-green-600 text-white 
            shadow-lg hover:scale-[1.02] active:scale-[0.98] 
            transition-transform"
        >
          {isSignIn ? "Sign In" : "Sign Up"}
        </button>

        {/* Small Switch Link */}
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
