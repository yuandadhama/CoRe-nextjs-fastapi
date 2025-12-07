"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateUsernamePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const router = useRouter();
  const params = useSearchParams();

  const email = params.get("email");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) router.push("/sign-up");
  }, [email, router]);

  useEffect(() => {
    if (username.length === 0) return setIsValid(true);
    setIsValid(username.length >= 3);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!isValid) {
      setMessage("Error: Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/set-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("logged_in", "true");
          localStorage.setItem("user_id", data.user_id);
        }
        router.push("/dashboard");
      } else {
        setMessage("Error: " + (data.detail || JSON.stringify(data)));
      }
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to backend");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 text-white overflow-hidden bg-linear-to-br from-[#0a0a0f] via-[#111827] to-[#0f172a]">
      {/* Background Glow Circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/20 blur-[120px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl animate-fadeInUp">
          {/* Title */}
          <h1 className="text-3xl font-bold tracking-wide">
            Create Your Identity
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            This username will represent you across the app.
          </p>

          {/* Email Info */}
          <p className="text-blue-400 text-sm font-medium mt-2">{email}</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-8">
            <div className="text-left">
              <label className="text-sm text-gray-300 mb-1 block">
                Username
              </label>
              <input
                type="text"
                placeholder="Write your username here..."
                className={`w-full p-3 rounded-xl bg-black/30 border outline-none transition
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  ${!isValid ? "border-red-500" : "border-white/10"}`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {!isValid && (
              <p className="text-red-400 text-sm -mt-2">
                Username must be at least 3 characters.
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={username.length < 3 || loading}
              className={`w-full p-3 mt-4 rounded-xl font-semibold text-black bg-linear-to-r 
                from-blue-400 to-purple-400 shadow-lg shadow-purple-500/20
                transition-all duration-300 transform hover:scale-[1.02]
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2 cursor-pointer`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <p
              className={`text-sm mt-4 text-center ${
                message.toLowerCase().includes("error")
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
