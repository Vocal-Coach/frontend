"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Mic, MicOff, Award } from "lucide-react";
import { levels } from "@/app/lib/levelsData";
import PracticePageLayout from "@/app/components/features/practice/PracticePageLayout";
import PitchStaff from "@/app/components/features/practice/PitchStaff";
import ScoreDisplay from "@/app/components/features/practice/ScoreDisplay";
import InstructionsText from "@/app/components/features/practice/InstructionsText";
import {
  playTone,
  playSequence,
  cleanupAudio,
} from "@/app/lib/audio/audioUtils";
import {
  initialAnimationState,
  AnimationState,
  calculateNotePosition,
  calculateCurrentNoteIndex,
  calculateProgress,
} from "@/app/lib/animation/animationUtils";
import {
  requestMicrophoneAccess,
  setupPitchDetection,
  evaluateVocalPerformance,
} from "@/app/lib/evaluation/evaluationUtils";

interface PracticePageProps {
  params: {
    levelId: string;
  };
}

export default function PracticePage({ params }: PracticePageProps) {
  const router = useRouter();
  const levelId = parseInt(params.levelId);

  // 레퍼런스 저장용
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastPlayedNoteRef = useRef<number>(-1);
  const micCleanupRef = useRef<(() => void) | null>(null);

  // 상태 관리
  const [selectedRange, setSelectedRange] = useState<string>("female");
  const [animationState, setAnimationState] = useState<AnimationState>({
    ...initialAnimationState,
    score: 0, // 점수 0부터 시작
  });

  // 마이크 관련 상태
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);
  const [lastEvaluationTime, setLastEvaluationTime] = useState<number>(0);
  const [scoreFlash, setScoreFlash] = useState<boolean>(false);

  // 모든 음표 데이터 로드
  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [visibleNotes, setVisibleNotes] = useState<any[]>([]);

  const levelData = levels.find((level) => level.id === levelId);
  // 모든 음표 초기화
  useEffect(() => {
    if (!levelData?.scale) return;

    // 모든 음표에 대한 기본 데이터 생성
    const noteData = levelData.scale.map((note, index) => {
      return {
        id: index,
        text: note,
        pitchClass: `p${levelId}-${note.toLowerCase()}`,
        durationClass: "note-duration-medium",
        positionClass: "note-position-0", // 초기 위치 (오른쪽 끝)
      };
    });

    setAllNotes(noteData);
  }, [levelData, levelId]);

  // 레벨 없으면 오류 표시
  if (!levelData) {
    return <div>Level not found</div>;
  }
  // 템포 및 비트 설정
  const tempo = levelData.tempo || 60; // 기본 BPM 60
  const beatDuration = 60 / tempo; // 초 단위 비트 길이

  // 기본 범위 옵션
  const defaultRangeOptions = [
    { label: "Female (C4-C5)", value: "female" },
    { label: "Male (C3-C4)", value: "male" },
  ];

  // 범위 옵션 설정
  const rangeOptions = levelData.ranges
    ? [
        { label: `Female (${levelData.ranges.female})`, value: "female" },
        { label: `Male (${levelData.ranges.male})`, value: "male" },
      ]
    : defaultRangeOptions;

  // 마이크 액세스 설정
  const setupMicrophone = async () => {
    try {
      const stream = await requestMicrophoneAccess();
      if (!stream) {
        console.error("마이크 액세스 실패");
        return null;
      }

      setHasMicPermission(true);

      // AudioContext 초기화
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();

      // 피치 감지 설정
      const cleanup = setupPitchDetection(
        audioContext,
        stream,
        handlePitchDetected
      );

      // 정리 함수 반환
      return () => {
        cleanup();
        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (error) {
      console.error("마이크 설정 오류:", error);
      return null;
    }
  };

  // 피치 감지 핸들러
  const handlePitchDetected = (frequency: number, audioData: Float32Array) => {
    // 현재 주파수 업데이트
    setCurrentFrequency(frequency);

    // 재생 중이고 현재 음표가 있을 때만 평가
    if (animationState.isPlaying && levelData.scale) {
      const currentTime = performance.now();
      const currentNoteIndex = Math.floor(
        (currentTime - startTimeRef.current) / 1000 / beatDuration
      );

      // 현재 재생 중인 음표
      if (currentNoteIndex >= 0 && currentNoteIndex < levelData.scale.length) {
        const expectedNote = levelData.scale[currentNoteIndex];

        // 500ms마다 평가 (너무 자주 평가하지 않도록)
        if (currentTime - lastEvaluationTime > 500) {
          evaluateUserVoice(expectedNote, frequency, audioData);
          setLastEvaluationTime(currentTime);
        }
      }
    }
  };

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
      setAnimationState((prev) => ({
        ...prev,
        score: evaluationResult.totalScore,
      }));

      // 점수 플래시 효과
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 500);
    }
  };

  // 마이크 활성화/비활성화 토글
  const toggleMicrophone = async () => {
    if (isMicActive) {
      // 마이크 비활성화
      setIsMicActive(false);
      if (micCleanupRef.current) {
        micCleanupRef.current();
        micCleanupRef.current = null;
      }
    } else {
      // 마이크 활성화
      setIsMicActive(true);
      if (!hasMicPermission || !micCleanupRef.current) {
        const cleanup = await setupMicrophone();
        if (cleanup) {
          micCleanupRef.current = cleanup;
        }
      }
    }
  };

  // 애니메이션 프레임 함수
  const animateFrame = (timestamp: number) => {
    if (!animationFrameRef.current || !levelData.scale) return;

    // 애니메이션 시작 시간이 없으면 초기화
    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp;
    }

    // 경과 시간 계산 (초 단위)
    const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;

    // 분석 시간에 따른 현재 음표 인덱스 계산
    const currentNoteIndex = Math.floor(elapsedSeconds / beatDuration);

    // 음표가 타겟 라인에 도달했을 때 소리 재생
    // 정확한 타이밍을 위해 우리는 음표가 정확히 타겟 라인에 있을 때만 소리를 재생해야 함
    const notePositionPercent =
      ((elapsedSeconds % beatDuration) / beatDuration) * 100;

    // 타겟 라인에 도달했을 때 (30% 위치, 분석 5% 오차 허용)
    if (
      currentNoteIndex !== lastPlayedNoteRef.current &&
      notePositionPercent >= 25 &&
      notePositionPercent <= 35 &&
      currentNoteIndex >= 0 &&
      currentNoteIndex < levelData.scale.length
    ) {
      const note = levelData.scale[currentNoteIndex];
      playTone(note, selectedRange as "male" | "female", beatDuration * 0.9);
      lastPlayedNoteRef.current = currentNoteIndex;
    }

    // 모든 음표 위치 업데이트
    const updatedVisibleNotes = allNotes
      .map((note) => {
        const positionClass = calculateNotePosition(
          note.id,
          elapsedSeconds,
          tempo,
          levelData.scale?.length || 0
        );

        return {
          ...note,
          positionClass: positionClass,
        };
      })
      .filter((note) => note.positionClass !== "hidden"); // 보이는 음표만 필터링

    setVisibleNotes(updatedVisibleNotes);

    // 애니메이션 상태 업데이트
    setAnimationState((prev) => ({
      ...prev,
      currentNoteIndex: currentNoteIndex,
      progress: calculateProgress(
        currentNoteIndex,
        levelData.scale?.length || 1
      ),
      currentTime: elapsedSeconds,
    }));

    // 모든 음표가 지나갔는지 확인
    const totalDuration = (levelData.scale.length + 2) * beatDuration; // 추가 시간을 위해 +2
    if (elapsedSeconds < totalDuration) {
      // 애니메이션 계속
      animationFrameRef.current = requestAnimationFrame(animateFrame);
    } else {
      // 애니메이션 종료
      setAnimationState((prev) => ({
        ...prev,
        isPlaying: false,
        progress: 100,
      }));
      animationFrameRef.current = null;
    }
  };

  // 애니메이션 시작
  const startAnimation = () => {
    if (animationFrameRef.current) return;

    // 상태 초기화
    setAnimationState((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      currentNoteIndex: 0,
      progress: 0,
      currentTime: 0,
    }));

    // 참조값 초기화
    startTimeRef.current = 0;
    lastPlayedNoteRef.current = -1;

    // 애니메이션 시작
    animationFrameRef.current = requestAnimationFrame(animateFrame);
  };

  // 애니메이션 정지
  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 상태 초기화 (점수는 유지)
    setAnimationState((prev) => ({
      ...initialAnimationState,
      score: prev.score,
    }));

    // 모든 음표 위치 초기화
    const resetNotes = allNotes.map((note) => ({
      ...note,
      positionClass: "note-position-0",
    }));

    setVisibleNotes(resetNotes.slice(0, 3)); // 초기에 3개만 표시
  };

  // 성별에 따른 음역대 변경 핸들러
  const handleRangeChange = (newRange: string) => {
    setSelectedRange(newRange);

    // 재생 중이면 변경 후 다시 시작
    const wasPlaying = animationState.isPlaying;
    if (wasPlaying) {
      stopAnimation();
      setTimeout(() => {
        startAnimation();
      }, 100);
    }
  };

  // 재생/일시정지 토글 핸들러
  const handlePlayPauseClick = () => {
    if (animationState.isPlaying) {
      stopAnimation(); // 일시정지 대신 정지로 단순화
    } else {
      startAnimation();
    }
  };

  // 리셋 핸들러
  const handleRestartClick = () => {
    stopAnimation();
    setTimeout(() => {
      startAnimation();
    }, 100);
  };

  // 정지 핸들러
  const handleStopClick = () => {
    stopAnimation();
  };

  // 뒤로 가기 핸들러
  const handleBackClick = () => {
    stopAnimation();
    router.push("/levels");
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micCleanupRef.current) {
        micCleanupRef.current();
      }
      cleanupAudio();
    };
  }, []);

  // 오디오 접근 권한 요청
  useEffect(() => {
    // 모바일에서는 사용자 인터랙션 없이 오디오를 재생할 수 없으므로
    // 사용자에게 안내 메시지를 표시할 수 있습니다.
    const checkAudioPermission = async () => {
      try {
        // AudioContext 생성 시도
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();

        // 상태가 suspended이면 사용자 인터랙션이 필요
        if (audioCtx.state === "suspended") {
          console.log("Audio context is suspended. User interaction needed.");
        }
      } catch (error) {
        console.error("Audio API not supported or error:", error);
      }
    };

    checkAudioPermission();
  }, []);

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
      progressPercent={animationState.progress}
      onBackClick={handleBackClick}
    >
      <div className="w-full max-w-xs text-center mb-1">
        <p className="practice-subtext-light text-xs mb-0.5 text-gray-500">
          Visual Guide: {levelData.visualGuide || "Coming Soon"}
        </p>

        {/* 음표 위치 시각화 */}
        <PitchStaff notesToDisplay={visibleNotes} />
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
