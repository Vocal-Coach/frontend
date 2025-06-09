import React, { useState, useEffect } from "react";

interface UserPitchMarkerProps {
  frequency: number | null;
  isVisible: boolean;
  selectedRange?: string; // "female" or "male"
}

const UserPitchMarker: React.FC<UserPitchMarkerProps> = ({
  frequency,
  isVisible,
  selectedRange = "female",
}) => {
  const [smoothedFrequency, setSmoothedFrequency] = useState<number | null>(
    null
  );
  const [frequencyHistory, setFrequencyHistory] = useState<number[]>([]);

  // 주파수 스무딩 (이동평균 필터)
  useEffect(() => {
    if (frequency && frequency > 80 && frequency < 2000) {
      // 인간 목소리 범위만
      setFrequencyHistory((prev) => {
        const newHistory = [...prev, frequency].slice(-3); // 최근 3개 값만 유지 (더 빠른 반응)
        const average =
          newHistory.reduce((sum, f) => sum + f, 0) / newHistory.length;
        setSmoothedFrequency(average);
        return newHistory;
      });
    }
  }, [frequency]);

  if (!smoothedFrequency || !isVisible) {
    return null;
  }

  // 주파수를 음표 위치로 변환하는 함수 (음역대별 조정)
  const frequencyToPosition = (freq: number): number => {
    // 음역대별 기본 주파수 설정
    const noteFrequencies =
      selectedRange === "male"
        ? {
            // 남성 음역 (한 옥타브 낮음)
            Do: 130.81, // C3
            Re: 146.83, // D3
            Mi: 164.81, // E3
            Fa: 174.61, // F3
            So: 196.0, // G3
            La: 220.0, // A3
            Ti: 246.94, // B3
            Do2: 261.63, // C4
          }
        : {
            // 여성 음역 (기본)
            Do: 261.63, // C4
            Re: 293.66, // D4
            Mi: 329.63, // E4
            Fa: 349.23, // F4
            So: 392.0, // G4
            La: 440.0, // A4
            Ti: 493.88, // B4
            Do2: 523.25, // C5
          };

    const minFreq = noteFrequencies["Do"];
    const maxFreq = noteFrequencies["Do2"];

    // 주파수가 범위를 벗어나면 클램핑 (더 넓은 범위 허용)
    const clampedFreq = Math.max(minFreq * 0.4, Math.min(maxFreq * 2.5, freq));

    // 로그 스케일로 위치 계산
    const logMin = Math.log(minFreq * 0.4);
    const logMax = Math.log(maxFreq * 2.5);
    const logFreq = Math.log(clampedFreq);

    const position = 90 - ((logFreq - logMin) / (logMax - logMin)) * 80;

    return Math.max(5, Math.min(95, position));
  };

  // 주파수가 목소리 범위인지 확인
  const isVoiceFrequency = (freq: number): boolean => {
    const minVoice = selectedRange === "male" ? 80 : 150; // 남성: 80Hz, 여성: 150Hz
    const maxVoice = selectedRange === "male" ? 500 : 1000; // 남성: 500Hz, 여성: 1000Hz
    return freq >= minVoice && freq <= maxVoice;
  };

  if (!isVoiceFrequency(smoothedFrequency)) {
    return null; // 목소리 범위가 아니면 표시하지 않음
  }

  const topPosition = frequencyToPosition(smoothedFrequency);

  // 목표 음표와의 거리에 따른 색상 결정
  const getMarkerColor = (): string => {
    // 여기서는 기본 빨간색 사용, 나중에 정확도에 따라 색상 변경 가능
    return "bg-red-500";
  };

  return (
    <div
      className="absolute z-20 transition-all duration-100 ease-out"
      style={{
        top: `${topPosition}%`,
        left: "35%", // 타겟 라인 근처 고정 위치
        transform: "translateY(-50%)",
      }}
    >
      <div className="flex items-center">
        {/* 주 마커 (원형) */}
        <div
          className={`w-3 h-3 ${getMarkerColor()} rounded-full border-2 border-white shadow-lg animate-pulse`}
        >
          <div className="w-1 h-1 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* 주파수 표시 라벨 (마커 오른쪽에 표시) */}
        <div
          className={`ml-2 px-2 py-1 ${getMarkerColor()} text-white text-xs rounded-md shadow-md whitespace-nowrap`}
        >
          {smoothedFrequency.toFixed(0)}Hz
        </div>

        {/* 연결선 */}
        <div
          className="absolute left-0 w-8 h-px bg-red-400 opacity-60"
          style={{ top: "50%" }}
        ></div>
      </div>
    </div>
  );
};

export default UserPitchMarker;
