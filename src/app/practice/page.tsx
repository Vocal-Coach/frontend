"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Wind,
  Volume2,
  Music,
  BarChart3,
  MessageSquare,
} from "lucide-react";

export default function PracticePage() {
  const practiceTypes = [
    {
      id: "breathing",
      title: "Breathing",
      description: "Practice breathing exercises to improve your vocal support",
      icon: Wind,
      color: "bg-blue-500",
      accentColor: "text-blue-600",
      available: true,
    },
    {
      id: "tone",
      title: "Tone",
      description: "Work on your vocal tone quality and consistency",
      icon: Volume2,
      color: "bg-purple-500",
      accentColor: "text-purple-600",
      available: true,
    },
    {
      id: "scales",
      title: "Scales",
      description:
        "Practice vocal scales to improve pitch accuracy and agility",
      icon: Music,
      color: "bg-green-500",
      accentColor: "text-green-600",
      available: false,
    },
    {
      id: "range",
      title: "Range",
      description: "Expand your vocal range with targeted exercises",
      icon: BarChart3,
      color: "bg-orange-500",
      accentColor: "text-orange-600",
      available: false,
    },
    {
      id: "articulation",
      title: "Articulation",
      description: "Improve clarity and precision in your vocal delivery",
      icon: MessageSquare,
      color: "bg-pink-500",
      accentColor: "text-pink-600",
      available: false,
    },
  ];

  const handleUnavailableClick = () => {
    alert("This feature will be available in a future update.");
  };

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center p-5 bg-white border-b border-gray-200 sticky top-0 z-10">
        <Link href="/path-selection">
          <button className="p-2 rounded-full hover:bg-gray-100 mr-3 transition-colors">
            <ArrowLeft className="text-gray-700 h-6 w-6" />
          </button>
        </Link>
        <h2 className="text-xl font-semibold text-gray-800 flex-grow text-center">
          Practice Exercises
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Practice Cards */}
          <div className="space-y-4">
            {practiceTypes.map((practice) => {
              const IconComponent = practice.icon;

              if (practice.available) {
                return (
                  <Link
                    href={`/practice/${practice.id}`}
                    key={practice.id}
                    className="block"
                  >
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200">
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div
                          className={`${practice.color} p-3 rounded-xl flex-shrink-0`}
                        >
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-grow min-w-0">
                          <h3
                            className={`text-lg font-semibold ${practice.accentColor} mb-1`}
                          >
                            {practice.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                            {practice.description}
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
              } else {
                return (
                  <div
                    key={practice.id}
                    onClick={handleUnavailableClick}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 opacity-75"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div
                        className={`${practice.color} p-3 rounded-xl flex-shrink-0 opacity-60`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <h3
                          className={`text-lg font-semibold ${practice.accentColor} mb-1`}
                        >
                          {practice.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
                          {practice.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <ArrowLeft className="h-5 w-5 text-gray-300 rotate-180" />
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
