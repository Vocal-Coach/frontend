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
  const pauseTimeRef = useRef<number>(0);
  const lastPlayedNoteRef = useRef<number>(-1);
  const isPausedRef = useRef<boolean>(false);
  const lastPlayedTimeRef = useRef<number>(0);

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

      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp - (pauseTimeRef.current || 0);
        lastPlayedTimeRef.current = timestamp - (pauseTimeRef.current || 0);
      }

      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;
      const currentNoteIndex = Math.floor(elapsedSeconds / beatDuration);

      const notePositionPercent =
        ((elapsedSeconds % beatDuration) / beatDuration) * 100;

      const timeSinceLastPlay = timestamp - lastPlayedTimeRef.current;
      const minTimeBetweenNotes = beatDuration * 1000 * 0.25;

      if (
        currentNoteIndex !== lastPlayedNoteRef.current &&
        notePositionPercent >= 25 &&
        notePositionPercent <= 35 &&
        currentNoteIndex >= 0 &&
        currentNoteIndex < levelData.scale.length &&
        timeSinceLastPlay >= minTimeBetweenNotes
      ) {
        const note = levelData.scale[currentNoteIndex];
        playTone(note, selectedRange as "male" | "female", beatDuration * 0.9);
        lastPlayedNoteRef.current = currentNoteIndex;
        lastPlayedTimeRef.current = timestamp;
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
      setAnimationState((prev) => ({
        ...prev,
        currentNoteIndex,
        progress: calculateProgress(currentNoteIndex, levelData.scale.length),
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
        pauseTimeRef.current = 0;
        lastPlayedTimeRef.current = 0;
      }
    },
    [allNotes, beatDuration, levelData?.scale, selectedRange, tempo]
  );

  const startAnimation = useCallback(() => {
    if (animationFrameRef.current) return;

    if (isPausedRef.current) {
      isPausedRef.current = false;
      setAnimationState((prev) => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
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
      pauseTimeRef.current = 0;
      lastPlayedNoteRef.current = -1;
      lastPlayedTimeRef.current = 0;
    }

    animationFrameRef.current = requestAnimationFrame(animateFrame);
  }, [animateFrame]);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const currentElapsedTime =
      (performance.now() - startTimeRef.current) / 1000;
    pauseTimeRef.current = currentElapsedTime;
    isPausedRef.current = true;

    setAnimationState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: true,
    }));
  }, []);

  const handleRestartClick = useCallback(() => {
    stopAnimation();
    isPausedRef.current = false;
    pauseTimeRef.current = 0;
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
    pauseTimeRef.current = 0;
    startTimeRef.current = 0;
    lastPlayedNoteRef.current = -1;
    lastPlayedTimeRef.current = 0;

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
