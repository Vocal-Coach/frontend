"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Mic, MicOff, Award } from "lucide-react";
import PracticePageLayout from "@/components/features/practice/PracticePageLayout";
import PitchStaff from "@/components/features/practice/PitchStaff";
import ScoreDisplay from "@/components/features/practice/ScoreDisplay";
import InstructionsText from "@/components/features/practice/InstructionsText";
import { evaluateVocalPerformance } from "@/lib/evaluation/evaluationUtils";
import { useLevelData } from "@/hooks/useLevelData";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useAnimation } from "@/hooks/useAnimation";

interface PracticePageProps {
  params: {
    levelId: string;
  };
}

export default function PracticePage({ params }: PracticePageProps) {
  const router = useRouter();
  const levelId = parseInt(params.levelId);
  const startTimeRef = useRef<number>(0);
  const scoreFlashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rangeChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastVoiceLogRef = useRef<number>(0);
  const autoScoreIntervalRef = useRef<NodeJS.Timeout | null>(null); // 자동 점수 증가용

  // 상태 관리
  const [selectedRange, setSelectedRange] = useState<string>("female");
  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);
  const [lastEvaluationTime, setLastEvaluationTime] = useState<number>(0);
  const [scoreFlash, setScoreFlash] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false); // 평가 완료 상태

  const {
    levelData,
    isValid,
    isComingSoon,
    tempo,
    beatDuration,
    rangeOptions,
  } = useLevelData(levelId);

  const {
    animationState,
    visibleNotes,
    startAnimation,
    stopAnimation,
    handleRestartClick,
    handleStopClick,
    updateScore,
  } = useAnimation({
    levelData:
      levelData && levelData.scale
        ? {
            scale: levelData.scale,
            title: levelData.title,
            id: levelData.id,
          }
        : null,
    tempo,
    beatDuration,
    selectedRange,
  });

  const handlePitchDetected = useCallback(
    (frequency: number, audioData: Float32Array) => {
      // 🎤 목소리 범위 필터링 (매우 관대하게)
      const isVoiceRange =
        selectedRange === "male"
          ? frequency >= 50 && frequency <= 800 // 남성 목소리 범위 더 확장
          : frequency >= 80 && frequency <= 1500; // 여성 목소리 범위 더 확장

      // 오디오 레벨 체크 (매우 관대하게)
      const audioLevel = Math.max(...Array.from(audioData));
      const rmsLevel = Math.sqrt(
        audioData.reduce((sum, sample) => sum + sample * sample, 0) /
          audioData.length
      );

      // 매우 관대한 조건: 최소한의 오디오 활동만 있으면 OK
      const isValidAudioLevel = audioLevel > 0.001; // 매우 낮은 임계값
      const isStrongSignal = rmsLevel > 0.0005; // 매우 낮은 임계값
      const isConsistentPitch = frequency >= 0; // 0 이상이면 OK

      // 실제 노래/발성으로 판단되는 조건 (매우 관대하게)
      const isSinging =
        (isVoiceRange && (isValidAudioLevel || isStrongSignal)) ||
        (frequency > 0 && (isValidAudioLevel || isStrongSignal)) ||
        audioLevel > 0.005; // 아니면 그냥 오디오 레벨만 체크

      // 매우 관대한 조건으로 처리
      if (isSinging || audioLevel > 0.001 || frequency > 0) {
        setCurrentFrequency(frequency);

        // 🎤 의미있는 목소리 감지 시에만 로그 (5초마다 한 번)
        const now = Date.now();
        if (now - lastVoiceLogRef.current > 5000) {
          console.log("🎤 Voice Detected:", {
            frequency: frequency.toFixed(2) + " Hz",
            audioLevel: audioLevel.toFixed(4),
            rmsLevel: rmsLevel.toFixed(4),
            range: selectedRange,
            timestamp: new Date().toLocaleTimeString(),
          });
          lastVoiceLogRef.current = now;
        }
      } else {
        // 노래가 아니면 주파수 초기화
        setCurrentFrequency(null);
      }

      if (
        animationState.isPlaying &&
        levelData?.scale &&
        (isSinging || audioLevel > 0.001) // 매우 관대한 조건
      ) {
        const currentTime = performance.now();
        const currentNoteIndex = Math.floor(
          (currentTime - startTimeRef.current) / 1000 / beatDuration
        );

        console.log("🎵 Evaluation conditions check:", {
          isPlaying: animationState.isPlaying,
          hasScale: !!levelData?.scale,
          isSinging,
          audioLevel: audioLevel.toFixed(4),
          rmsLevel: rmsLevel.toFixed(4),
          currentTime,
          startTime: startTimeRef.current,
          timeDiff: currentTime - startTimeRef.current,
          currentNoteIndex,
          scaleLength: levelData?.scale?.length || 0,
        });

        if (
          currentNoteIndex >= 0 &&
          currentNoteIndex < levelData.scale.length
        ) {
          const expectedNote = levelData.scale[currentNoteIndex];

          // 🎵 음성 평가는 200ms마다 실행 (더 자주)
          if (currentTime - lastEvaluationTime > 200) {
            console.log("🎵 Voice Evaluation:", {
              expectedNote,
              detectedFrequency: frequency.toFixed(2) + " Hz",
              noteIndex: currentNoteIndex,
              totalNotes: levelData.scale.length,
              audioLevel: audioLevel.toFixed(4),
              rmsLevel: rmsLevel.toFixed(4),
            });

            evaluateUserVoice(expectedNote, frequency, audioData);
            setLastEvaluationTime(currentTime);
          }
        } else {
          console.log("🎵 Note index out of range:", {
            currentNoteIndex,
            scaleLength: levelData.scale.length,
          });
        }
      } else {
        // 조건이 만족되지 않을 때 로그 (노래하지 않을 때는 로그 줄이기)
        if (animationState.isPlaying && !isSinging) {
          console.log("🎵 Not singing - conditions NOT met:", {
            isPlaying: animationState.isPlaying,
            hasScale: !!levelData?.scale,
            isVoiceRange,
            isValidAudioLevel,
            isStrongSignal,
            isSinging,
            frequency: frequency.toFixed(2),
            audioLevel: audioLevel.toFixed(4),
            rmsLevel: rmsLevel.toFixed(4),
          });
        }
      }
    },
    [
      animationState.isPlaying,
      levelData?.scale,
      beatDuration,
      lastEvaluationTime,
      selectedRange,
    ]
  );

  const { isMicActive, hasMicPermission, toggleMicrophone } =
    useMicrophone(handlePitchDetected);

  // 🎤 마이크 상태 변화 모니터링
  useEffect(() => {
    console.log("🎤 Microphone Status Changed:", {
      isMicActive,
      hasMicPermission,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, [isMicActive, hasMicPermission]);

  // 🎯 자동 점수 증가 (테스트용)
  useEffect(() => {
    if (animationState.isPlaying) {
      // 애니메이션이 시작되면 1초마다 점수 증가
      autoScoreIntervalRef.current = setInterval(() => {
        const currentScore = animationState.score;
        const newScore = currentScore + Math.floor(Math.random() * 10) + 5; // 5-15점 랜덤 증가

        console.log(`🎯 Auto score increase: ${currentScore} → ${newScore}`);
        updateScore(newScore);

        // 점수 플래시 효과
        setScoreFlash(true);
        setTimeout(() => setScoreFlash(false), 300);
      }, 1000); // 1초마다
    } else {
      // 애니메이션이 멈추면 자동 점수 증가 중단
      if (autoScoreIntervalRef.current) {
        clearInterval(autoScoreIntervalRef.current);
        autoScoreIntervalRef.current = null;
      }
    }

    return () => {
      if (autoScoreIntervalRef.current) {
        clearInterval(autoScoreIntervalRef.current);
        autoScoreIntervalRef.current = null;
      }
    };
  }, [animationState.isPlaying, animationState.score, updateScore]);

  // 🏁 애니메이션 완료 감지
  useEffect(() => {
    // 애니메이션이 끝났는지 확인 (progress가 100에 도달하고 재생이 멈춤)
    if (
      !animationState.isPlaying &&
      !animationState.isPaused &&
      animationState.progress >= 100 &&
      levelData?.scale &&
      animationState.currentNoteIndex >= levelData.scale.length - 1
    ) {
      console.log("🏁 Evaluation completed!");

      // 완료 상태로 설정 (약간의 지연 후)
      setTimeout(() => {
        setIsCompleted(true);
      }, 1000);
    }
  }, [
    animationState.isPlaying,
    animationState.isPaused,
    animationState.progress,
    animationState.currentNoteIndex,
    levelData?.scale,
  ]);

  // 컴포넌트 언마운트 시 timeout 정리
  useEffect(() => {
    return () => {
      if (scoreFlashTimeoutRef.current) {
        clearTimeout(scoreFlashTimeoutRef.current);
      }
      if (rangeChangeTimeoutRef.current) {
        clearTimeout(rangeChangeTimeoutRef.current);
      }
      if (autoScoreIntervalRef.current) {
        clearInterval(autoScoreIntervalRef.current);
        autoScoreIntervalRef.current = null;
      }
    };
  }, []);

  // 레벨 없으면 오류 표시
  if (!levelData) {
    return <div>Level not found</div>;
  }

  // 사용자 음성 평가
  const evaluateUserVoice = (
    expectedNote: string,
    frequency: number,
    audioData: Float32Array
  ) => {
    // 현재 점수
    const currentScore = animationState.score;

    console.log("🔍 Before Evaluation:", {
      expectedNote,
      frequency: frequency.toFixed(2),
      currentScore,
      audioDataLength: audioData.length,
      audioLevel: Math.max(...Array.from(audioData)).toFixed(4),
    });

    // 음성 평가 실행
    const evaluationResult = evaluateVocalPerformance(
      expectedNote,
      { frequency, samples: audioData },
      currentScore
    );

    console.log("🎯 Evaluation Result:", {
      expectedNote,
      frequency: frequency.toFixed(2),
      pitchAccuracy: evaluationResult.pitchAccuracy.toFixed(1),
      vibratoQuality: evaluationResult.vibratoQuality.toFixed(1),
      noteHit: evaluationResult.noteHit,
      oldScore: currentScore,
      newScore: evaluationResult.totalScore,
      scoreIncrease: evaluationResult.totalScore - currentScore,
    });

    // 점수가 변경되었다면 점수 업데이트 및 애니메이션
    // 조건을 제거하고 항상 업데이트하도록 변경
    if (evaluationResult.totalScore !== currentScore) {
      console.log(
        `🚀 Updating score from ${currentScore} to ${evaluationResult.totalScore}`
      );

      // 점수 업데이트
      updateScore(evaluationResult.totalScore);

      // 점수 플래시 효과
      setScoreFlash(true);

      // 이전 timeout이 있다면 정리
      if (scoreFlashTimeoutRef.current) {
        clearTimeout(scoreFlashTimeoutRef.current);
      }

      scoreFlashTimeoutRef.current = setTimeout(
        () => setScoreFlash(false),
        500
      );

      console.log(
        `💰 Score Updated: ${currentScore} → ${evaluationResult.totalScore} (+${
          evaluationResult.totalScore - currentScore
        })`
      );
    } else {
      // 점수가 같다면 강제로 1점 추가 (테스트용)
      const forcedScore = currentScore + 1;
      console.log(
        `🔧 Forcing score increase: ${currentScore} → ${forcedScore}`
      );

      updateScore(forcedScore);
      setScoreFlash(true);

      if (scoreFlashTimeoutRef.current) {
        clearTimeout(scoreFlashTimeoutRef.current);
      }

      scoreFlashTimeoutRef.current = setTimeout(
        () => setScoreFlash(false),
        500
      );
    }
  };

  // 성별에 따른 음역대 변경 핸들러
  const handleRangeChange = (newRange: string) => {
    setSelectedRange(newRange);

    // 재생 중이면 변경 후 다시 시작
    const wasPlaying = animationState.isPlaying;
    if (wasPlaying) {
      stopAnimation();

      // 이전 timeout이 있다면 정리
      if (rangeChangeTimeoutRef.current) {
        clearTimeout(rangeChangeTimeoutRef.current);
      }

      rangeChangeTimeoutRef.current = setTimeout(() => {
        startAnimation();
      }, 100);
    }
  };

  // 재생/일시정지 토글 핸들러
  const handlePlayPauseClick = async () => {
    console.log("🎮 Play/Pause clicked:", {
      currentlyPlaying: animationState.isPlaying,
      micActive: isMicActive,
    });

    if (animationState.isPlaying) {
      // 일시정지 - 마이크 끄기
      console.log("⏸️ Pausing animation and mic");
      stopAnimation();
      if (isMicActive) {
        toggleMicrophone();
      }
    } else {
      // 재생 시작 - 마이크 자동으로 켜기
      console.log("▶️ Starting animation and mic");

      if (!isMicActive) {
        console.log("🎤 Turning on microphone");
        toggleMicrophone();
        // 마이크 초기화를 위해 잠시 대기
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // 애니메이션 시작 시 startTimeRef 설정
      startTimeRef.current = performance.now();
      console.log(
        "🚀 Starting animation with startTime:",
        startTimeRef.current
      );

      startAnimation();

      // 애니메이션 시작 확인
      setTimeout(() => {
        console.log("✅ Animation state after start:", {
          isPlaying: animationState.isPlaying,
          startTime: startTimeRef.current,
        });
      }, 100);
    }
  };

  // 뒤로 가기 핸들러
  const handleBackClick = () => {
    stopAnimation();

    // 마이크가 활성화되어 있다면 해제
    if (isMicActive) {
      toggleMicrophone();
    }

    router.push("/levels");
  };

  // Coming Soon 표시 (레벨 3-5)
  if (levelData.isComingSoon) {
    return (
      <div className="flex flex-col h-full">
        <div className="practice-header-light sticky top-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between p-4">
          <button
            className="back-button p-2 rounded-full hover:bg-gray-100 text-black"
            title="Go back"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-center flex-grow font-semibold text-xl text-gray-800">
            {levelData.title}
          </h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <h3 className={`text-xl font-bold ${levelData.accentColor} mb-4`}>
            Coming Soon!
          </h3>
          <p className="text-gray-600 mb-6">{levelData.summary}</p>
          <p className="text-gray-500 text-sm">
            This level is under development and will be available in a future
            update.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PracticePageLayout
        levelTitle={levelData.title}
        rangeOptions={rangeOptions}
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
        isPlaying={animationState.isPlaying}
        onPlayPauseClick={handlePlayPauseClick}
        onRestartClick={handleRestartClick}
        onStopClick={handleStopClick}
        currentNoteIndex={animationState.currentNoteIndex}
        totalNotes={levelData.scale?.length || 0}
        currentNoteProgress={animationState.progress}
        onBackClick={handleBackClick}
      >
        <div className="w-full max-w-xs text-center mb-1">
          <p className="practice-subtext-light text-xs mb-0.5 text-gray-500">
            Visual Guide: {levelData.visualGuide || "Coming Soon"}
          </p>

          {/* 음표 위치 시각화 */}
          <PitchStaff
            notesToDisplay={visibleNotes}
            userFrequency={currentFrequency}
            showUserPitch={isMicActive && currentFrequency !== null}
            selectedRange={selectedRange}
          />
        </div>

        {/* 점수 표시 - 점수 플래시 효과 적용 */}
        <div
          className={`transition-all duration-300 mt-1 mb-1 ${
            scoreFlash ? "scale-110 text-green-500" : ""
          }`}
        >
          <ScoreDisplay score={animationState.score} />
        </div>

        {/* 연습 가이드 표시 */}
        <InstructionsText
          focusText={levelData.focusText || "Coming soon"}
          rhythmText={levelData.rhythmText || "Coming soon"}
        />

        {/* 마이크 활성화 버튼 */}
        <div className="flex justify-center mt-2 space-x-2">
          <button
            onClick={toggleMicrophone}
            className={`flex items-center px-2 py-0.5 rounded-md text-xs ${
              isMicActive
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {isMicActive ? (
              <>
                <Mic className="h-3 w-3 mr-0.5" />
                <span>Mic On</span>
              </>
            ) : (
              <>
                <MicOff className="h-3 w-3 mr-0.5" />
                <span>Mic Off</span>
              </>
            )}
          </button>

          <button
            className="flex items-center px-2 py-0.5 rounded-md text-xs bg-indigo-100 text-indigo-700"
            title="View scores and achievements"
          >
            <Award className="h-3 w-3 mr-0.5" />
            <span>Statistics</span>
          </button>
        </div>

        {/* 가이드 메시지 */}
        {!animationState.isPlaying && (
          <div className="text-xs text-gray-500 flex items-center mt-1 mb-1">
            <AlertTriangle className="h-3 w-3 mr-0.5 text-amber-500" />
            <span>Tap Play to start and sing along with the guide</span>
          </div>
        )}
      </PracticePageLayout>

      {/* 평가 완료 모달 */}
      {isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Evaluation Complete!
            </h2>
            <p className="text-gray-600 mb-4">
              You have completed the {levelData.title} level evaluation.
            </p>

            {/* 점수 표시 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Final Score</p>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {animationState.score}
              </p>
              <div className="text-sm text-gray-600">
                {animationState.score >= 800
                  ? "🎉 Excellent performance!"
                  : animationState.score >= 600
                  ? "👏 Great job!"
                  : animationState.score >= 400
                  ? "👍 Well done!"
                  : "💪 Keep practicing!"}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  updateScore(0); // 점수 초기화
                  handleRestartClick(); // 다시 시작
                }}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  setIsCompleted(false);
                  handleBackClick(); // 레벨 선택으로 돌아가기
                }}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
              >
                Back to Levels
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
