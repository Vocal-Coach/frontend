/**
 * 음성 평가 유틸리티 함수들
 */

import { NOTE_FREQUENCIES, SOLFEGE_TO_NOTE } from "@/lib/audio/audioUtils";

// 음성 평가 결과 타입 정의
export interface VocalEvaluationResult {
  pitchAccuracy: number;   // 음높이 정확도 (0-100%)
  vibratoQuality: number;  // 떨림/비브라토 품질 (0-100%)
  totalScore: number;      // 총 점수
  noteHit: boolean;        // 음을 맞췄는지 여부
}

// 피치 정확도 임계값 (실제 구현 시 조정 필요)
const PITCH_ACCURACY_THRESHOLD = 85; // 85% 이상 정확도면 음 맞춤으로 인정

// 진동수 품질 임계값 (실제 구현 시 조정 필요)
const VIBRATO_QUALITY_THRESHOLD = 70; // 70% 이상이면 좋은 비브라토로 인정

/**
 * 기대 음높이와 사용자 음높이 간의 정확도 계산
 * 
 * @param expectedFrequency 기대 주파수 (Hz)
 * @param actualFrequency 실제 사용자 주파수 (Hz)
 * @returns 정확도 (0-100%)
 */
export const calculatePitchAccuracy = (
  expectedFrequency: number, 
  actualFrequency: number
): number => {
  // 주파수 오차 계산
  const frequencyDifference = Math.abs(expectedFrequency - actualFrequency);
  
  // 허용 오차 범위 (반음 차이는 약 6% 주파수 차이)
  const allowableError = expectedFrequency * 0.06;
  
  // 정확도 계산 (오차가 없으면 100%, 반음 차이면 0%)
  const accuracy = Math.max(0, 100 - (frequencyDifference / allowableError) * 100);
  
  return Math.min(100, accuracy);
};

/**
 * 비브라토(떨림) 품질 계산
 * 실제 구현에서는 FFT 등을 사용하여 진동수 특성을 분석해야 함
 * 
 * @param audioSamples 오디오 샘플 데이터
 * @returns 비브라토 품질 (0-100%)
 */
export const calculateVibratoQuality = (audioSamples: Float32Array): number => {
  // 실제 구현에서는 FFT 분석 필요
  // 임시 구현: 무작위 품질 반환 (실제 구현 시 교체 필요)
  return Math.random() * 100;
};

/**
 * 사용자 음성 평가 함수
 * 
 * @param expectedNote 기대하는 음표 (솔페이지)
 * @param userAudioData 사용자 오디오 데이터
 * @param currentScore 현재 점수
 * @returns 평가 결과
 */
export const evaluateVocalPerformance = (
  expectedNote: string,
  userAudioData: {
    frequency: number,
    samples: Float32Array
  },
  currentScore: number,
  gender: "male" | "female"
): VocalEvaluationResult => {
  // 1. 기대 주파수 계산
  const noteKey = SOLFEGE_TO_NOTE[gender][expectedNote];
  const expectedFrequency = NOTE_FREQUENCIES[noteKey];
  if (!expectedFrequency) {
    console.warn(`Unknown expected note: ${expectedNote} for gender: ${gender}`);
    return {
      pitchAccuracy: 0,
      vibratoQuality: 0,
      totalScore: currentScore,
      noteHit: false,
    };
  }

  // 2. 피치 정확도 계산
  const pitchAccuracy = calculatePitchAccuracy(
    expectedFrequency,
    userAudioData.frequency
  );

  // 3. 비브라토 품질 계산
  const vibratoQuality = calculateVibratoQuality(userAudioData.samples);

  // 4. 음을 맞췄는지 여부 결정
  const noteHit = pitchAccuracy >= PITCH_ACCURACY_THRESHOLD;

  // 5. 점수 계산
  // - 음을 맞추면 기본 10점
  // - 비브라토 품질에 따라 추가 점수 (최대 10점)
  let scoreIncrease = 0;
  
  if (noteHit) {
    scoreIncrease += 10; // 기본 점수
    
    // 비브라토 품질에 따른 추가 점수
    if (vibratoQuality >= VIBRATO_QUALITY_THRESHOLD) {
      const extraPoints = Math.floor((vibratoQuality - VIBRATO_QUALITY_THRESHOLD) / 10);
      scoreIncrease += extraPoints;
    }
  }
  
  // 총 점수 계산
  const totalScore = currentScore + scoreIncrease;
  
  return {
    pitchAccuracy,
    vibratoQuality,
    totalScore,
    noteHit
  };
};

/**
 * 마이크 접근 요청 함수
 * @returns MediaStream 또는 null
 */
export const requestMicrophoneAccess = async (): Promise<MediaStream | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (error) {
    console.error('마이크 접근 오류:', error);
    return null;
  }
};

/**
 * 오토코릴레이션을 사용한 기본 피치 감지 알고리즘
 * @param buffer 오디오 데이터
 * @param sampleRate 샘플링 레이트
 * @returns 감지된 주파수(Hz) 또는 null
 */
const autoCorrelate = (
  buffer: Float32Array,
  sampleRate: number
): number | null => {
  const SIZE = buffer.length;
  let sum = 0;
  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    sum += val * val;
  }
  const rms = Math.sqrt(sum / SIZE);
  if (rms < 0.01) return null;

  let r1 = 0;
  let r2 = SIZE - 1;
  for (let i = 0; i < SIZE / 2 && Math.abs(buffer[i]) < 0.2; i++) {
    r1 = i;
  }
  for (let i = 1; i < SIZE / 2 && Math.abs(buffer[SIZE - i]) < 0.2; i++) {
    r2 = SIZE - i;
  }

  const trimmed = buffer.slice(r1, r2);
  const trimmedSize = trimmed.length;
  const c = new Array(trimmedSize).fill(0);
  for (let lag = 0; lag < trimmedSize; lag++) {
    for (let i = 0; i < trimmedSize - lag; i++) {
      c[lag] += trimmed[i] * trimmed[i + lag];
    }
  }
  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < trimmedSize; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  if (maxpos === 0) return null;

  const frequency = sampleRate / maxpos;
  return frequency;
};

/**
 * 실시간 피치 감지 설정
 * @param audioContext 오디오 컨텍스트
 * @param stream 미디어 스트림
 * @param onPitchDetected 피치 감지 콜백
 * @returns 정리 함수
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
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  
  // 마이크를 분석기에 연결
  microphone.connect(analyser);
  
  // 오토코릴레이션을 이용한 피치 감지
  const detectPitch = () => {
    // 주파수 데이터 가져오기
    analyser.getFloatTimeDomainData(dataArray);

    const frequency = autoCorrelate(dataArray, audioContext.sampleRate);

    // 콜백 호출
    if (frequency) {
      onPitchDetected(frequency, dataArray);
    }
    
    // 다음 프레임에서 다시 감지
    requestAnimationFrame(detectPitch);
  };
  
  // 감지 시작
  detectPitch();
  
  // 정리 함수 반환
  return () => {
    microphone.disconnect();
    // 필요한 추가 정리 작업
  };
};