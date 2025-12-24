"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, ArrowRightCircle, X } from "lucide-react";
import Link from "next/link";

interface HistoryItem {
  id: number;
  timestamp: string;
  math: number;
  science: number;
  english: number;
  interest: string;
  career_goal: string;
  result: string;
}

export default function HomePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ======================================================
  // FETCH USER & HISTORY
  // ======================================================
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        const resUser = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await resUser.json();
        setUsername(userData.username);

        const resHistory = await fetch(`${API_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const historyJson = await resHistory.json();
        setHistoryData(historyJson.history);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("access_token");
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // ======================================================
  // LOGOUT
  // ======================================================
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/sign-in");
  };

  // ======================================================
  // DELETE HISTORY
  // ======================================================
  const confirmDelete = (id: number) => {
    setSelectedId(id);
    console.log("Selected ID for deletion:", id);
    setShowModal(true);
  };

  const deleteHistory = async () => {
    if (!selectedId) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setDeleting(true);

      const res = await fetch(`${API_URL}/history/${selectedId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      // update UI
      setHistoryData((prev) => prev.filter((item) => item.id !== selectedId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setShowModal(false);
      setSelectedId(null);
    }
  };

  // ======================================================
  // LOADING STATE
  // ======================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-white">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-linear-to-br from-[#05070D] to-[#0A0F1C] text-white flex">
      {/* ======================================================
          SIDEBAR (DESKTOP)
      ====================================================== */}
      <aside className="hidden md:flex w-64 h-full bg-[#0D111B]/80 backdrop-blur-xl border-r border-white/5 flex-col p-6">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 mb-12 group"
        >
          <User
            size={36}
            className="text-blue-400 transition-all group-hover:scale-110"
          />
          <div className="flex flex-col group-hover:translate-x-1 transition">
            <h2 className="text-lg font-semibold group-hover:text-blue-300">
              {username}
            </h2>
            <p className="text-xs text-gray-400">Logged in</p>
          </div>
        </Link>

        <Link
          href="/dashboard/input"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-blue-300 hover:translate-x-1 transition-all duration-300"
        >
          <ArrowRightCircle
            size={20}
            className="group-hover:text-blue-300 transition"
          />
          Course Recommender
        </Link>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 hover:translate-x-1 transition-all duration-300 cursor-pointer"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* ======================================================
          MOBILE NAV
      ====================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D111B]/95 border-t border-white/10 flex justify-around py-3 z-50">
        <Link
          href="/dashboard/profile"
          className="flex flex-col items-center text-gray-300 text-xs hover:text-blue-300 hover:scale-110 transition-all duration-300"
        >
          <User size={22} />
          {username}
        </Link>

        <Link
          href="/dashboard/input"
          className="flex flex-col items-center text-gray-300 text-xs hover:text-blue-300 hover:scale-110 transition-all duration-300"
        >
          <ArrowRightCircle size={22} />
          CoRe
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-red-400 text-xs hover:text-red-300 hover:scale-110 transition-all duration-300 cursor-pointer"
        >
          <LogOut size={22} />
          Logout
        </button>
      </nav>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="flex-1 p-10 overflow-y-auto pb-24 md:pb-10">
        <h1 className="text-3xl font-bold mb-8 tracking-wide">
          Results History
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {historyData?.length === 0 ? (
            <>
              <p className="text-gray-400 col-span-full">No history found.</p>
              <Link
                href="/dashboard/input"
                className="text-blue-400 hover:underline"
              >
                Create one!
              </Link>
            </>
          ) : (
            historyData?.map((item) => (
              <div
                key={item.id}
                className="relative bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-lg hover:bg-white/10 transition"
              >
                {/* Delete Button */}
                <button
                  onClick={() => confirmDelete(item.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-400 transition cursor-pointer"
                >
                  <X size={18} />
                </button>

                <p className="text-xs text-gray-400 mb-4">{item.timestamp}</p>

                <div className="mb-4">
                  <p className="font-semibold">Grades:</p>
                  <p className="text-sm text-gray-300">
                    Math: <span className="text-white">{item.math}</span>
                  </p>
                  <p className="text-sm text-gray-300">
                    Science: <span className="text-white">{item.science}</span>
                  </p>
                  <p className="text-sm text-gray-300">
                    English: <span className="text-white">{item.english}</span>
                  </p>
                </div>

                <div className="mb-4">
                  <p className="font-semibold">Interest:</p>
                  <p className="text-gray-300 text-sm">{item.interest}</p>
                </div>

                <div className="mb-4">
                  <p className="font-semibold">Career Goal:</p>
                  <p className="text-gray-300 text-sm">{item.career_goal}</p>
                </div>

                <div>
                  <p className="font-semibold">Recommended Field:</p>
                  <p className="text-blue-400 text-sm">{item.result}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ======================================================
          MODAL CONFIRM DELETE
      ====================================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0D111B] p-6 rounded-xl border border-white/10 max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">Delete this history?</h2>
            <p className="text-gray-300 mb-6">This action cannot be undone.</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-600/40 hover:bg-gray-600/60 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={deleteHistory}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500/30 text-red-300 hover:bg-red-500/40 transition disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
