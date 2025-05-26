import { useState, useRef, useCallback, useEffect } from "react";
import { playTone, cleanupAudio } from "@/lib/audio/audioUtils";
import {
  initialAnimationState,
  AnimationState,
  calculateNotePosition,
  calculateProgress,
} from "@/lib/animation/animationUtils";

interface UseAnimationProps {
  levelData: {
    scale: string[];
    title: string;
  } | null;
  tempo: number;
  beatDuration: number;
  selectedRange: string;
}

interface UseAnimationReturn {
  animationState: AnimationState;
  visibleNotes: any[];
  startAnimation: () => void;
  stopAnimation: () => void;
  handleRestartClick: () => void;
  handleStopClick: () => void;
  updateScore: (newScore: number) => void;
}

export const useAnimation = ({
  levelData,
  tempo,
  beatDuration,
  selectedRange,
}: UseAnimationProps): UseAnimationReturn => {
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastPlayedNoteRef = useRef<number>(-1);
  const isPausedRef = useRef<boolean>(false);
  const lastPlayedTimeRef = useRef<number>(0);
  const pausedProgressRef = useRef<number>(0);
  const pausedNoteIndexRef = useRef<number>(0);
  const pausedElapsedTimeRef = useRef<number>(0);
  const lastPauseTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);

  const [animationState, setAnimationState] = useState<AnimationState>({
    ...initialAnimationState,
    score: 0,
  });

  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [visibleNotes, setVisibleNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!levelData?.scale) return;

    const noteData = levelData.scale.map((note, index) => ({
      id: index,
      text: note,
      pitchClass: `p-${note.toLowerCase()}`,
      durationClass: "note-duration-medium",
      positionClass: "note-position-0",
    }));

    setAllNotes(noteData);
  }, [levelData?.scale]);

  const animateFrame = useCallback(
    (timestamp: number) => {
      if (!animationFrameRef.current || !levelData?.scale) return;

      if (isPausedRef.current) {
        animationFrameRef.current = null;
        return;
      }

      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp;
        lastPlayedTimeRef.current = timestamp;
        totalPausedTimeRef.current = 0;
        lastPauseTimeRef.current = 0;
      }

      const currentTime =
        timestamp - startTimeRef.current - totalPausedTimeRef.current;
      const elapsedSeconds = currentTime / 1000;

      const rawNoteIndex = Math.floor(elapsedSeconds / beatDuration);
      const currentNoteIndex = rawNoteIndex < 0 ? -1 : rawNoteIndex;

      if (currentNoteIndex !== lastPlayedNoteRef.current) {
        const notePositionPercent =
          ((elapsedSeconds % beatDuration) / beatDuration) * 100;
        const timeSinceLastPlay = timestamp - lastPlayedTimeRef.current;
        const minTimeBetweenNotes = beatDuration * 1000 * 0.25;

        if (
          notePositionPercent >= 25 &&
          notePositionPercent <= 35 &&
          currentNoteIndex >= 0 &&
          currentNoteIndex < levelData.scale.length &&
          timeSinceLastPlay >= minTimeBetweenNotes
        ) {
          const note = levelData.scale[currentNoteIndex];
          playTone(
            note,
            selectedRange as "male" | "female",
            beatDuration * 0.9
          );
          lastPlayedNoteRef.current = currentNoteIndex;
          lastPlayedTimeRef.current = timestamp;
        }
      }

      const updatedVisibleNotes = allNotes
        .map((note) => {
          const positionClass = calculateNotePosition(
            note.id,
            elapsedSeconds,
            tempo,
            levelData.scale.length
          );
          return {
            ...note,
            positionClass,
          };
        })
        .filter((note) => note.positionClass !== "hidden");

      setVisibleNotes(updatedVisibleNotes);

      let currentProgress = 0;
      if (currentNoteIndex >= 0) {
        currentProgress = calculateProgress(
          currentNoteIndex,
          levelData.scale.length || 1
        );
      }

      setAnimationState((prev) => ({
        ...prev,
        currentNoteIndex,
        progress: currentProgress,
        currentTime: elapsedSeconds,
      }));

      const totalDuration = (levelData.scale.length + 2) * beatDuration;
      if (elapsedSeconds < totalDuration) {
        animationFrameRef.current = requestAnimationFrame(animateFrame);
      } else {
        setAnimationState((prev) => ({
          ...prev,
          isPlaying: false,
          progress: 100,
        }));
        animationFrameRef.current = null;
        isPausedRef.current = false;
        startTimeRef.current = 0;
        lastPlayedTimeRef.current = 0;
        pausedProgressRef.current = 0;
        pausedNoteIndexRef.current = 0;
        pausedElapsedTimeRef.current = 0;
        totalPausedTimeRef.current = 0;
        lastPauseTimeRef.current = 0;
      }
    },
    [allNotes, beatDuration, levelData?.scale, selectedRange, tempo]
  );

  const startAnimation = useCallback(() => {
    if (animationFrameRef.current) return;

    if (isPausedRef.current) {
      const pauseDuration = performance.now() - lastPauseTimeRef.current;
      totalPausedTimeRef.current += pauseDuration;

      isPausedRef.current = false;
      setAnimationState((prev) => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        progress: pausedProgressRef.current,
        currentNoteIndex: pausedNoteIndexRef.current,
      }));
    } else {
      setAnimationState((prev) => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        currentNoteIndex: 0,
        progress: 0,
        currentTime: 0,
      }));
      startTimeRef.current = 0;
      lastPlayedNoteRef.current = -1;
      lastPlayedTimeRef.current = 0;
      pausedProgressRef.current = 0;
      pausedNoteIndexRef.current = 0;
      pausedElapsedTimeRef.current = 0;
      totalPausedTimeRef.current = 0;
      lastPauseTimeRef.current = 0;
    }

    animationFrameRef.current = requestAnimationFrame(animateFrame);
  }, [animateFrame]);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const currentTime =
      performance.now() - startTimeRef.current - totalPausedTimeRef.current;
    const currentElapsedTime = currentTime / 1000;
    const currentNoteIndex = Math.floor(currentElapsedTime / beatDuration);

    lastPauseTimeRef.current = performance.now();
    pausedElapsedTimeRef.current = currentElapsedTime;
    pausedNoteIndexRef.current = currentNoteIndex;
    pausedProgressRef.current = calculateProgress(
      currentNoteIndex,
      levelData?.scale?.length || 1
    );

    isPausedRef.current = true;

    setAnimationState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: true,
      progress: pausedProgressRef.current,
      currentNoteIndex: pausedNoteIndexRef.current,
    }));
  }, [beatDuration, levelData?.scale?.length]);

  const handleRestartClick = useCallback(() => {
    stopAnimation();
    isPausedRef.current = false;
    startTimeRef.current = 0;
    lastPlayedNoteRef.current = -1;
    lastPlayedTimeRef.current = 0;

    setAnimationState((prev) => ({
      ...initialAnimationState,
      score: prev.score,
    }));

    setTimeout(() => {
      startAnimation();
    }, 100);
  }, [startAnimation, stopAnimation]);

  const handleStopClick = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    isPausedRef.current = false;
    startTimeRef.current = 0;
    lastPlayedNoteRef.current = -1;
    lastPlayedTimeRef.current = 0;
    pausedProgressRef.current = 0;
    pausedNoteIndexRef.current = 0;
    pausedElapsedTimeRef.current = 0;
    totalPausedTimeRef.current = 0;
    lastPauseTimeRef.current = 0;

    setAnimationState((prev) => ({
      ...initialAnimationState,
      score: prev.score,
    }));

    const resetNotes = allNotes.map((note) => ({
      ...note,
      positionClass: "note-position-0",
    }));
    setVisibleNotes(resetNotes.slice(0, 3));
  }, [allNotes]);

  const updateScore = useCallback((newScore: number) => {
    setAnimationState((prev) => ({ ...prev, score: newScore }));
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      cleanupAudio();
    };
  }, []);

  return {
    animationState,
    visibleNotes,
    startAnimation,
    stopAnimation,
    handleRestartClick,
    handleStopClick,
    updateScore,
  };
};
