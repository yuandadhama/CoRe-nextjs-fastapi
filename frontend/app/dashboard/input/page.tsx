"use client";

import Button from "@/components/Button";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AcademicBackground() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const router = useRouter();

  // ==============================
  // STATE
  // ==============================
  const [math, setMath] = useState("85");
  const [science, setScience] = useState("85");
  const [english, setEnglish] = useState("85");

  const interests = ["Logic", "Communication", "Design", "Technology", "Arts"];
  const goals = [
    "Data Analyst",
    "Project Manager",
    "UI/UX Designer",
    "Software Developer",
    "Creative Director",
  ];

  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const [loading, setLoading] = useState(true); // <-- for route protection
  const [submitting, setSubmitting] = useState(false);

  // ==============================
  // ROUTE PROTECTION
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("access_token");
          router.push("/sign-in");
          return;
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("access_token");
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  // ==============================
  // SUBMIT FORM
  // ==============================
  const handleSubmit = async () => {
    if (!selectedInterest || !selectedGoal) {
      alert("Please select your main interest and career goal.");
      return;
    }

    const payload = {
      math: Number(math),
      science: Number(science),
      english: Number(english),
      interest: selectedInterest,
      career_goal: selectedGoal,
    };

    try {
      setSubmitting(true);

      const res = await fetch(`${API_URL}/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Failed to process recommendation.");
        return;
      }

      router.push(
        `/summary?result=${encodeURIComponent(data.recommended_field)}`
      );
    } catch (err) {
      console.error(err);
      alert("Something went wrong, try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // LOADING PROTECTION UI
  // ==============================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-white">
        <div className="animate-pulse text-gray-400">
          Checking authentication...
        </div>
      </div>
    );
  }

  // ==============================
  // MAIN UI
  // ==============================
  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0F1C] via-[#0D1220] to-[#04070F] text-white px-6 py-10 flex flex-col items-center relative">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute left-6 top-6 flex items-center gap-2 text-gray-300 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      {/* Main Card */}
      <div
        className="
          w-full max-w-2xl bg-white/5 rounded-3xl p-10 mt-14
          shadow-[0_0_40px_rgba(0,0,0,0.25)]
          backdrop-blur-lg border border-white/10
        "
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          Academic Background
        </h1>
        <p className="text-center text-gray-400 mb-10">
          Help us understand your strengths so we can give accurate
          recommendations.
        </p>

        {/* Grades Section */}
        <div className="grid grid-cols-2 gap-y-8 gap-x-6">
          {[
            { label: "Math Grade Average", value: math, set: setMath },
            { label: "Science Grade Average", value: science, set: setScience },
            { label: "English Grade Average", value: english, set: setEnglish },
          ].map((field) => (
            <div key={field.label} className="flex flex-col">
              <p className="mb-2 font-medium">{field.label}</p>
              <input
                className="
                  bg-[#131A29] border border-white/10 rounded-xl px-3 py-2 
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition
                "
                value={field.value}
                type="number"
                max={100}
                min={0}
                onChange={(e) => field.set(e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Interests */}
        <div className="mt-12">
          <p className="text-lg font-semibold mb-3">Your Main Interest</p>

          <div className="flex gap-3 flex-wrap">
            {interests.map((item) => (
              <button
                key={item}
                onClick={() => setSelectedInterest(item)}
                className={`
                  px-5 py-2.5 text-sm rounded-xl border transition-all cursor-pointer
                  ${
                    selectedInterest === item
                      ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/20 scale-[1.04]"
                      : "bg-[#131A29] border-white/10 hover:bg-[#1A2233]"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Career Goal */}
        <div className="mt-12">
          <p className="text-lg font-semibold mb-3">Your Career Goal</p>

          <div className="flex gap-3 flex-wrap">
            {goals.map((item) => (
              <button
                key={item}
                onClick={() => setSelectedGoal(item)}
                className={`
                  px-5 py-2.5 text-sm rounded-xl border transition-all cursor-pointer
                  ${
                    selectedGoal === item
                      ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/20 scale-[1.04]"
                      : "bg-[#131A29] border-white/10 hover:bg-[#1A2233]"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-12 flex justify-center cursor-pointer">
          <Button
            text={submitting ? "Processing..." : "Submit"}
            onClick={handleSubmit}
            disabled={submitting}
          />
        </div>
      </div>
    </div>
  );
}
