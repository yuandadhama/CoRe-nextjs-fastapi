"use client";

import Button from "@/components/Button";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AcademicBackground() {
  const router = useRouter();

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

  const [loading, setLoading] = useState(false);

  // Handle submit to backend
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
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json(); // <-- cukup sekali

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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex flex-col items-center px-6 py-10 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute left-6 top-6 flex items-center gap-2 text-gray-300 hover:text-white transition"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Main Container */}
      <div className="bg-[#111827] w-full max-w-2xl rounded-2xl p-10 shadow-xl mt-14">
        <h1 className="text-2xl font-semibold text-center mb-12">
          Tell us about your academic background
        </h1>

        {/* Grade Inputs */}
        <div className="grid grid-cols-2 gap-y-8 gap-x-6">
          {[
            { label: "Math Grade Average", value: math, set: setMath },
            { label: "Science Grade Average", value: science, set: setScience },
            { label: "English Grade Average", value: english, set: setEnglish },
          ].map((field) => (
            <div className="flex flex-col" key={field.label}>
              <p className="mb-2">{field.label}</p>
              <input
                className="bg-[#1A2233] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
          <p className="mb-3 text-lg font-medium">
            What is your main interest?
          </p>
          <div className="flex gap-3 flex-wrap">
            {interests.map((item) => (
              <button
                key={item}
                onClick={() => setSelectedInterest(item)}
                className={`px-4 py-2 rounded-xl transition-all border 
                  ${
                    selectedInterest === item
                      ? "bg-blue-600 border-blue-400 shadow-lg scale-[1.03]"
                      : "bg-[#1A2233] border-transparent hover:bg-[#1F2A3E] hover:border-gray-600"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="mt-12">
          <p className="mb-3 text-lg font-medium">
            What is your main career goal?
          </p>
          <div className="flex gap-3 flex-wrap">
            {goals.map((item) => (
              <button
                key={item}
                onClick={() => setSelectedGoal(item)}
                className={`px-4 py-2 rounded-xl transition-all border
                  ${
                    selectedGoal === item
                      ? "bg-blue-600 border-blue-400 shadow-lg scale-[1.03]"
                      : "bg-[#1A2233] border-transparent hover:bg-[#1F2A3E] hover:border-gray-600"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-12 flex justify-center">
          <Button
            text={loading ? "Processing..." : "Submit"}
            onClick={handleSubmit}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
