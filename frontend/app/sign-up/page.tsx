"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Import lucide-react icons
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function SignUpEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // VALIDASI PASSWORD
  const passwordValidation = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allPasswordValid =
    passwordValidation.length &&
    passwordValidation.uppercase &&
    passwordValidation.number &&
    passwordValidation.symbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError("");

    if (!allPasswordValid) {
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setGeneralError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/auth/register-email", {
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
    } catch (error) {
      setGeneralError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const bullet = (condition: boolean) =>
    condition ? "text-green-400" : "text-red-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4 relative">
      {/* ⬅ BACK BUTTON (TOP LEFT) */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-5 left-5 flex items-center gap-2 text-gray-300 hover:text-white transition"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Back</span>
      </button>

      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Create Your Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-gray-800 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* EYE ICON */}
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* FEEDBACK PASSWORD (ATAS) */}
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

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full p-3 rounded-lg bg-gray-800 pr-12"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            {/* EYE ICON */}
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* SIGN UP BUTTON */}
          <button
            type="submit"
            disabled={loading || !allPasswordValid}
            className={`w-full p-3 rounded-lg font-semibold transition-colors
              ${
                loading || !allPasswordValid
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        {generalError && (
          <p className="text-sm mt-4 text-red-400">{generalError}</p>
        )}

        <div className="mt-6 border-t border-gray-700 pt-4">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
