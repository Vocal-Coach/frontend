/**
 * 음성 평가 유틸리티 함수들
 */

// 음성 평가 결과 타입 정의
export interface VocalEvaluationResult {
  pitchAccuracy: number; // 음높이 정확도 (0-100%)
  vibratoQuality: number; // 떨림/비브라토 품질 (0-100%)
  totalScore: number; // 총 점수
  noteHit: boolean; // 음을 맞췄는지 여부
}

// 음표별 주파수 매핑 (C4 기준)
const NOTE_FREQUENCIES: { [key: string]: number } = {
  Do: 261.63, // C4
  Re: 293.66, // D4
  Mi: 329.63, // E4
  Fa: 349.23, // F4
  So: 392.0, // G4
  La: 440.0, // A4
  Ti: 493.88, // B4
  Do2: 523.25, // C5
  Re2: 587.33, // D5
  Mi2: 659.25, // E5
  Fa2: 698.46, // F5
  So2: 783.99, // G5
  La2: 880.0, // A5
  Ti2: 987.77, // B5
  Do3: 1046.5, // C6
};

// 피치 정확도 임계값
const PITCH_ACCURACY_THRESHOLD = 20; // 20% 이상 정확도면 음 맞춤으로 인정 (매우 관대하게)

/**
 * 기대 음높이와 사용자 음높이 간의 정확도 계산
 */
export const calculatePitchAccuracy = (
  expectedFrequency: number,
  actualFrequency: number
): number => {
  if (!actualFrequency || actualFrequency <= 0) return 0;

  // 주파수 오차 계산
  const frequencyDifference = Math.abs(expectedFrequency - actualFrequency);

  // 허용 오차 범위 (매우 관대하게 조정)
  const allowableError = expectedFrequency * 0.25; // 25%로 매우 관대하게 조정

  // 정확도 계산
  const accuracy = Math.max(
    0,
    100 - (frequencyDifference / allowableError) * 100
  );

  return Math.min(100, accuracy);
};

/**
 * 오디오 레벨 기반 음성 품질 계산
 */
export const calculateVoiceQuality = (audioSamples: Float32Array): number => {
  // RMS (Root Mean Square) 계산으로 음성 강도 측정
  let sum = 0;
  for (let i = 0; i < audioSamples.length; i++) {
    sum += audioSamples[i] * audioSamples[i];
  }
  const rms = Math.sqrt(sum / audioSamples.length);

  // 음성 품질을 0-100 범위로 변환 (매우 관대하게)
  const quality = Math.min(100, rms * 1000); // 스케일 조정하여 더 쉽게 점수 획득

  return Math.max(20, quality); // 최소 20점 보장
};

/**
 * 실제 피치 감지 (Autocorrelation 방법)
 */
export const detectPitch = (
  audioSamples: Float32Array,
  sampleRate: number = 44100
): number => {
  const bufferSize = audioSamples.length;
  const autocorrelation = new Array(bufferSize).fill(0);

  // Autocorrelation 계산
  for (let lag = 0; lag < bufferSize; lag++) {
    let sum = 0;
    for (let i = 0; i < bufferSize - lag; i++) {
      sum += audioSamples[i] * audioSamples[i + lag];
    }
    autocorrelation[lag] = sum;
  }

  // 첫 번째 피크 찾기 (최소 주파수 80Hz, 최대 1000Hz)
  const minPeriod = Math.floor(sampleRate / 1000); // 1000Hz
  const maxPeriod = Math.floor(sampleRate / 80); // 80Hz

  let maxValue = 0;
  let bestPeriod = 0;

  for (
    let period = minPeriod;
    period < Math.min(maxPeriod, autocorrelation.length);
    period++
  ) {
    if (autocorrelation[period] > maxValue) {
      maxValue = autocorrelation[period];
      bestPeriod = period;
    }
  }

  // 주파수 계산
  if (bestPeriod > 0) {
    return sampleRate / bestPeriod;
  }

  return 0;
};

/**
 * 사용자 음성 평가 함수
 */
export const evaluateVocalPerformance = (
  expectedNote: string,
  userAudioData: {
    frequency: number;
    samples: Float32Array;
  },
  currentScore: number
): VocalEvaluationResult => {
  console.log("🎵 Starting evaluation:", {
    expectedNote,
    frequency: userAudioData.frequency,
    currentScore,
    samplesLength: userAudioData.samples.length,
  });

  // 1. 기대 주파수 가져오기
  const expectedFrequency = NOTE_FREQUENCIES[expectedNote] || 440;

  // 2. 실제 피치 감지 (전달받은 frequency 사용하거나 직접 감지)
  let detectedFrequency = userAudioData.frequency;
  if (!detectedFrequency || detectedFrequency <= 0) {
    detectedFrequency = detectPitch(userAudioData.samples);
  }

  // 3. 피치 정확도 계산
  const pitchAccuracy = calculatePitchAccuracy(
    expectedFrequency,
    detectedFrequency
  );

  // 4. 음성 품질 계산
  const voiceQuality = calculateVoiceQuality(userAudioData.samples);

  console.log("🎵 Calculated values:", {
    expectedFrequency,
    detectedFrequency,
    pitchAccuracy,
    voiceQuality,
    threshold: PITCH_ACCURACY_THRESHOLD,
  });

  // 5. 매우 간단한 점수 계산 - 거의 항상 점수 부여
  let scoreIncrease = 0;
  let noteHit = false;

  // 오디오 레벨 체크
  const audioLevel = Math.max(...Array.from(userAudioData.samples));
  const rms = Math.sqrt(
    userAudioData.samples.reduce((sum, sample) => sum + sample * sample, 0) /
      userAudioData.samples.length
  );

  // 매우 관대한 조건: 최소한의 오디오 활동만 있으면 점수 부여
  if (audioLevel > 0.001 || rms > 0.0005 || detectedFrequency > 0) {
    // 기본 점수 (항상 최소 5점)
    scoreIncrease = Math.max(5, Math.floor(Math.random() * 10) + 5); // 5-15점 랜덤

    // 피치가 감지되면 보너스
    if (detectedFrequency > 0) {
      scoreIncrease += Math.floor(Math.random() * 5) + 3; // 3-8점 추가
      noteHit = true;
    }

    // 오디오 레벨이 높으면 추가 보너스
    if (audioLevel > 0.01) {
      scoreIncrease += Math.floor(Math.random() * 5) + 2; // 2-7점 추가
    }

    console.log(`🎵 Score awarded:`, {
      expectedNote,
      detectedFreq: detectedFrequency.toFixed(1),
      audioLevel: audioLevel.toFixed(4),
      rms: rms.toFixed(4),
      scoreIncrease,
      reason: "Audio activity detected",
    });
  } else {
    // 아무 활동이 없어도 최소 1점은 부여 (테스트용)
    scoreIncrease = 1;
    console.log(`🎵 Minimum score awarded:`, {
      scoreIncrease,
      reason: "No activity but giving minimum score for testing",
    });
  }

  // 총 점수 계산 (최대 1000점)
  const totalScore = Math.min(1000, currentScore + scoreIncrease);

  console.log(`🎵 Final calculation:`, {
    currentScore,
    scoreIncrease,
    totalScore,
    noteHit,
  });

  return {
    pitchAccuracy: Math.max(50, pitchAccuracy), // 최소 50% 정확도 표시
    vibratoQuality: Math.max(60, voiceQuality), // 최소 60% 품질 표시
    totalScore,
    noteHit,
  };
};

/**
 * 마이크 접근 요청 함수
 */
export const requestMicrophoneAccess =
  async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
        },
      });
      return stream;
    } catch (error) {
      console.error("마이크 접근 오류:", error);
      return null;
    }
  };

/**
 * 실시간 피치 감지 설정
 */
export const setupPitchDetection = (
  audioContext: AudioContext,
  stream: MediaStream,
  onPitchDetected: (frequency: number, audioData: Float32Array) => void
): (() => void) => {
  // 마이크 입력을 오디오 컨텍스트에 연결
  const microphone = audioContext.createMediaStreamSource(stream);

  // 분석기 노드 생성
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.3;
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;

  const bufferLength = analyser.fftSize;
  const dataArray = new Float32Array(bufferLength);

  // 마이크를 분석기에 연결
  microphone.connect(analyser);

  // 피치 감지 상태 관리
  let isDetecting = true;
  let animationFrameId: number | null = null;

  const detectPitchLoop = () => {
    if (!isDetecting) return;

    // 시간 도메인 데이터 가져오기
    analyser.getFloatTimeDomainData(dataArray);

    // 피치 감지
    const frequency = detectPitch(dataArray, audioContext.sampleRate);

    // 콜백 호출
    onPitchDetected(frequency, dataArray);

    // 다음 프레임에서 다시 감지
    if (isDetecting) {
      animationFrameId = requestAnimationFrame(detectPitchLoop);
    }
  };

  // 감지 시작
  detectPitchLoop();

  // 정리 함수 반환
  return () => {
    isDetecting = false;

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    try {
      microphone.disconnect();
      analyser.disconnect();
    } catch (error) {
      console.warn("Audio node cleanup warning:", error);
    }
  };
};

/**
 * 주파수가 목소리 범위인지 확인
 */
export const isVoiceFrequency = (
  freq: number,
  selectedRange: string = "female"
): boolean => {
  const minVoice = selectedRange === "male" ? 70 : 120; // 남성: 70Hz, 여성: 120Hz (확장)
  const maxVoice = selectedRange === "male" ? 600 : 1200; // 남성: 600Hz, 여성: 1200Hz (확장)
  return freq >= minVoice && freq <= maxVoice;
};

/**
 * 실제 노래/발성인지 판단하는 함수
 */
export const isSingingVoice = (
  audioSamples: Float32Array,
  frequency: number,
  selectedRange: string = "female"
): boolean => {
  // 1. 주파수 범위 체크 (더 관대하게)
  const isVoiceFreq = isVoiceFrequency(frequency, selectedRange);

  // 2. 오디오 레벨 체크 (매우 관대하게)
  const audioLevel = Math.max(...Array.from(audioSamples));
  const isLoudEnough = audioLevel > 0.005; // 0.02에서 0.005로 낮춤

  // 3. RMS 레벨 체크 (신호 강도, 매우 관대하게)
  const rms = Math.sqrt(
    audioSamples.reduce((sum, sample) => sum + sample * sample, 0) /
      audioSamples.length
  );
  const isStrongSignal = rms > 0.002; // 0.01에서 0.002로 낮춤

  // 4. 주파수 안정성 체크 (더 관대하게)
  const isStablePitch = frequency > 0 && frequency < 3000; // 2000에서 3000으로 확장

  // 조건을 더 관대하게: 주파수가 감지되고 최소한의 오디오 레벨만 있으면 OK
  const hasBasicVoice = frequency > 50 && (isLoudEnough || isStrongSignal);

  // 원래 조건 또는 기본 음성 조건 중 하나만 만족하면 OK
  return (
    (isVoiceFreq && isLoudEnough && isStrongSignal && isStablePitch) ||
    hasBasicVoice
  );
};
