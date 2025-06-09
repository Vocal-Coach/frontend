"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { Mic, BarChartBig, BookOpen } from "lucide-react";

export default function PathSelection() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      <div className="max-w-sm mx-auto w-full">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10 text-center">
          How would you like to begin?
        </h2>

        <div className="space-y-6">
          <Link href="/levels" className="block">
            <Card
              title="Evaluate My Voice"
              description="Get a quick analysis of your pitch, tone, and range."
              icon={<Mic className="text-indigo-600" />}
              accentColorClass="text-indigo-600"
            />
          </Link>

          <Link href="/practice" className="block">
            <Card
              title="Practice Exercises"
              description="Access targeted exercises to improve your vocal skills."
              icon={<BarChartBig className="text-purple-600" />}
              accentColorClass="text-purple-600"
            />
          </Link>

          <Link href="/learn" className="block">
            <Card
              title="Learn Vocal Basics"
              description="Understand fundamental singing techniques and theory."
              icon={<BookOpen className="text-green-600" />}
              accentColorClass="text-green-600"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
