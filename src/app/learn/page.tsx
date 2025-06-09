"use client";

import Link from "next/link";
import { ArrowLeft, Wind, Mic, Music } from "lucide-react";

export default function LearnPage() {
  const vocalBasics = [
    {
      id: "breathing",
      title: "Breathing",
      description: "Learn proper breathing techniques for vocal performance",
      icon: Wind,
      color: "bg-blue-500",
      accentColor: "text-blue-600",
    },
    {
      id: "phonation",
      title: "Phonation",
      description: "Understand how your voice is produced",
      icon: Mic,
      color: "bg-green-500",
      accentColor: "text-green-600",
    },
    {
      id: "register",
      title: "Register",
      description: "Discover different vocal registers and how to use them",
      icon: Music,
      color: "bg-purple-500",
      accentColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center p-5 bg-white border-b border-gray-200 sticky top-0 z-10">
        <Link href="/path-selection">
          <button className="p-2 rounded-full hover:bg-gray-100 mr-3 transition-colors">
            <ArrowLeft className="text-gray-700 h-6 w-6" />
          </button>
        </Link>
        <h2 className="text-xl font-semibold text-gray-800 flex-grow text-center">
          Learn Vocal Basics
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Vocal Basics Cards */}
          <div className="space-y-4">
            {vocalBasics.map((topic) => {
              const IconComponent = topic.icon;
              return (
                <Link
                  href={`/learn/${topic.id}`}
                  key={topic.id}
                  className="block"
                >
                  <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200">
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div
                        className={`${topic.color} p-3 rounded-xl flex-shrink-0`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <h3
                          className={`text-lg font-semibold ${topic.accentColor} mb-1`}
                        >
                          {topic.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <ArrowLeft className="h-5 w-5 text-gray-400 rotate-180" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
