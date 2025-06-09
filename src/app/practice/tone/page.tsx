"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RotateCcw, Check } from "lucide-react";

export default function TonePracticePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [toneAccuracy, setToneAccuracy] = useState(0);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentSyllable, setCurrentSyllable] = useState<"mom" | "moh">("mom");
  const [syllableTimer, setSyllableTimer] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isSinging, setIsSinging] = useState(false);
  const [pausedAt, setPausedAt] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const syllableIntervalRef = useRef<NodeJS.Timeout>();
  const currentScoreRef = useRef<number>(0);
  const allIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const isRunningRef = useRef<boolean>(false);
  const toneAccuracyHistoryRef = useRef<number[]>([]);
  const lastScoreTimeRef = useRef<number>(0);

  // Tone pattern: 3 seconds Mom, 3 seconds Moh
  const tonePattern = {
    mom: 3000, // 3 seconds
    moh: 3000, // 3 seconds
  };

  // Smooth tone accuracy to reduce rapid changes
  const setSmoothedToneAccuracy = (newAccuracy: number) => {
    toneAccuracyHistoryRef.current.push(newAccuracy);

    // Keep only last 3 values for smoothing
    if (toneAccuracyHistoryRef.current.length > 3) {
      toneAccuracyHistoryRef.current.shift();
    }

    // Simple average
    const sum = toneAccuracyHistoryRef.current.reduce((a, b) => a + b, 0);
    const smoothedAccuracy = Math.round(
      sum / toneAccuracyHistoryRef.current.length
    );

    console.log(
      `Tone Accuracy: raw=${newAccuracy}, history=[${toneAccuracyHistoryRef.current.join(
        ", "
      )}], smoothed=${smoothedAccuracy}`
    );

    setToneAccuracy(smoothedAccuracy);
    return smoothedAccuracy;
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (syllableIntervalRef.current) {
        clearInterval(syllableIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initializeAudio = async () => {
    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;
      console.log("Microphone access granted");

      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Resume audio context if it's suspended
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.3;
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;

      microphoneRef.current.connect(analyserRef.current);

      console.log("Audio analysis setup complete");
      return true;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Microphone access is required for this exercise. Please allow microphone access and try again."
      );
      return false;
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate audio level with better sensitivity
    const sum = dataArray.reduce((a, b) => a + b, 0);
    const average = sum / bufferLength;
    const level = Math.min(100, (average / 30) * 100);

    setAudioLevel(level);

    // Detect if user is singing/making sound
    const isCurrentlySinging = level > 8;
    setIsSinging(isCurrentlySinging);

    // Debug logging
    console.log(
      `Audio Analysis: level=${level.toFixed(
        1
      )}%, syllable=${currentSyllable}, timer=${syllableTimer.toFixed(
        1
      )}s, isPlaying=${isPlaying}, isPaused=${isPaused}`
    );

    // Score based on tone pattern matching - only when exercise is running
    if (isRunningRef.current) {
      const currentTime = Date.now();
      const shouldScore =
        lastScoreTimeRef.current === 0 ||
        currentTime - lastScoreTimeRef.current > 500;

      console.log(`🔍 DETAILED SCORING CHECK:`);
      console.log(`  - isRunningRef.current: ${isRunningRef.current}`);
      console.log(`  - isPlaying: ${isPlaying}`);
      console.log(`  - isRecording: ${isRecording}`);
      console.log(`  - isPaused: ${isPaused}`);
      console.log(`  - currentTime: ${currentTime}`);
      console.log(`  - lastScoreTimeRef.current: ${lastScoreTimeRef.current}`);
      console.log(`  - timeDiff: ${currentTime - lastScoreTimeRef.current}ms`);
      console.log(`  - shouldScore: ${shouldScore}`);
      console.log(`  - currentSyllable: ${currentSyllable}`);
      console.log(`  - audioLevel: ${level.toFixed(1)}%`);

      // PROPER SCORING - Only score every 500ms
      if (shouldScore) {
        let points = 0;
        let accuracy = 0;
        let reason = "No activity detected";
        let shouldAwardPoints = false;

        console.log(
          `🎤 Audio Level: ${level.toFixed(1)}%, Syllable: ${currentSyllable}`
        );

        // Detailed scoring based on syllable and actual audio detection
        if (currentSyllable === "mom") {
          // During "Mom" syllable - user should make clear "Mom" sound
          if (level > 25) {
            // Strong sound during Mom - EXCELLENT
            points = 30;
            accuracy = Math.min(100, 70 + level);
            reason = `Excellent "Mom" sound (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else if (level > 15) {
            // Moderate sound during Mom - GOOD
            points = 20;
            accuracy = Math.min(100, 50 + level * 2);
            reason = `Good "Mom" sound (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else if (level > 8) {
            // Weak sound during Mom - OKAY
            points = 10;
            accuracy = Math.max(30, level * 3);
            reason = `Weak "Mom" sound (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else {
            // No sound during Mom - BAD
            points = 0;
            accuracy = 15;
            reason = `Silent during "Mom" - no points (${level.toFixed(1)}%)`;
            shouldAwardPoints = false;
          }
        } else if (currentSyllable === "moh") {
          // During "Moh" syllable - user should make clear "Moh" sound
          if (level > 25) {
            // Strong sound during Moh - EXCELLENT
            points = 30;
            accuracy = Math.min(100, 70 + level);
            reason = `Excellent "Moh" sound (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else if (level > 15) {
            // Moderate sound during Moh - GOOD
            points = 20;
            accuracy = Math.min(100, 50 + level * 2);
            reason = `Good "Moh" sound (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else if (level > 8) {
            // Weak sound during Moh - OKAY
            points = 10;
            accuracy = Math.max(30, level * 3);
            reason = `Weak "Moh" sound (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else {
            // No sound during Moh - BAD
            points = 0;
            accuracy = 15;
            reason = `Silent during "Moh" - no points (${level.toFixed(1)}%)`;
            shouldAwardPoints = false;
          }
        }

        console.log(
          `🎯 DETAILED SCORING - Syllable: ${currentSyllable}, Audio: ${level.toFixed(
            1
          )}%, Points: ${points}, Accuracy: ${accuracy}%, Award: ${shouldAwardPoints}, Reason: ${reason}`
        );

        // Update tone accuracy immediately
        setToneAccuracy(accuracy);
        console.log(`🎯 Set tone accuracy to: ${accuracy}%`);

        // Only update score if behavior was correct
        if (shouldAwardPoints && points > 0) {
          const oldScore = currentScoreRef.current;
          const newScore = Math.min(1000, currentScoreRef.current + points);
          setScore(newScore);
          currentScoreRef.current = newScore;
          console.log(
            `💰 SCORE AWARDED: ${oldScore} + ${points} = ${newScore}`
          );
        } else {
          console.log(`❌ NO POINTS AWARDED - Incorrect tone pattern`);
        }

        lastScoreTimeRef.current = currentTime;

        console.log(
          `📊 FINAL VALUES - Score: ${currentScoreRef.current}, Accuracy: ${accuracy}%`
        );
      } else {
        console.log(
          `⏸️ Not scoring yet - waiting for next interval (${
            500 - (currentTime - lastScoreTimeRef.current)
          }ms remaining)`
        );
      }
    } else {
      console.log(`❌ Not scoring - isRunningRef: ${isRunningRef.current}`);
    }

    // Continue animation if audio context is still active
    if (
      audioContextRef.current &&
      audioContextRef.current.state === "running"
    ) {
      animationRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  const startToneCycle = () => {
    console.log("startToneCycle called");
    console.log(
      `Starting with: syllable=${currentSyllable}, timer=${syllableTimer}, cycle=${cycleCount}`
    );

    let currentCycle = 0;
    let currentSyllableIndex = 0; // 0: mom, 1: moh
    const syllables = [
      { name: "mom", duration: 3 },
      { name: "moh", duration: 3 },
    ];
    let timeRemaining = 3; // Start with mom duration

    const timerInterval = setInterval(() => {
      // Check if paused
      if (!isRunningRef.current) {
        return;
      }

      timeRemaining -= 0.1;
      setSyllableTimer(timeRemaining);

      console.log(
        `Timer: ${timeRemaining.toFixed(1)}s, Syllable: ${
          syllables[currentSyllableIndex].name
        }, Cycle: ${currentCycle + 1}`
      );

      if (timeRemaining <= 0) {
        // Move to next syllable
        currentSyllableIndex++;

        if (currentSyllableIndex >= syllables.length) {
          // Completed one full cycle
          currentCycle++;
          setCycleCount(currentCycle);

          if (currentCycle >= 5) {
            // All cycles completed
            console.log("All 5 cycles completed!");
            clearInterval(timerInterval);

            setIsRecording(false);
            setIsPlaying(false);

            // Save final score
            const finalScoreValue = currentScoreRef.current;
            setFinalScore(finalScoreValue);
            console.log(`Exercise completed! Final score: ${finalScoreValue}`);

            // Clean up resources
            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current);
            }
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }
            if (audioContextRef.current) {
              audioContextRef.current.close();
              audioContextRef.current = null;
            }

            setTimeout(() => {
              setIsCompleted(true);
            }, 500);
            return;
          }

          // Start next cycle
          currentSyllableIndex = 0;
        }

        // Set up next syllable
        const nextSyllable = syllables[currentSyllableIndex];
        setCurrentSyllable(nextSyllable.name as "mom" | "moh");
        timeRemaining = nextSyllable.duration;
        setSyllableTimer(timeRemaining);

        console.log(
          `Starting ${nextSyllable.name} syllable, duration: ${nextSyllable.duration}s`
        );
      }
    }, 100);

    // Store interval for cleanup
    allIntervalsRef.current.push(timerInterval);
  };

  const startToneCycleFromPause = () => {
    console.log("startToneCycleFromPause called");
    console.log(
      `Resuming from: syllable=${currentSyllable}, timer=${syllableTimer}, cycle=${cycleCount}`
    );

    // Get current state
    let currentCycle = cycleCount;
    const syllables = [
      { name: "mom", duration: 3 },
      { name: "moh", duration: 3 },
    ];

    // Find current syllable index
    let currentSyllableIndex = syllables.findIndex(
      (s) => s.name === currentSyllable
    );
    if (currentSyllableIndex === -1) currentSyllableIndex = 0;

    // Use remaining time from pause
    let timeRemaining = syllableTimer;

    const timerInterval = setInterval(() => {
      // Check if paused
      if (!isRunningRef.current) {
        return;
      }

      timeRemaining -= 0.1;
      setSyllableTimer(timeRemaining);

      console.log(
        `Resume Timer: ${timeRemaining.toFixed(1)}s, Syllable: ${
          syllables[currentSyllableIndex].name
        }, Cycle: ${currentCycle + 1}`
      );

      if (timeRemaining <= 0) {
        // Move to next syllable
        currentSyllableIndex++;

        if (currentSyllableIndex >= syllables.length) {
          // Completed one full cycle
          currentCycle++;
          setCycleCount(currentCycle);

          if (currentCycle >= 5) {
            // All cycles completed
            console.log("All 5 cycles completed!");
            clearInterval(timerInterval);

            setIsRecording(false);
            setIsPlaying(false);

            // Save final score
            const finalScoreValue = currentScoreRef.current;
            setFinalScore(finalScoreValue);
            console.log(`Exercise completed! Final score: ${finalScoreValue}`);

            // Clean up resources
            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current);
            }
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }
            if (audioContextRef.current) {
              audioContextRef.current.close();
              audioContextRef.current = null;
            }

            setTimeout(() => {
              setIsCompleted(true);
            }, 500);
            return;
          }

          // Start next cycle
          currentSyllableIndex = 0;
        }

        // Set up next syllable
        const nextSyllable = syllables[currentSyllableIndex];
        setCurrentSyllable(nextSyllable.name as "mom" | "moh");
        timeRemaining = nextSyllable.duration;
        setSyllableTimer(timeRemaining);

        console.log(
          `Starting ${nextSyllable.name} syllable, duration: ${nextSyllable.duration}s`
        );
      }
    }, 100);

    // Store interval for cleanup
    allIntervalsRef.current.push(timerInterval);
  };

  const handleStart = async () => {
    if (!isPlaying) {
      // Starting fresh exercise
      console.log("Starting exercise...");
      const audioInitialized = await initializeAudio();
      if (audioInitialized) {
        console.log("Audio initialized, setting states...");

        // Set all states first
        setIsPlaying(true);
        setIsRecording(true);
        setIsPaused(false);
        setIsCompleted(false);
        setScore(0);
        currentScoreRef.current = 0;
        setFinalScore(0);
        setToneAccuracy(0);
        setCurrentSyllable("mom");
        setCycleCount(0);
        setSyllableTimer(3); // Start with 3 seconds for mom syllable
        lastScoreTimeRef.current = 0;
        setPausedAt(0);
        setRemainingTime(0);
        isRunningRef.current = true;
        toneAccuracyHistoryRef.current = [];

        console.log("States set, starting audio analysis and tone cycle...");

        // Start audio analysis immediately without delay
        console.log("🚀 Starting audio analysis immediately...");
        analyzeAudio();
        startToneCycle();
      }
    } else if (isPaused) {
      // Resume exercise
      console.log("Resuming exercise...");
      setIsPaused(false);
      setIsRecording(true);
      isRunningRef.current = true;
      analyzeAudio();

      // Restart the timer interval from where it was paused
      console.log("Restarting timer interval from pause...");
      startToneCycleFromPause();
    } else {
      // Pause exercise
      console.log("Pausing exercise...");
      setIsPaused(true);
      setIsRecording(false);
      isRunningRef.current = false;
      setPausedAt(Date.now());
      setRemainingTime(syllableTimer);

      // Pause audio analysis but keep audio context alive
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Clear all running intervals
      allIntervalsRef.current.forEach(clearInterval);
      allIntervalsRef.current = [];
    }
  };

  const handleDone = () => {
    setIsCompleted(true);
    setIsPlaying(false);
    setIsRecording(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (syllableIntervalRef.current) {
      clearInterval(syllableIntervalRef.current);
    }
  };

  const getSyllableInstruction = () => {
    switch (currentSyllable) {
      case "mom":
        return 'Sing "Mom" with resonant tone...';
      case "moh":
        return 'Sing "Moh" with forward placement...';
      default:
        return "Get ready...";
    }
  };

  const getSyllableColor = () => {
    switch (currentSyllable) {
      case "mom":
        return "from-blue-400 to-cyan-400";
      case "moh":
        return "from-purple-400 to-pink-400";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-white border-b border-gray-200">
        <Link href="/practice">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="text-gray-700 h-6 w-6" />
          </button>
        </Link>

        <div className="text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wide">TONE</p>
          <h1 className="text-xl font-bold text-gray-800">Mom Moh</h1>
        </div>

        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto px-6 py-6 pb-8">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Goal & Instructions */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              GOAL
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Achieve a resonant, forward-placed tone.
            </p>

            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              INSTRUCTIONS
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Widen your nasal cavities and envision the sound projecting into
              the nose and forehead.
            </p>
          </div>

          {/* Tone Visualization */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <div className="text-center">
              {/* Exercise Status */}
              {isPlaying && (
                <div
                  className={`mb-4 p-3 rounded-xl border ${
                    isPaused
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isPaused
                          ? "bg-yellow-500"
                          : "bg-green-500 animate-pulse"
                      }`}
                    ></div>
                    <span
                      className={`font-semibold ${
                        isPaused ? "text-yellow-700" : "text-green-700"
                      }`}
                    >
                      {isPaused ? "Exercise Paused" : "Exercise Running"}
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      isPaused ? "text-yellow-600" : "text-green-600"
                    }`}
                  >
                    {isPaused
                      ? "Press Resume to continue"
                      : `Cycle ${cycleCount + 1} of 5 • ${Math.ceil(
                          syllableTimer
                        )}s remaining`}
                  </p>
                </div>
              )}

              {/* Debug Info */}
              <div className="mb-4 p-2 bg-gray-100 rounded-lg text-xs">
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <div>Syllable: {currentSyllable}</div>
                  <div>Timer: {syllableTimer.toFixed(1)}s</div>
                </div>
              </div>

              {/* Current Syllable */}
              <div className="mb-4">
                {/* Syllable Display with Multiple Notes */}
                <div className="relative h-32 bg-gray-50 rounded-xl p-4 mb-4">
                  {/* Staff Lines */}
                  <div className="absolute inset-4">
                    {[1, 2, 3, 4, 5].map((line) => (
                      <div
                        key={line}
                        className="absolute left-0 right-0 h-px bg-gray-300"
                        style={{ top: `${(line - 1) * 25}%` }}
                      />
                    ))}
                  </div>

                  {/* Notes */}
                  <div className="relative h-full flex items-center justify-center">
                    {/* Mom Note (Lower) */}
                    <div className="absolute left-1/4 flex flex-col items-center">
                      <div
                        className={`w-12 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                          currentSyllable === "mom" && isPlaying
                            ? "bg-blue-500 border-blue-600 text-white scale-110 shadow-lg"
                            : "bg-white border-blue-400 text-blue-600"
                        }`}
                        style={{ top: "60%" }}
                      >
                        Mom
                      </div>
                      {currentSyllable === "mom" && isPlaying && (
                        <div className="mt-2 text-xs text-blue-600 font-medium animate-pulse">
                          {Math.ceil(syllableTimer)}s
                        </div>
                      )}
                    </div>

                    {/* Moh Note (Higher) */}
                    <div className="absolute right-1/4 flex flex-col items-center">
                      <div
                        className={`w-12 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                          currentSyllable === "moh" && isPlaying
                            ? "bg-purple-500 border-purple-600 text-white scale-110 shadow-lg"
                            : "bg-white border-purple-400 text-purple-600"
                        }`}
                        style={{ top: "20%" }}
                      >
                        Moh
                      </div>
                      {currentSyllable === "moh" && isPlaying && (
                        <div className="mt-2 text-xs text-purple-600 font-medium animate-pulse">
                          {Math.ceil(syllableTimer)}s
                        </div>
                      )}
                    </div>

                    {/* Connection Line */}
                    {isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          width="60%"
                          height="100%"
                          className="absolute"
                          style={{ left: "20%" }}
                        >
                          <path
                            d="M 20 75 Q 50 45 80 35"
                            stroke={
                              currentSyllable === "mom" ? "#3b82f6" : "#8b5cf6"
                            }
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="4,4"
                            className="opacity-60"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 text-center">
                  {isPlaying
                    ? getSyllableInstruction()
                    : "Press Start to begin tone exercise"}
                </p>
              </div>

              {/* Cycle Progress */}
              <div className="mb-4">
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((cycle) => (
                    <div
                      key={cycle}
                      className={`w-3 h-3 rounded-full ${
                        cycle <= cycleCount
                          ? "bg-green-500"
                          : cycle === cycleCount + 1 && isPlaying
                          ? "bg-blue-500 animate-pulse"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {isPlaying
                    ? `Cycle ${cycleCount + 1} of 5`
                    : "Ready for 5 cycles"}
                </p>
              </div>

              {/* Tone Accuracy */}
              <div className="text-center">
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  TONE ACCURACY
                </span>
                <div className="text-3xl font-bold text-gray-800">
                  {Math.round(toneAccuracy)}%
                </div>
                {toneAccuracy > 80 && (
                  <p className="text-sm text-green-600 mt-1">Excellent tone!</p>
                )}
                {toneAccuracy > 60 && toneAccuracy <= 80 && (
                  <p className="text-sm text-blue-600 mt-1">Good tone!</p>
                )}
                {!isPlaying && toneAccuracy === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Start to see your accuracy
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Start/Pause Button */}
          <button
            onClick={handleStart}
            className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200 ${
              !isPlaying
                ? "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 shadow-lg"
                : isPaused
                ? "bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 shadow-lg"
                : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
            }`}
          >
            {!isPlaying ? (
              <div className="flex items-center justify-center gap-2">
                <Play className="h-5 w-5" />
                <span>Start Exercise</span>
              </div>
            ) : isPaused ? (
              <div className="flex items-center justify-center gap-2">
                <Play className="h-5 w-5" />
                <span>Resume</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </div>
            )}
          </button>

          {/* Done Button */}
          <button
            onClick={handleDone}
            className="py-4 px-8 ml-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-semibold transition-colors"
          >
            Done
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center mt-4 gap-2">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className={`w-2 h-2 rounded-full ${
                dot === 1 ? "bg-gray-800" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Exercise Complete!
            </h2>
            <p className="text-gray-600 mb-4">
              You completed all 5 tone cycles.
            </p>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Final Score</p>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {finalScore}
              </p>
            </div>

            {/* Performance Message */}
            <p className="text-sm text-gray-600">
              {finalScore >= 9000
                ? "Excellent tone control!"
                : finalScore >= 6000
                ? "Good tone technique!"
                : finalScore >= 3000
                ? "Keep practicing!"
                : "Try to maintain consistent tone throughout"}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setScore(0);
                  currentScoreRef.current = 0;
                  setFinalScore(0);
                  setToneAccuracy(0);
                  setCycleCount(0);
                  setCurrentSyllable("mom");
                  setSyllableTimer(0);
                  lastScoreTimeRef.current = 0;
                  setPausedAt(0);
                  setRemainingTime(0);
                  setIsPaused(false);
                  toneAccuracyHistoryRef.current = [];
                }}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
              >
                Try Again
              </button>
              <Link href="/practice" className="block">
                <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors">
                  Back to Practice
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
