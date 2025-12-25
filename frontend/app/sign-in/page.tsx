"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.detail || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("logged_in", "true");
      localStorage.setItem("user_id", data.user_id);

      router.push("/dashboard");
    } catch (error) {
      setErrorMsg("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950 text-white px-6">
      {/* Gradient Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[180px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-blue-600/20 blur-[180px] rounded-full" />

      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Back</span>
      </button>

      {/* Card */}
      <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 animate-fadeIn">
        <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
        <p className="text-gray-300 text-sm">
          Sign in to continue your journey.
        </p>

        <form onSubmit={handleSignIn} className="space-y-4 mt-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold transition-all shadow-lg hover:shadow-indigo-700/20 
            disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-gray-300 text-sm mt-6">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-indigo-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
