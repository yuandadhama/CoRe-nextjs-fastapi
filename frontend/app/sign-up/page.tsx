"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function SignUpEmailPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [disabled, setDisabled] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const passwordValidation = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allValid =
    passwordValidation.length &&
    passwordValidation.uppercase &&
    passwordValidation.number &&
    passwordValidation.symbol;

  const bullet = (cond: boolean) => (cond ? "text-green-400" : "text-red-400");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError("");

    if (!allValid) {
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setGeneralError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data.detail || "Registration failed");
        setLoading(false);
        return;
      }

      router.push(`/create-username?email=${email}`);
    } catch {
      setGeneralError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950 text-white">
      {/* Gradient Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[200px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-purple-600/20 blur-[200px] rounded-full" />

      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Back</span>
      </button>

      {/* Card */}
      <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 animate-fadeIn mt-15 mb-5">
        <h1 className="text-3xl font-semibold">Create Your Account</h1>
        <p className="text-gray-300 text-sm mt-2">
          Start your journey with a secure account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Email */}
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
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Validation */}
          <div className="text-left text-sm space-y-1">
            <p className={bullet(passwordValidation.length)}>
              • Minimum 8 characters
            </p>
            <p className={bullet(passwordValidation.uppercase)}>
              • At least 1 uppercase letter
            </p>
            <p className={bullet(passwordValidation.number)}>
              • At least 1 number
            </p>
            <p className={bullet(passwordValidation.symbol)}>
              • At least 1 symbol
            </p>
          </div>

          {/* Confirm */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
            >
              {showConfirm ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !allValid}
            className="w-full p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 
            font-semibold shadow-lg hover:shadow-indigo-700/20 transition-all
            disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        {generalError && (
          <p className="text-red-400 text-sm mt-3 w-full text-center">
            {generalError}
          </p>
        )}

        <p className="text-gray-300 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-indigo-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
