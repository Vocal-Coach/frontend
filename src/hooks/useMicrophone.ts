import { useCallback, useEffect, useRef, useState } from "react";
import {
  requestMicrophoneAccess,
  setupPitchDetection,
} from "@/lib/evaluation/evaluationUtils";

export function useMicrophone(
  onPitchDetected: (frequency: number, audioData: Float32Array) => void
) {
  const [isMicActive, setIsMicActive] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const micCleanupRef = useRef<(() => void) | null>(null);

  // 마이크 켜기
  const activateMicrophone = useCallback(async () => {
    try {
      const stream = await requestMicrophoneAccess();
      if (!stream) {
        console.error("마이크 액세스 실패");
        return;
      }

      setHasMicPermission(true);

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();

      const cleanup = setupPitchDetection(
        audioContext,
        stream,
        onPitchDetected
      );
      micCleanupRef.current = () => {
        cleanup();
        stream.getTracks().forEach((track) => track.stop());
      };

      setIsMicActive(true);
    } catch (err) {
      console.error("마이크 활성화 실패:", err);
    }
  }, [onPitchDetected]);

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

  // 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      if (micCleanupRef.current) {
        micCleanupRef.current();
      }
    };
  }, []);

  return {
    isMicActive,
    hasMicPermission,
    toggleMicrophone,
  };
}
