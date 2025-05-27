import { useCallback, useEffect, useRef, useState } from "react";

interface AudioContextState {
  context: AudioContext | null;
  isInitialized: boolean;
  isSupported: boolean;
  error: string | null;
}

export const useAudioContext = () => {
  const [state, setState] = useState<AudioContextState>({
    context: null,
    isInitialized: false,
    isSupported: false,
    error: null,
  });

  const contextRef = useRef<AudioContext | null>(null);

  // AudioContext 초기화
  const initializeAudioContext = useCallback(async () => {
    try {
      // 브라우저 지원 확인
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextClass) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          error: "AudioContext not supported in this browser",
        }));
        return null;
      }

      // 이미 초기화된 경우 기존 컨텍스트 반환
      if (contextRef.current && contextRef.current.state !== "closed") {
        return contextRef.current;
      }

      // 새 AudioContext 생성
      const audioContext = new AudioContextClass();

      // 브라우저 정책으로 인해 suspended 상태일 수 있음
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      contextRef.current = audioContext;

      setState({
        context: audioContext,
        isInitialized: true,
        isSupported: true,
        error: null,
      });

      return audioContext;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isInitialized: false,
      }));
      return null;
    }
  }, []);

  // AudioContext 정리
  const cleanupAudioContext = useCallback(async () => {
    if (contextRef.current && contextRef.current.state !== "closed") {
      await contextRef.current.close();
      contextRef.current = null;
      setState({
        context: null,
        isInitialized: false,
        isSupported: true,
        error: null,
      });
    }
  }, []);

  // AudioContext 재시작 (suspended 상태에서 복구)
  const resumeAudioContext = useCallback(async () => {
    if (contextRef.current && contextRef.current.state === "suspended") {
      await contextRef.current.resume();
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (contextRef.current && contextRef.current.state !== "closed") {
        contextRef.current.close();
      }
    };
  }, []);

  // 브라우저 지원 여부 초기 확인
  useEffect(() => {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    setState((prev) => ({
      ...prev,
      isSupported: !!AudioContextClass,
    }));
  }, []);

  return {
    audioContext: state.context,
    isInitialized: state.isInitialized,
    isSupported: state.isSupported,
    error: state.error,
    initializeAudioContext,
    cleanupAudioContext,
    resumeAudioContext,
  };
};
