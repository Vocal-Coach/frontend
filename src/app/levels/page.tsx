"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { levels } from "@/lib/levelsData";

export default function Levels() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-5 sticky top-0 bg-background z-10 border-b border-gray-200">
        <Link href="/path-selection">
          <button className="p-2 rounded-full hover:bg-gray-200 mr-2">
            <ArrowLeft className="text-gray-700 h-6 w-6" />
          </button>
        </Link>
        <h2 className="text-xl font-semibold text-gray-800 text-center flex-grow">
          Evaluation
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-grow overflow-y-auto px-6 pb-6 pt-4">
        <div className="space-y-6">
          {" "}
          {/* 카드 사이 간격 조정 */}
          {levels.map((level) => (
            <Link href={`/evaluate/${level.id}`} key={level.id}>
              <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer mb-4">
                <h3 className={`text-lg font-semibold ${level.accentColor}`}>
                  Level {level.id}: {level.title.split(":")[1].trim()}
                </h3>
                <p className="text-sm text-gray-600 leading-snug mt-1">
                  {level.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
