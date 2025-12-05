"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import Link from "next/link";
import Button from "../../components/Button";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // Token expired / invalid
          localStorage.removeItem("access_token");
          router.push("/sign-in");
          return;
        }

        const data = await res.json(); // { id, username }

        setUsername(data.username);
        setLoading(false);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("access_token");
        router.push("/sign-in");
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/sign-in");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0F1C] text-white">
      <nav
        className="
      fixed top-0 left-0 right-0
      h-16 px-6
      bg-blue-900/40 backdrop-blur-md
      border-b border-white/10
      flex items-center justify-between
    "
      >
        <div className="flex items-center gap-3">
          <User size={24} />
          <h1 className="text-xl font-semibold text-gray-200">
            <span className="text-white font-bold">{username}</span>
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="
          px-4 py-2 rounded-lg 
          bg-red-600/80 hover:bg-red-700
          text-sm font-medium
          transition-all
        "
        >
          Logout
        </button>
      </nav>

      <div className="w-full flex justify-center items-center h-full">
        <div className="flex flex-col w-md items-center gap-6">
          <div className="text-center text-gray-300 ">
            Get you recommendations based on your academic background and
            interests!
          </div>
          <Link href="dashboard/input" className="flex justify-center">
            <Button text="next" />
          </Link>
        </div>
      </div>
    </div>
  );
}
