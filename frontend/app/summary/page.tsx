"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/Button";

export default function SummaryPage() {
  const router = useRouter();
  const params = useSearchParams();

  // ambil hasil dari query parameter
  const result = params.get("result");

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex flex-col items-center px-6 py-10 relative">
      {/* Tombol Back */}
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute left-6 top-6 flex items-center gap-2 text-gray-300 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Dashboard</span>
      </button>

      {/* Main Container */}
      <div className="bg-[#111827] w-full max-w-2xl rounded-2xl p-10 shadow-xl mt-14">
        <h1 className="text-3xl font-bold text-center mb-8">
          Your Recommended Learning Path
        </h1>

        {/* Result */}
        <div className="bg-[#1A2233] rounded-xl p-6 text-center border border-blue-600 shadow-lg">
          <p className="text-lg text-blue-300">
            Based on your background, we recommend:
          </p>
          <h2 className="text-2xl font-bold mt-3 text-blue-400">
            {result || "No result available"}
          </h2>
        </div>

        <div className="h-px bg-gray-700 my-10"></div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <Button
            text="Try Again"
            onClick={() => router.push("/dashboard/input")}
          />
          <Button
            text="Back to Dashboard"
            className="bg-gray-600 hover:bg-gray-700"
            onClick={() => router.push("/dashboard")}
          />
        </div>
      </div>
    </div>
  );
}
