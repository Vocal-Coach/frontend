"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RotateCcw, Check } from "lucide-react";

export default function BreathingPracticePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [breathAccuracy, setBreathAccuracy] = useState(0);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<
    "inhale" | "exhale" | "hold"
  >("inhale");
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [pausedAt, setPausedAt] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const phaseIntervalRef = useRef<NodeJS.Timeout>();
  const currentScoreRef = useRef<number>(0);
  const allIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const isRunningRef = useRef<boolean>(false);
  const breathAccuracyHistoryRef = useRef<number[]>([]);
  const lastScoreTimeRef = useRef<number>(0);

  // Breathing pattern: 4 seconds inhale, 2 seconds hold, 6 seconds exhale
  const breathingPattern = {
    inhale: 4000, // 4 seconds
    hold: 2000, // 2 seconds
    exhale: 6000, // 6 seconds
  };

  // Smooth breath accuracy to reduce rapid changes
  const setSmoothedBreathAccuracy = (newAccuracy: number) => {
    breathAccuracyHistoryRef.current.push(newAccuracy);

    // Keep only last 3 values for smoothing (reduced from 5)
    if (breathAccuracyHistoryRef.current.length > 3) {
      breathAccuracyHistoryRef.current.shift();
    }

    // Simple average instead of weighted average
    const sum = breathAccuracyHistoryRef.current.reduce((a, b) => a + b, 0);
    const smoothedAccuracy = Math.round(
      sum / breathAccuracyHistoryRef.current.length
    );

    console.log(
      `Breath Accuracy: raw=${newAccuracy}, history=[${breathAccuracyHistoryRef.current.join(
        ", "
      )}], smoothed=${smoothedAccuracy}`
    );

    setBreathAccuracy(smoothedAccuracy);
    return smoothedAccuracy;
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (phaseIntervalRef.current) {
        clearInterval(phaseIntervalRef.current);
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

      analyserRef.current.fftSize = 512; // Increased for better resolution
      analyserRef.current.smoothingTimeConstant = 0.3; // Less smoothing for more responsive detection
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
    const level = Math.min(100, (average / 30) * 100); // More sensitive (changed from 50 to 30)

    setAudioLevel(level);

    // Detect if user is breathing/making sound (lowered threshold)
    const isCurrentlyBreathing = level > 8; // Lowered from 15 to 8
    setIsBreathing(isCurrentlyBreathing);

    // Debug logging to see if audio is being detected
    console.log(
      `Audio Analysis: level=${level.toFixed(
        1
      )}%, phase=${currentPhase}, timer=${phaseTimer.toFixed(
        1
      )}s, isPlaying=${isPlaying}, isPaused=${isPaused}`
    );

    // Score based on breathing pattern matching - only when exercise is running
    if (isRunningRef.current) {
      const currentTime = Date.now();
      const shouldScore =
        lastScoreTimeRef.current === 0 ||
        currentTime - lastScoreTimeRef.current > 500; // Score every 500ms (reduced frequency)

      console.log(`🔍 DETAILED SCORING CHECK:`);
      console.log(`  - isRunningRef.current: ${isRunningRef.current}`);
      console.log(`  - isPlaying: ${isPlaying}`);
      console.log(`  - isRecording: ${isRecording}`);
      console.log(`  - isPaused: ${isPaused}`);
      console.log(`  - currentTime: ${currentTime}`);
      console.log(`  - lastScoreTimeRef.current: ${lastScoreTimeRef.current}`);
      console.log(`  - timeDiff: ${currentTime - lastScoreTimeRef.current}ms`);
      console.log(`  - shouldScore: ${shouldScore}`);
      console.log(`  - currentPhase: ${currentPhase}`);
      console.log(`  - audioLevel: ${level.toFixed(1)}%`);

      // PROPER SCORING - Only score every 500ms
      if (shouldScore) {
        // Use the proper timing condition
        let points = 0; // Start with 0 points
        let accuracy = 0; // Start with 0 accuracy
        let reason = "No activity detected";
        let shouldAwardPoints = false; // Only award points for correct behavior

        console.log(
          `🎤 Audio Level: ${level.toFixed(1)}%, Phase: ${currentPhase}`
        );

        // Detailed scoring based on phase and actual audio detection
        if (currentPhase === "exhale") {
          // During exhale phase - user should make "Hoo" sound
          if (level > 20) {
            // Strong sound during exhale - EXCELLENT
            points = 25;
            accuracy = Math.min(100, 60 + level);
            reason = `Excellent "Hoo" sound (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else if (level > 10) {
            // Moderate sound during exhale - GOOD
            points = 15;
            accuracy = Math.min(100, 40 + level * 2);
            reason = `Good exhale sound (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else if (level > 5) {
            // Weak sound during exhale - OKAY
            points = 8;
            accuracy = Math.max(20, level * 4);
            reason = `Weak exhale sound (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else {
            // No sound during exhale - BAD (NO POINTS)
            points = 0;
            accuracy = 10;
            reason = `Silent during exhale - no points (${level.toFixed(1)}%)`;
            shouldAwardPoints = false;
          }
        } else if (currentPhase === "inhale") {
          // During inhale phase - user should be quiet
          if (level < 5) {
            // Very quiet during inhale - EXCELLENT
            points = 20;
            accuracy = Math.min(100, 90 - level * 2);
            reason = `Excellent quiet inhale (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else if (level < 10) {
            // Quiet during inhale - GOOD
            points = 12;
            accuracy = Math.max(60, 80 - level * 3);
            reason = `Good quiet inhale (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else if (level < 15) {
            // Slightly noisy during inhale - OKAY
            points = 6;
            accuracy = Math.max(30, 60 - level * 2);
            reason = `Slightly noisy inhale (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else {
            // Too noisy during inhale - BAD (NO POINTS)
            points = 0;
            accuracy = Math.max(10, 40 - level);
            reason = `Too noisy during inhale - no points (${level.toFixed(
              1
            )}%)`;
            shouldAwardPoints = false;
          }
        } else if (currentPhase === "hold") {
          // During hold phase - user should be completely silent
          if (level < 3) {
            // Perfect silence during hold - EXCELLENT
            points = 30;
            accuracy = Math.min(100, 95 - level);
            reason = `Perfect breath hold (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else if (level < 8) {
            // Mostly quiet during hold - GOOD
            points = 18;
            accuracy = Math.max(70, 85 - level * 2);
            reason = `Good breath hold (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else if (level < 12) {
            // Some noise during hold - OKAY
            points = 8;
            accuracy = Math.max(40, 70 - level * 3);
            reason = `Okay breath hold (${level.toFixed(1)}%)`;
            shouldAwardPoints = true;
          } else {
            // Too much noise during hold - BAD (NO POINTS)
            points = 0;
            accuracy = Math.max(15, 50 - level * 2);
            reason = `Poor breath hold - no points (${level.toFixed(1)}%)`;
            shouldAwardPoints = false;
          }
        }

        console.log(
          `🎯 DETAILED SCORING - Phase: ${currentPhase}, Audio: ${level.toFixed(
            1
          )}%, Points: ${points}, Accuracy: ${accuracy}%, Award: ${shouldAwardPoints}, Reason: ${reason}`
        );

        // Update breath accuracy immediately (always update for feedback)
        setBreathAccuracy(accuracy);
        console.log(`🎯 Set breath accuracy to: ${accuracy}%`);

        // Only update score if behavior was correct
        if (shouldAwardPoints && points > 0) {
          const oldScore = currentScoreRef.current;
          const newScore = Math.min(10000, currentScoreRef.current + points);
          setScore(newScore);
          currentScoreRef.current = newScore;
          console.log(
            `💰 SCORE AWARDED: ${oldScore} + ${points} = ${newScore}`
          );
        } else {
          console.log(`❌ NO POINTS AWARDED - Incorrect breathing pattern`);
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

  const startBreathingCycle = () => {
    console.log("startBreathingCycle called");
    // Don't reset phase and timer here - they're already set in handleStart
    console.log(
      `Starting with: phase=${currentPhase}, timer=${phaseTimer}, cycle=${cycleCount}`
    );

    let currentCycle = 0;
    let currentPhaseIndex = 0; // 0: inhale, 1: hold, 2: exhale
    const phases = [
      { name: "inhale", duration: 4 },
      { name: "hold", duration: 2 },
      { name: "exhale", duration: 6 },
    ];
    let timeRemaining = 4; // Start with inhale duration

    const timerInterval = setInterval(() => {
      // Check if paused
      if (!isRunningRef.current) {
        return; // Don't update timer when paused
      }

      timeRemaining -= 0.1;
      setPhaseTimer(timeRemaining);

      console.log(
        `Timer: ${timeRemaining.toFixed(1)}s, Phase: ${
          phases[currentPhaseIndex].name
        }, Cycle: ${currentCycle + 1}`
      );

      if (timeRemaining <= 0) {
        // Move to next phase
        currentPhaseIndex++;

        if (currentPhaseIndex >= phases.length) {
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
          currentPhaseIndex = 0;
        }

        // Set up next phase
        const nextPhase = phases[currentPhaseIndex];
        setCurrentPhase(nextPhase.name as "inhale" | "hold" | "exhale");
        timeRemaining = nextPhase.duration;
        setPhaseTimer(timeRemaining);

        console.log(
          `Starting ${nextPhase.name} phase, duration: ${nextPhase.duration}s`
        );
      }
    }, 100); // Update every 100ms

    // Store interval for cleanup
    allIntervalsRef.current.push(timerInterval);
  };

  const startBreathingCycleFromPause = () => {
    console.log("startBreathingCycleFromPause called");
    console.log(
      `Resuming from: phase=${currentPhase}, timer=${phaseTimer}, cycle=${cycleCount}`
    );

    // Get current state
    let currentCycle = cycleCount;
    const phases = [
      { name: "inhale", duration: 4 },
      { name: "hold", duration: 2 },
      { name: "exhale", duration: 6 },
    ];

    // Find current phase index
    let currentPhaseIndex = phases.findIndex((p) => p.name === currentPhase);
    if (currentPhaseIndex === -1) currentPhaseIndex = 0;

    // Use remaining time from pause
    let timeRemaining = phaseTimer;

    const timerInterval = setInterval(() => {
      // Check if paused
      if (!isRunningRef.current) {
        return; // Don't update timer when paused
      }

      timeRemaining -= 0.1;
      setPhaseTimer(timeRemaining);

      console.log(
        `Resume Timer: ${timeRemaining.toFixed(1)}s, Phase: ${
          phases[currentPhaseIndex].name
        }, Cycle: ${currentCycle + 1}`
      );

      if (timeRemaining <= 0) {
        // Move to next phase
        currentPhaseIndex++;

        if (currentPhaseIndex >= phases.length) {
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
          currentPhaseIndex = 0;
        }

        // Set up next phase
        const nextPhase = phases[currentPhaseIndex];
        setCurrentPhase(nextPhase.name as "inhale" | "hold" | "exhale");
        timeRemaining = nextPhase.duration;
        setPhaseTimer(timeRemaining);

        console.log(
          `Starting ${nextPhase.name} phase, duration: ${nextPhase.duration}s`
        );
      }
    }, 100); // Update every 100ms

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
        currentScoreRef.current = 0; // Reset score ref
        setFinalScore(0);
        setBreathAccuracy(0);
        setCurrentPhase("inhale");
        setCycleCount(0);
        setPhaseTimer(4); // Start with 4 seconds for inhale phase
        lastScoreTimeRef.current = 0;
        setPausedAt(0);
        setRemainingTime(0);
        isRunningRef.current = true;
        breathAccuracyHistoryRef.current = []; // Reset breath accuracy history

        console.log(
          "States set, starting audio analysis and breathing cycle..."
        );

        // Start audio analysis immediately without delay
        console.log("🚀 Starting audio analysis immediately...");
        analyzeAudio();
        startBreathingCycle();
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
      startBreathingCycleFromPause();
    } else {
      // Pause exercise
      console.log("Pausing exercise...");
      setIsPaused(true);
      setIsRecording(false);
      isRunningRef.current = false;
      setPausedAt(Date.now());
      setRemainingTime(phaseTimer);

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
    if (phaseIntervalRef.current) {
      clearInterval(phaseIntervalRef.current);
    }
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case "inhale":
        return "Breathe in slowly...";
      case "hold":
        return "Hold your breath...";
      case "exhale":
        return 'Breathe out with "Hoo" sound...';
      default:
        return "Get ready...";
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case "inhale":
        return "from-blue-400 to-cyan-400";
      case "hold":
        return "from-yellow-400 to-orange-400";
      case "exhale":
        return "from-purple-400 to-pink-400";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-white border-b border-gray-200">
        <Link href="/practice">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="text-gray-700 h-6 w-6" />
          </button>
        </Link>

        <div className="text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            BREATHING
          </p>
          <h1 className="text-xl font-bold text-gray-800">Deep Hoo</h1>
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
              Practice deep breathing with "Hoo" sound to develop breath control
              and support.
            </p>

            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              INSTRUCTIONS
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Follow the breathing pattern: Inhale (4s) → Hold (2s) → Exhale
              with "Hoo" (6s)
            </p>
          </div>

          {/* Breathing Visualization */}
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
                          phaseTimer
                        )}s remaining`}
                  </p>
                </div>
              )}

              {/* Debug Info */}
              <div className="mb-4 p-2 bg-gray-100 rounded-lg text-xs">
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <div>Phase: {currentPhase}</div>
                  <div>Timer: {phaseTimer.toFixed(1)}s</div>
                </div>
              </div>

              {/* Current Phase */}
              <div className="mb-4">
                <div
                  className={`text-2xl font-bold mb-2 ${
                    currentPhase === "inhale"
                      ? "text-blue-600"
                      : currentPhase === "hold"
                      ? "text-yellow-600"
                      : currentPhase === "exhale"
                      ? "text-purple-600"
                      : "text-gray-600"
                  }`}
                >
                  {isPlaying
                    ? currentPhase === "exhale"
                      ? "Hoo"
                      : currentPhase.toUpperCase()
                    : "Ready to Start"}
                </div>
                <p className="text-sm text-gray-600">
                  {isPlaying
                    ? getPhaseInstruction()
                    : "Press Start to begin breathing exercise"}
                </p>
              </div>

              {/* Microphone Level Visualization */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-6 mb-2 relative">
                  <div
                    className={`bg-gradient-to-r ${getPhaseColor()} h-6 rounded-full transition-all duration-200 flex items-center justify-center`}
                    style={{ width: `${Math.max(5, audioLevel)}%` }}
                  >
                    {audioLevel > 20 && (
                      <span className="text-white text-xs font-semibold">
                        {Math.round(audioLevel)}%
                      </span>
                    )}
                  </div>
                  {/* Minimum visual indicator */}
                  {audioLevel < 5 && isPlaying && (
                    <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {isPlaying
                      ? isBreathing
                        ? "🎤 Voice detected"
                        : "🔇 Silent"
                      : "🎤 Microphone ready"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Level: {Math.round(audioLevel)}%
                  </p>
                </div>
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

              {/* Breath Accuracy */}
              <div className="text-center">
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  BREATH ACCURACY
                </span>
                <div className="text-3xl font-bold text-gray-800">
                  {Math.round(breathAccuracy)}%
                </div>
                {breathAccuracy > 80 && (
                  <p className="text-sm text-green-600 mt-1">
                    Excellent breathing!
                  </p>
                )}
                {breathAccuracy > 60 && breathAccuracy <= 80 && (
                  <p className="text-sm text-blue-600 mt-1">Good breathing!</p>
                )}
                {!isPlaying && breathAccuracy === 0 && (
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
              You completed all 5 breathing cycles.
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
                ? "Excellent breathing control!"
                : finalScore >= 6000
                ? "Good breathing technique!"
                : finalScore >= 3000
                ? "Keep practicing!"
                : "Try to follow the breathing pattern more closely"}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setScore(0);
                  currentScoreRef.current = 0; // Reset score ref
                  setFinalScore(0);
                  setBreathAccuracy(0);
                  setCycleCount(0);
                  setCurrentPhase("inhale");
                  setPhaseTimer(0);
                  lastScoreTimeRef.current = 0;
                  setPausedAt(0);
                  setRemainingTime(0);
                  setIsPaused(false);
                  breathAccuracyHistoryRef.current = []; // Reset breath accuracy history
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
