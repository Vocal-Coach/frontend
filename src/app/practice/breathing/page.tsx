"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RotateCcw, Check } from "lucide-react";

export default function BreathingPracticePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
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
  const [lastScoreTime, setLastScoreTime] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const phaseIntervalRef = useRef<NodeJS.Timeout>();
  const currentScoreRef = useRef<number>(0);

  // Breathing pattern: 4 seconds inhale, 2 seconds hold, 6 seconds exhale
  const breathingPattern = {
    inhale: 4000, // 4 seconds
    hold: 2000, // 2 seconds
    exhale: 6000, // 6 seconds
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
    if (level > 5) {
      console.log(
        `Audio detected: ${level.toFixed(
          1
        )}%, Phase: ${currentPhase}, Breathing: ${isCurrentlyBreathing}, Timer: ${phaseTimer.toFixed(
          1
        )}s`
      );
    }

    // Score based on breathing pattern matching - only when exercise is running
    if (isPlaying && phaseTimer > 0) {
      const currentTime = Date.now();
      const shouldScore = currentTime - lastScoreTime > 300; // Score every 300ms (more frequent)

      console.log(
        `Scoring - Phase: ${currentPhase}, Level: ${level.toFixed(
          1
        )}, Breathing: ${isCurrentlyBreathing}, Timer: ${phaseTimer.toFixed(
          1
        )}, ShouldScore: ${shouldScore}`
      );

      // Give basic participation points every scoring interval
      if (shouldScore) {
        let points = 0;
        let reason = "";

        if (currentPhase === "exhale") {
          if (isCurrentlyBreathing && level > 8) {
            // User is making "Hoo" sound during exhale phase - GOOD!
            points = level > 15 ? 25 : 15;
            reason = `Exhale with sound (level: ${level.toFixed(1)})`;
            setBreathAccuracy(Math.min(100, level * 1.5));
          } else if (isCurrentlyBreathing && level > 5) {
            // User is making some sound, give partial points
            points = 8;
            reason = `Exhale with weak sound (level: ${level.toFixed(1)})`;
            setBreathAccuracy(50);
          } else {
            // User should be making sound but isn't - still give minimal points for trying
            points = 3;
            reason = "Exhale phase participation";
            setBreathAccuracy(20);
          }
        } else if (currentPhase === "inhale") {
          if (!isCurrentlyBreathing && level < 15) {
            // User is quiet during inhale - GOOD!
            points = 12;
            reason = "Inhale quietly";
            setBreathAccuracy(85);
          } else {
            // Give points for participation even if not perfect
            points = 5;
            reason = "Inhale phase participation";
            setBreathAccuracy(40);
          }
        } else if (currentPhase === "hold") {
          if (!isCurrentlyBreathing && level < 15) {
            // User is quiet during hold - GOOD!
            points = 15;
            reason = "Hold quietly";
            setBreathAccuracy(90);
          } else {
            // Give points for participation even if not perfect
            points = 7;
            reason = "Hold phase participation";
            setBreathAccuracy(50);
          }
        }

        // Always award some points to ensure progression
        if (points > 0) {
          setScore((prev) => {
            const newScore = Math.min(10000, prev + points);
            currentScoreRef.current = newScore;
            console.log(
              `SCORE UPDATE - ${reason}: ${prev} + ${points} = ${newScore}`
            );
            return newScore;
          });
          setLastScoreTime(currentTime);
        } else {
          // Fallback: give minimal points just for participating
          setScore((prev) => {
            const newScore = Math.min(10000, prev + 2);
            currentScoreRef.current = newScore;
            console.log(
              `FALLBACK SCORE - Basic participation: ${prev} + 2 = ${newScore}`
            );
            return newScore;
          });
          setLastScoreTime(currentTime);
        }
      }
    } else if (!isPlaying) {
      setBreathAccuracy(0);
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
    setCurrentPhase("inhale");
    setPhaseTimer(4); // Set initial timer
    setCycleCount(0);
    console.log("Initial states set: phase=inhale, timer=4, cycle=0");

    const runCycle = (currentCycle: number) => {
      console.log(
        `Starting cycle ${currentCycle + 1}, isRecording:`,
        isRecording
      );

      if (currentCycle >= 5) {
        console.log(
          "All 5 cycles completed - stopping exercise and showing results"
        );
        setIsRecording(false);
        setIsPlaying(false);

        // Save final score before cleanup using ref for accurate value
        const finalScoreValue = currentScoreRef.current;
        setFinalScore(finalScoreValue);
        console.log(`Exercise completed! Final score: ${finalScoreValue}`);

        // Clean up audio resources
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

        // Show completion modal after a short delay
        setTimeout(() => {
          setIsCompleted(true);
        }, 500);
        return;
      }

      // Inhale phase
      console.log("Starting INHALE phase");
      setCurrentPhase("inhale");
      let startTime = Date.now();
      setPhaseTimer(breathingPattern.inhale / 1000);

      const inhaleInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(
          0,
          (breathingPattern.inhale - elapsed) / 1000
        );
        setPhaseTimer(remaining);
        if (remaining <= 0) {
          clearInterval(inhaleInterval);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(inhaleInterval);
        console.log("Inhale phase completed, checking if still recording...");

        // Hold phase
        console.log("Starting HOLD phase");
        setCurrentPhase("hold");
        startTime = Date.now();
        setPhaseTimer(breathingPattern.hold / 1000);

        const holdInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(
            0,
            (breathingPattern.hold - elapsed) / 1000
          );
          setPhaseTimer(remaining);
          if (remaining <= 0) {
            clearInterval(holdInterval);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(holdInterval);
          console.log("Hold phase completed, checking if still recording...");

          // Exhale phase
          console.log("Starting EXHALE phase");
          setCurrentPhase("exhale");
          startTime = Date.now();
          setPhaseTimer(breathingPattern.exhale / 1000);

          const exhaleInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(
              0,
              (breathingPattern.exhale - elapsed) / 1000
            );
            setPhaseTimer(remaining);
            if (remaining <= 0) {
              clearInterval(exhaleInterval);
            }
          }, 100);

          setTimeout(() => {
            clearInterval(exhaleInterval);
            console.log("Exhale phase completed");

            const nextCycle = currentCycle + 1;
            setCycleCount(nextCycle);
            console.log(
              `Completed cycle ${currentCycle + 1}, starting cycle ${
                nextCycle + 1
              }`
            );

            if (nextCycle < 5) {
              runCycle(nextCycle);
            } else {
              console.log(
                "All 5 cycles completed - stopping exercise and showing results"
              );
              setIsRecording(false);
              setIsPlaying(false);

              // Save final score before cleanup using ref for accurate value
              const finalScoreValue = currentScoreRef.current;
              setFinalScore(finalScoreValue);
              console.log(
                `Exercise completed! Final score: ${finalScoreValue}`
              );

              // Clean up audio resources
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

              // Show completion modal after a short delay
              setTimeout(() => {
                setIsCompleted(true);
              }, 500);
            }
          }, breathingPattern.exhale);
        }, breathingPattern.hold);
      }, breathingPattern.inhale);
    };

    // Start immediately
    setTimeout(() => {
      console.log("About to start first cycle");
      runCycle(0);
    }, 100); // Small delay to ensure state is set
  };

  const handleStart = async () => {
    if (!isPlaying) {
      console.log("Starting exercise...");
      const audioInitialized = await initializeAudio();
      if (audioInitialized) {
        console.log("Audio initialized, setting states...");
        setIsPlaying(true);
        setIsRecording(true);
        setIsCompleted(false);
        setScore(0);
        currentScoreRef.current = 0; // Reset score ref
        setFinalScore(0);
        setBreathAccuracy(0);
        setCurrentPhase("inhale");
        setCycleCount(0);
        setPhaseTimer(0);
        setLastScoreTime(0);

        console.log(
          "States set, starting audio analysis and breathing cycle..."
        );
        analyzeAudio();

        // Use setTimeout to ensure states are properly set before starting cycle
        setTimeout(() => {
          // Give starting bonus
          setScore(50); // Start with 50 points
          currentScoreRef.current = 50;
          console.log(
            "STARTING BONUS: 50 points awarded for beginning exercise"
          );

          startBreathingCycle();
        }, 200);
      }
    } else {
      console.log("Stopping exercise...");
      // Stop the exercise
      setIsPlaying(false);
      setIsRecording(false);
      setCurrentPhase("inhale");
      setCycleCount(0);
      setPhaseTimer(0);
      setAudioLevel(0);

      // Clean up audio resources
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (phaseIntervalRef.current) {
        clearInterval(phaseIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
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
    <div className="min-h-screen flex flex-col bg-gray-50">
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

        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3].map((star) => (
              <div
                key={star}
                className={`w-6 h-6 rounded-full border-2 ${
                  score >= star * 3000
                    ? "bg-yellow-400 border-yellow-400"
                    : "bg-gray-200 border-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-2xl font-bold text-gray-800">{score}</span>
        </div>
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
                <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-semibold">
                      Exercise Running
                    </span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Cycle {cycleCount + 1} of 5 • {Math.ceil(phaseTimer)}s
                    remaining
                  </p>
                </div>
              )}

              {/* Current Score Display */}
              <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Current Score</p>
                  <p className="text-4xl font-bold text-green-600">{score}</p>
                  <p className="text-xs text-gray-500">Target: 10,000</p>
                </div>
              </div>

              {/* Debug Info */}
              <div className="mb-4 p-2 bg-gray-100 rounded-lg text-xs">
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <div>Playing: {isPlaying ? "Yes" : "No"}</div>
                  <div>Recording: {isRecording ? "Yes" : "No"}</div>
                  <div>Phase: {currentPhase}</div>
                  <div>Timer: {phaseTimer.toFixed(1)}s</div>
                  <div>Cycle: {cycleCount + 1}/5</div>
                  <div>Audio: {audioLevel.toFixed(1)}%</div>
                  <div className="col-span-2 font-semibold text-blue-600">
                    Score Ref: {currentScoreRef.current}
                  </div>
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
              isPlaying
                ? "bg-red-500 hover:bg-red-600 shadow-lg"
                : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 shadow-lg"
            }`}
          >
            {isPlaying ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Stop Exercise</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Play className="h-5 w-5" />
                <span>Start Exercise</span>
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

              {/* Star Rating */}
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3].map((star) => (
                  <div
                    key={star}
                    className={`w-6 h-6 rounded-full ${
                      finalScore >= star * 3000
                        ? "bg-yellow-400"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
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
            </div>

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
                  setLastScoreTime(0);
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
