"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  // Cek login pakai localStorage token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setLoggedIn(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (loggedIn) {
    router.push("/home");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl font-bold mb-2">Hello👋 Welcome to CoRe!</h1>
      <p className="text-gray-400">Please sign in to continue.</p>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => router.push("/sign-in")}
          className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
