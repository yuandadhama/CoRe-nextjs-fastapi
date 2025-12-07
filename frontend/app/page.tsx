"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setLoggedIn(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (loggedIn) {
    router.push("/home");
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative">
      {/* Gradient Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-black via-gray-900 to-indigo-900"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-[140px]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/30 rounded-full blur-[160px]"></div>
      <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-blue-500/20 rounded-full blur-[180px]"></div>

      {/* Content */}
      <div
        className="relative backdrop-blur-xl bg-white/5 border border-white/10 
        rounded-3xl p-10 max-w-lg w-[90%] shadow-2xl text-center space-y-6 animate-fadeIn"
      >
        <h1 className="text-4xl font-extrabold tracking-wide text-white leading-tight">
          Welcome to{" "}
          <span className="text-indigo-400 drop-shadow-lg">CoRe</span>
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed px-2">
          Get personalized course recommendations powered by AI. Sign up now to
          enhance your content discovery experience!
        </p>

        {/* Divider */}
        <div className="w-20 h-1 mx-auto bg-indigo-500 rounded-full opacity-80"></div>

        <button
          onClick={() => {
            setBtnLoading(true);
            router.push("/sign-up");
          }}
          disabled={btnLoading}
          className={`w-full mt-4 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 cursor-pointer
    flex items-center justify-center gap-2
    ${
      btnLoading
        ? "bg-indigo-500 cursor-not-allowed"
        : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.03]"
    }
  `}
        >
          {btnLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Start Your Journey"
          )}
        </button>

        <p className="text-sm text-gray-400 mt-2">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/sign-in")}
            className="text-indigo-300 hover:underline cursor-pointer"
          >
            Please Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
