"use client";

import Link from "next/link";
import { ArrowLeft, Music, Volume2, VolumeX } from "lucide-react";

export default function RegisterPage() {
  const registers = [
    {
      name: "Chest Voice",
      range: "Lower Register",
      description: "Your natural speaking voice and lower singing range",
      characteristics: [
        "Rich, full, and powerful sound",
        "Resonates in the chest cavity",
        "Used for lower notes and powerful passages",
        "Feels vibrations in your chest",
      ],
      tips: [
        "Place hand on chest to feel vibrations",
        "Start with speaking voice and gradually sing",
        "Avoid pushing too high to prevent strain",
      ],
      color: "bg-red-500",
      accentColor: "text-red-600",
    },
    {
      name: "Head Voice",
      range: "Upper Register",
      description: "Your higher singing range with a lighter, clearer tone",
      characteristics: [
        "Light, clear, and floating sound",
        "Resonates in the head/skull cavity",
        "Used for higher notes and delicate passages",
        "Feels vibrations in your head/face",
      ],
      tips: [
        "Think of sound floating above your head",
        "Use gentle, breathy tone to start",
        "Practice with humming or 'ng' sounds",
      ],
      color: "bg-blue-500",
      accentColor: "text-blue-600",
    },
    {
      name: "Mixed Voice",
      range: "Blended Register",
      description: "The perfect blend of chest and head voice",
      characteristics: [
        "Balanced, smooth, and versatile sound",
        "Combines power of chest with clarity of head",
        "Allows seamless transitions between registers",
        "The goal for most contemporary singing",
      ],
      tips: [
        "Start with light chest voice and gradually thin out",
        "Practice scales to find the blend point",
        "Focus on smooth, connected sound",
      ],
      color: "bg-purple-500",
      accentColor: "text-purple-600",
    },
  ];

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
          Vocal Registers
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto px-6 pb-6 pt-4">
        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center mb-3">
              <Music className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">
                Understanding Vocal Registers
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Vocal registers are different areas of your voice that produce
              distinct tonal qualities. Learning to identify and control these
              registers is essential for developing a versatile, healthy singing
              voice.
            </p>
            <div className="bg-white p-4 rounded-xl border border-purple-100">
              <p className="text-purple-700 text-sm font-medium">
                💡 Pro Tip: The key to great singing is learning to blend these
                registers seamlessly!
              </p>
            </div>
          </div>

          {/* Register Cards */}
          {registers.map((register, index) => (
            <div
              key={register.name}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className={`${register.color} p-3 rounded-xl mr-4`}>
                  <Volume2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${register.accentColor}`}
                  >
                    {register.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{register.range}</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {register.description}
              </p>

              {/* Characteristics */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                  Characteristics:
                </h4>
                <ul className="space-y-1">
                  {register.characteristics.map((char, i) => (
                    <li
                      key={i}
                      className="text-gray-600 text-sm flex items-start"
                    >
                      <span className="text-gray-400 mr-2">•</span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                  Practice Tips:
                </h4>
                <ul className="space-y-1">
                  {register.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="text-gray-600 text-sm flex items-start"
                    >
                      <span className="text-green-500 mr-2">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Practice Exercise */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              🎯 Register Blending Exercise
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-green-100">
                <h4 className="font-semibold text-green-700 mb-2">
                  Step 1: Find Your Registers
                </h4>
                <p className="text-gray-600 text-sm">
                  Sing a scale from low to high, paying attention to where your
                  voice naturally "breaks" or changes quality.
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2">
                  Step 2: Practice Transitions
                </h4>
                <p className="text-gray-600 text-sm">
                  Work on smoothing out the transition points between registers
                  with gentle, connected scales.
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2">
                  Step 3: Develop Mixed Voice
                </h4>
                <p className="text-gray-600 text-sm">
                  Practice blending chest and head voice to create a smooth,
                  unified sound across your range.
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <div className="flex items-start">
              <VolumeX className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">
                  Important Note
                </h4>
                <p className="text-amber-700 text-sm">
                  Never force your voice into a register. If you feel strain or
                  discomfort, stop and rest. Vocal development takes time and
                  patience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
