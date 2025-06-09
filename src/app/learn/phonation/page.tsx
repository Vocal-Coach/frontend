"use client";

import Link from "next/link";
import { ArrowLeft, Mic, Waves, AlertCircle } from "lucide-react";

export default function PhonationPage() {
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
          Phonation
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto px-6 pb-6 pt-4">
        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center mb-3">
              <Mic className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">
                How Your Voice Works
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Phonation is the process of sound production in your larynx (voice
              box). Understanding how your vocal cords work helps you sing more
              efficiently and avoid vocal damage.
            </p>
          </div>

          {/* Vocal Cord Anatomy */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 p-3 rounded-xl mr-4">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600">
                  Vocal Cord Function
                </h3>
                <p className="text-gray-500 text-sm">
                  The Sound Production Process
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Your vocal cords are two small muscles in your larynx that vibrate
              to create sound. The way they come together and vibrate determines
              your pitch, volume, and tone quality.
            </p>

            <div className="bg-green-50 p-4 rounded-xl mb-4">
              <h4 className="font-semibold text-green-800 mb-2 text-sm">
                The Phonation Process:
              </h4>
              <ol className="space-y-2">
                <li className="text-green-700 text-sm flex items-start">
                  <span className="text-green-500 mr-2">1.</span>
                  Air from your lungs travels up through your trachea
                </li>
                <li className="text-green-700 text-sm flex items-start">
                  <span className="text-green-500 mr-2">2.</span>
                  Your vocal cords come together (adduction)
                </li>
                <li className="text-green-700 text-sm flex items-start">
                  <span className="text-green-500 mr-2">3.</span>
                  Air pressure builds up below the closed vocal cords
                </li>
                <li className="text-green-700 text-sm flex items-start">
                  <span className="text-green-500 mr-2">4.</span>
                  The cords are blown apart, then snap back together
                </li>
                <li className="text-green-700 text-sm flex items-start">
                  <span className="text-green-500 mr-2">5.</span>
                  This rapid vibration creates sound waves
                </li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm">
                  Pitch Control:
                </h4>
                <ul className="space-y-1">
                  <li className="text-blue-700 text-sm">
                    • Thinner cords = Higher pitch
                  </li>
                  <li className="text-blue-700 text-sm">
                    • Thicker cords = Lower pitch
                  </li>
                  <li className="text-blue-700 text-sm">
                    • Tension affects frequency
                  </li>
                  <li className="text-blue-700 text-sm">
                    • Length changes with pitch
                  </li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <h4 className="font-semibold text-purple-800 mb-2 text-sm">
                  Volume Control:
                </h4>
                <ul className="space-y-1">
                  <li className="text-purple-700 text-sm">
                    • More air pressure = Louder
                  </li>
                  <li className="text-purple-700 text-sm">
                    • Wider vibration = More volume
                  </li>
                  <li className="text-purple-700 text-sm">
                    • Breath support is key
                  </li>
                  <li className="text-purple-700 text-sm">
                    • Avoid forcing or pushing
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Vocal Cord Positions */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Vocal Cord Positions
            </h3>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                  Breathing Position
                </h4>
                <p className="text-gray-600 text-sm">
                  Vocal cords are wide apart, allowing air to flow freely. No
                  sound is produced in this position.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2 text-sm">
                  Phonation Position
                </h4>
                <p className="text-green-700 text-sm">
                  Vocal cords come together and vibrate regularly. This creates
                  clear, healthy vocal tone.
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl">
                <h4 className="font-semibold text-amber-800 mb-2 text-sm">
                  Breathy Phonation
                </h4>
                <p className="text-amber-700 text-sm">
                  Vocal cords don't close completely, allowing air to escape.
                  Creates a breathy, airy sound quality.
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-xl">
                <h4 className="font-semibold text-red-800 mb-2 text-sm">
                  Pressed Phonation
                </h4>
                <p className="text-red-700 text-sm">
                  Vocal cords press together too tightly. Can cause strain and
                  should be avoided.
                </p>
              </div>
            </div>
          </div>

          {/* Healthy Phonation Tips */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              🎯 Healthy Phonation Tips
            </h3>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-emerald-100">
                <h4 className="font-semibold text-emerald-700 mb-2">
                  Gentle Onset
                </h4>
                <p className="text-gray-600 text-sm">
                  Start your notes gently, allowing vocal cords to come together
                  smoothly rather than crashing together forcefully.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-green-100">
                <h4 className="font-semibold text-green-700 mb-2">
                  Balanced Airflow
                </h4>
                <p className="text-gray-600 text-sm">
                  Use steady, controlled breath support. Too little air creates
                  breathiness, too much creates tension.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-teal-100">
                <h4 className="font-semibold text-teal-700 mb-2">
                  Relaxed Throat
                </h4>
                <p className="text-gray-600 text-sm">
                  Keep your throat and neck muscles relaxed. Tension interferes
                  with natural vocal cord vibration.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-cyan-100">
                <h4 className="font-semibold text-cyan-700 mb-2">
                  Proper Hydration
                </h4>
                <p className="text-gray-600 text-sm">
                  Keep vocal cords moist with plenty of water. Dry cords don't
                  vibrate efficiently and are prone to injury.
                </p>
              </div>
            </div>
          </div>

          {/* Warning Signs */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">
                  Warning Signs of Vocal Strain
                </h4>
                <div className="space-y-1">
                  <p className="text-red-700 text-sm">
                    • Hoarseness or raspiness
                  </p>
                  <p className="text-red-700 text-sm">
                    • Voice fatigue or weakness
                  </p>
                  <p className="text-red-700 text-sm">
                    • Pain or discomfort while singing
                  </p>
                  <p className="text-red-700 text-sm">• Loss of vocal range</p>
                  <p className="text-red-700 text-sm">
                    • Breathiness that won't go away
                  </p>
                </div>
                <p className="text-red-600 text-xs mt-2 font-medium">
                  If you experience these symptoms, rest your voice and consult
                  a voice professional.
                </p>
              </div>
            </div>
          </div>

          {/* Practice Exercise */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              🎵 Phonation Exercise: Gentle Humming
            </h3>
            <div className="bg-white p-4 rounded-xl border border-blue-100">
              <ol className="space-y-2">
                <li className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">1.</span>
                  Close your mouth and relax your jaw
                </li>
                <li className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">2.</span>
                  Take a comfortable breath using diaphragmatic breathing
                </li>
                <li className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">3.</span>
                  Gently hum on a comfortable pitch (like "mmm")
                </li>
                <li className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">4.</span>
                  Feel the vibrations in your chest and face
                </li>
                <li className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">5.</span>
                  Keep the sound gentle and relaxed
                </li>
              </ol>
              <p className="text-indigo-600 text-xs mt-3">
                This exercise helps you feel healthy vocal cord vibration
                without strain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
