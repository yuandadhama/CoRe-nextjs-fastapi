"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateUsernamePage() {
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

  // Validasi minimal 3 karakter
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
      const res = await fetch("http://localhost:8000/auth/set-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });

      const data = await res.json();

      if (res.ok) {
        // Backend sekarang mengembalikan access_token + user_id
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
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md text-center shadow-xl">
        <h1 className="text-2xl font-bold">Create Username</h1>
        <p className="text-gray-400 text-sm mt-2">{email}</p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <input
            type="text"
            placeholder="Choose a username"
            className={`w-full p-3 rounded-lg bg-gray-800 outline-none 
              ${!isValid ? "ring-1 ring-red-500" : ""}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {!isValid && (
            <p className="text-red-400 text-sm -mt-2">
              Username must be at least 3 characters.
            </p>
          )}

          <button
            type="submit"
            disabled={username.length < 3 || loading}
            className={`w-full p-3 rounded-lg font-semibold duration-200 flex items-center justify-center gap-2
              ${
                username.length < 3 || loading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {message && (
          <p
            className={`text-sm mt-4 ${
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
  );
}
