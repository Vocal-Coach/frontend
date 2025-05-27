import { useCallback, useEffect, useRef, useState } from "react";
import {
  requestMicrophoneAccess,
  setupPitchDetection,
} from "@/lib/evaluation/evaluationUtils";
import { useAudioContext } from "./useAudioContext";

export function useMicrophone(
  onPitchDetected: (frequency: number, audioData: Float32Array) => void
) {
  const [isMicActive, setIsMicActive] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const micCleanupRef = useRef<(() => void) | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { audioContext, initializeAudioContext, isSupported, error } =
    useAudioContext();

  // 마이크 켜기
  const activateMicrophone = useCallback(async () => {
    if (isActivating || isMicActive) return;

    try {
      setIsActivating(true);

      if (!isSupported) {
        console.error("AudioContext not supported in this browser");
        return;
      }

      const stream = await requestMicrophoneAccess();
      if (!stream) {
        console.error("마이크 액세스 실패");
        return;
      }

      streamRef.current = stream;
      setHasMicPermission(true);

      // AudioContext 초기화
      const context = await initializeAudioContext();
      if (!context) {
        console.error("AudioContext 초기화 실패");
        return;
      }

      const cleanup = setupPitchDetection(context, stream, onPitchDetected);
      micCleanupRef.current = () => {
        cleanup();
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log(
            `Stopped track: ${track.kind}, state: ${track.readyState}`
          );
        });
        streamRef.current = null;
      };

      setIsMicActive(true);
    } catch (err) {
      console.error("마이크 활성화 실패:", err);
    } finally {
      setIsActivating(false);
    }
  }, [
    onPitchDetected,
    initializeAudioContext,
    isSupported,
    isActivating,
    isMicActive,
  ]);

  // 마이크 끄기
  const deactivateMicrophone = useCallback(() => {
    if (micCleanupRef.current) {
      micCleanupRef.current();
      micCleanupRef.current = null;
    }
    setIsMicActive(false);
  }, []);

  // 토글
  const toggleMicrophone = useCallback(() => {
    if (isMicActive) {
      deactivateMicrophone();
    } else {
      activateMicrophone();
    }
  }, [isMicActive, activateMicrophone, deactivateMicrophone]);

  // 페이지 이동 시 마이크 자동 해제 (한 번만 등록)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (micCleanupRef.current) {
        micCleanupRef.current();
      }
    };

    const handleVisibilityChange = () => {
      // ref를 사용하여 최신 상태 참조
      if (document.hidden && micCleanupRef.current) {
        micCleanupRef.current();
      }
    };

    // 이벤트 리스너 등록 (컴포넌트 마운트 시 한 번만)
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // 이벤트 리스너 정리
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // 마이크 정리
      if (micCleanupRef.current) {
        micCleanupRef.current();
      }
    };
  }, []); // 🎯 빈 의존성 배열로 한 번만 실행

  return {
    isMicActive,
    hasMicPermission,
    isActivating,
    toggleMicrophone,
  };
}
