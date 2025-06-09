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

  // 상태 관리
  const [selectedRange, setSelectedRange] = useState<string>("female");
  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);
  const [lastEvaluationTime, setLastEvaluationTime] = useState<number>(0);
  const [scoreFlash, setScoreFlash] = useState<boolean>(false);

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
      // 🎤 목소리 범위 필터링
      const isVoiceRange =
        selectedRange === "male"
          ? frequency >= 80 && frequency <= 500 // 남성 목소리 범위
          : frequency >= 150 && frequency <= 1000; // 여성 목소리 범위

      // 오디오 레벨 체크 (너무 작거나 큰 소리 제외)
      const audioLevel = Math.max(...Array.from(audioData));
      const isValidAudioLevel = audioLevel > 0.02 && audioLevel < 0.8;

      // 목소리 범위이고 적절한 볼륨일 때만 처리
      if (isVoiceRange && isValidAudioLevel) {
        setCurrentFrequency(frequency);

        // 🎤 의미있는 목소리 감지 시에만 로그 (5초마다 한 번)
        const now = Date.now();
        if (now - lastVoiceLogRef.current > 5000) {
          console.log("🎤 Voice Detected:", {
            frequency: frequency.toFixed(2) + " Hz",
            audioLevel: audioLevel.toFixed(4),
            range: selectedRange,
            timestamp: new Date().toLocaleTimeString(),
          });
          lastVoiceLogRef.current = now;
        }
      } else {
        // 목소리 범위가 아니면 주파수 초기화
        setCurrentFrequency(null);
      }

      if (
        animationState.isPlaying &&
        levelData?.scale &&
        isVoiceRange &&
        isValidAudioLevel
      ) {
        const currentTime = performance.now();
        const currentNoteIndex = Math.floor(
          (currentTime - startTimeRef.current) / 1000 / beatDuration
        );

        if (
          currentNoteIndex >= 0 &&
          currentNoteIndex < levelData.scale.length
        ) {
          const expectedNote = levelData.scale[currentNoteIndex];

          // 🎵 음성 평가는 실제 평가가 실행될 때만 로그
          if (currentTime - lastEvaluationTime > 500) {
            console.log("🎵 Voice Evaluation:", {
              expectedNote,
              detectedFrequency: frequency.toFixed(2) + " Hz",
              noteIndex: currentNoteIndex,
              totalNotes: levelData.scale.length,
              audioLevel: audioLevel.toFixed(4),
            });

            evaluateUserVoice(expectedNote, frequency, audioData);
            setLastEvaluationTime(currentTime);
          }
        }
      }
    },
    [
      animationState.isPlaying,
      levelData?.scale,
      beatDuration,
      lastEvaluationTime,
      selectedRange, // selectedRange 의존성 추가
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

  // 컴포넌트 언마운트 시 timeout 정리
  useEffect(() => {
    return () => {
      if (scoreFlashTimeoutRef.current) {
        clearTimeout(scoreFlashTimeoutRef.current);
      }
      if (rangeChangeTimeoutRef.current) {
        clearTimeout(rangeChangeTimeoutRef.current);
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

    // 음성 평가 실행
    const evaluationResult = evaluateVocalPerformance(
      expectedNote,
      { frequency, samples: audioData },
      currentScore
    );

    // 점수가 변경되었다면 점수 업데이트 및 애니메이션
    if (evaluationResult.totalScore > currentScore) {
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
  const handlePlayPauseClick = () => {
    if (animationState.isPlaying) {
      stopAnimation();
    } else {
      startAnimation();
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
  );
}
