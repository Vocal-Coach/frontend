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
      // 🎤 목소리 범위 필터링 (범위 확장)
      const isVoiceRange =
        selectedRange === "male"
          ? frequency >= 70 && frequency <= 600 // 남성 목소리 범위 확장
          : frequency >= 120 && frequency <= 1200; // 여성 목소리 범위 확장

      // 오디오 레벨 체크 (더 엄격하게 조정)
      const audioLevel = Math.max(...Array.from(audioData));
      const rmsLevel = Math.sqrt(
        audioData.reduce((sum, sample) => sum + sample * sample, 0) /
          audioData.length
      );

      // 의도적인 발성 감지를 위한 조건들
      const isValidAudioLevel = audioLevel > 0.02; // 최소 오디오 레벨
      const isStrongSignal = rmsLevel > 0.01; // RMS 레벨로 신호 강도 체크
      const isConsistentPitch = frequency > 0 && frequency < 2000; // 유효한 피치 범위

      // 실제 노래/발성으로 판단되는 조건
      const isSinging =
        isVoiceRange &&
        isValidAudioLevel &&
        isStrongSignal &&
        isConsistentPitch;

      // 목소리 범위이고 충분한 신호 강도일 때만 처리
      if (isSinging) {
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
        isSinging // 조건 변경: 실제 노래할 때만
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

          // 🎵 음성 평가는 300ms마다 실행
          if (currentTime - lastEvaluationTime > 300) {
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
    if (evaluationResult.totalScore > currentScore) {
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
      console.log(
        `❌ No score increase - Note: ${expectedNote}, Accuracy: ${evaluationResult.pitchAccuracy.toFixed(
          1
        )}%, Hit: ${evaluationResult.noteHit}, Current: ${currentScore}, New: ${
          evaluationResult.totalScore
        }`
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
