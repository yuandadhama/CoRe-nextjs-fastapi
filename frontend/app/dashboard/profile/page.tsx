"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2000);
  };

  // ============================
  // FETCH CURRENT USER
  // ============================
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();

        setEmail(data.email);
        setUsername(data.username ?? "");
        setNewUsername(data.username ?? "");
      } catch {
        localStorage.removeItem("access_token");
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // ============================
  // UPDATE USERNAME
  // ============================
  const handleSave = async () => {
    // guard: don't allow double submit
    if (saving) return;

    // unchanged => nothing to do
    if (newUsername === username) return;

    // basic validations (browser also validates via form)
    if (!newUsername.trim()) {
      showToast("error", "Username cannot be empty");
      return;
    }
    if (newUsername.length < 3) {
      showToast("error", "Username must be at least 3 characters");
      return;
    }
    if (newUsername.length > 10) {
      showToast("error", "Username max 10 characters");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      // immediately prevent further edits / submits
      setSaving(true);

      const res = await fetch(`${API_URL}/auth/set-username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          email: email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // allow user to edit again by keeping saving false in finally
        showToast("error", data.detail || "Failed to update username");
        return;
      }

      // optionally update token if backend returned a refreshed one
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      showToast("success", "Username updated!");

      // reflect the new saved username locally so button disables
      setUsername(newUsername);

      // route back to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch (err) {
      console.error(err);
      showToast("error", "Something went wrong");
    } finally {
      // allow editing again only if we didn't already navigate away
      setSaving(false);
    }
  };

  // ============================
  // LOADING SCREEN
  // ============================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-white">
        <div className="animate-pulse text-gray-400">Loading profile...</div>
      </div>
    );
  }

  // unchanged check (disable submit)
  const isUnchanged = newUsername === username;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#05070D] to-[#0A0F1C] text-white p-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50
            ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          <p className="text-white font-semibold">{toast.message}</p>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-300 hover:text-white transition mb-6 cursor-pointer"
        disabled={saving}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="max-w-xl mx-auto bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-lg shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <User size={32} className="text-blue-400" />
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!saving && !isUnchanged) handleSave();
          }}
          className="space-y-6"
        >
          {/* Username Input */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Username (3–10 chars)
            </label>
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength={3}
              maxLength={10}
              disabled={saving} // <-- disable while saving
              aria-busy={saving}
              className={`w-full bg-[#131A29] border border-white/10 p-3 rounded-lg
              focus:ring-2 focus:ring-blue-500 outline-none ${
                saving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            />
            <p className="text-xs text-gray-400 mt-1">
              {newUsername.length}/10
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || isUnchanged}
            className={`w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition
              ${
                saving || isUnchanged
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
