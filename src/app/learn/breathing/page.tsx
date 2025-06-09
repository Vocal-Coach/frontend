"use client";

import Link from "next/link";
import { ArrowLeft, Wind, Heart, Target } from "lucide-react";

export default function BreathingPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-5 sticky top-0 bg-background z-10 border-b border-gray-200">
        <Link href="/learn">
          <button className="p-2 rounded-full hover:bg-gray-200 mr-2">
            <ArrowLeft className="text-gray-700 h-6 w-6" />
          </button>
        </Link>
        <h2 className="text-xl font-semibold text-gray-800 text-center flex-grow">
          Breathing Techniques
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto px-6 pb-6 pt-4">
        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center mb-3">
              <Wind className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">
                The Foundation of Great Singing
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Proper breathing is the cornerstone of excellent vocal technique.
              It provides the power, control, and stamina needed for beautiful
              singing while protecting your voice from strain and injury.
            </p>
          </div>

          {/* Diaphragmatic Breathing */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 p-3 rounded-xl mr-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-600">
                  Diaphragmatic Breathing
                </h3>
                <p className="text-gray-500 text-sm">The Core Technique</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Also known as "belly breathing," this technique uses your
              diaphragm - a large muscle below your lungs - to create deep,
              controlled breaths that support your voice.
            </p>

            <div className="bg-blue-50 p-4 rounded-xl mb-4">
              <h4 className="font-semibold text-blue-800 mb-2 text-sm">
                How It Works:
              </h4>
              <ul className="space-y-2">
                <li className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">1.</span>
                  Your diaphragm contracts and moves downward
                </li>
                <li className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">2.</span>
                  This creates space for your lungs to expand fully
                </li>
                <li className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">3.</span>
                  Air flows in naturally, filling your lungs from bottom to top
                </li>
                <li className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">4.</span>
                  Your belly expands outward, not your chest
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                Practice Exercise:
              </h4>
              <ol className="space-y-2">
                <li className="text-gray-600 text-sm flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Lie down with one hand on chest, one on belly
                </li>
                <li className="text-gray-600 text-sm flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Breathe slowly - only the belly hand should move
                </li>
                <li className="text-gray-600 text-sm flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Inhale for 4 counts, hold for 4, exhale for 8
                </li>
                <li className="text-gray-600 text-sm flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Practice daily until it becomes natural
                </li>
              </ol>
            </div>
          </div>

          {/* Breath Support */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 p-3 rounded-xl mr-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600">
                  Breath Support
                </h3>
                <p className="text-gray-500 text-sm">
                  Controlling Your Air Flow
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Breath support is about controlling the release of air to maintain
              steady, consistent vocal tone throughout your phrases.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2 text-sm">
                  Good Support:
                </h4>
                <ul className="space-y-1">
                  <li className="text-green-700 text-sm">
                    • Steady, controlled airflow
                  </li>
                  <li className="text-green-700 text-sm">
                    • Consistent vocal tone
                  </li>
                  <li className="text-green-700 text-sm">
                    • No breathiness or strain
                  </li>
                  <li className="text-green-700 text-sm">
                    • Ability to sustain long phrases
                  </li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <h4 className="font-semibold text-red-800 mb-2 text-sm">
                  Poor Support:
                </h4>
                <ul className="space-y-1">
                  <li className="text-red-700 text-sm">
                    • Shaky, uneven airflow
                  </li>
                  <li className="text-red-700 text-sm">
                    • Breathy or weak tone
                  </li>
                  <li className="text-red-700 text-sm">
                    • Running out of breath quickly
                  </li>
                  <li className="text-red-700 text-sm">
                    • Tension in throat/shoulders
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Breathing Exercises */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              🎯 Daily Breathing Exercises
            </h3>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-cyan-100">
                <h4 className="font-semibold text-cyan-700 mb-2">
                  Exercise 1: Basic Diaphragmatic Breathing
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Practice the fundamental technique for 5-10 minutes daily.
                </p>
                <p className="text-cyan-600 text-xs">
                  Duration: 5-10 minutes | Frequency: Daily
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2">
                  Exercise 2: Sustained "Ss" Sound
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Take a deep breath and make a steady "sss" sound for as long
                  as possible. Aim for 15-30 seconds with consistent airflow.
                </p>
                <p className="text-blue-600 text-xs">
                  Goal: 30+ seconds | Practice: 3-5 repetitions
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2">
                  Exercise 3: Lip Trills
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Make a "brr" sound with your lips while singing scales. This
                  helps coordinate breath support with vocal production.
                </p>
                <p className="text-purple-600 text-xs">
                  Practice: 5-10 scales | Focus: Steady airflow
                </p>
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3">
              ⚠️ Common Breathing Mistakes
            </h4>
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <div>
                  <p className="text-amber-800 text-sm font-medium">
                    Chest Breathing
                  </p>
                  <p className="text-amber-700 text-xs">
                    Lifting shoulders and expanding chest instead of using
                    diaphragm
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <div>
                  <p className="text-amber-800 text-sm font-medium">
                    Holding Tension
                  </p>
                  <p className="text-amber-700 text-xs">
                    Tightening throat, jaw, or shoulders while breathing
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <div>
                  <p className="text-amber-800 text-sm font-medium">
                    Over-breathing
                  </p>
                  <p className="text-amber-700 text-xs">
                    Taking too much air and creating tension
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
