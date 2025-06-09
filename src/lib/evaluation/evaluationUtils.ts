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
const PITCH_ACCURACY_THRESHOLD = 50; // 50% 이상 정확도면 음 맞춤으로 인정 (더 관대하게)

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

  // 허용 오차 범위 (반음 차이는 약 6% 주파수 차이)
  const allowableError = expectedFrequency * 0.15; // 15%로 더 관대하게 조정

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

  // 음성 품질을 0-100 범위로 변환 (더 엄격하게)
  const quality = Math.min(100, rms * 2000); // 스케일 조정하여 더 높은 신호 요구

  return quality;
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

  // 5. 음을 맞췄는지 여부 결정 (더 엄격한 조건)
  const isActuallySinging = isSingingVoice(
    userAudioData.samples,
    detectedFrequency
  );
  const noteHit =
    pitchAccuracy >= PITCH_ACCURACY_THRESHOLD &&
    voiceQuality > 10 &&
    isActuallySinging;

  // 6. 점수 계산
  let scoreIncrease = 0;

  if (noteHit) {
    // 기본 점수 (피치 정확도에 비례)
    const baseScore = Math.max(3, Math.floor(pitchAccuracy / 8)); // 최소 3점, 최대 12점

    // 음성 품질 보너스
    const qualityBonus = Math.max(1, Math.floor(voiceQuality / 15)); // 최소 1점, 최대 6점

    scoreIncrease = baseScore + qualityBonus;

    console.log(`🎵 Score Calculation:`, {
      expectedNote,
      expectedFreq: expectedFrequency.toFixed(1),
      detectedFreq: detectedFrequency.toFixed(1),
      pitchAccuracy: pitchAccuracy.toFixed(1),
      voiceQuality: voiceQuality.toFixed(1),
      isActuallySinging,
      baseScore,
      qualityBonus,
      totalIncrease: scoreIncrease,
    });
  } else {
    // 실제 노래를 하지 않으면 점수 없음
    console.log(`🎵 No score awarded:`, {
      pitchAccuracy: pitchAccuracy.toFixed(1),
      voiceQuality: voiceQuality.toFixed(1),
      isActuallySinging,
      noteHit,
      reason: !isActuallySinging
        ? "Not singing"
        : !noteHit
        ? "Note not hit"
        : "Unknown",
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
    pitchAccuracy,
    vibratoQuality: voiceQuality, // 음성 품질을 비브라토 품질로 사용
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
  // 1. 주파수 범위 체크
  const isVoiceFreq = isVoiceFrequency(frequency, selectedRange);

  // 2. 오디오 레벨 체크
  const audioLevel = Math.max(...Array.from(audioSamples));
  const isLoudEnough = audioLevel > 0.02;

  // 3. RMS 레벨 체크 (신호 강도)
  const rms = Math.sqrt(
    audioSamples.reduce((sum, sample) => sum + sample * sample, 0) /
      audioSamples.length
  );
  const isStrongSignal = rms > 0.01;

  // 4. 주파수 안정성 체크
  const isStablePitch = frequency > 0 && frequency < 2000;

  // 모든 조건을 만족해야 노래로 인정
  return isVoiceFreq && isLoudEnough && isStrongSignal && isStablePitch;
};
