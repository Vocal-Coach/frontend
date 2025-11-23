/**
 * 음성 평가 유틸리티 함수들
 */

import { NOTE_FREQUENCIES, SOLFEGE_TO_NOTE } from '../audio/audioUtils';

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

// 신호 에너지 임계값 (무음/잡음 필터링용)
const MIN_SIGNAL_ENERGY = 0.01;

// 피치 분석 범위 (Hz)
const MIN_FREQUENCY = 50;
const MAX_FREQUENCY = 1000;

const calculateSignalEnergy = (samples: Float32Array): number => {
  if (!samples.length) return 0;
  let sumSquares = 0;
  for (let i = 0; i < samples.length; i++) {
    sumSquares += samples[i] * samples[i];
  }
  return Math.sqrt(sumSquares / samples.length);
};

const detectFundamentalFrequency = (
  samples: Float32Array,
  sampleRate: number
): number | null => {
  const energy = calculateSignalEnergy(samples);
  if (energy < MIN_SIGNAL_ENERGY) {
    return null;
  }

  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  const normalized = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    normalized[i] = samples[i] - mean;
  }

  const minLag = Math.floor(sampleRate / MAX_FREQUENCY);
  const maxLag = Math.floor(sampleRate / MIN_FREQUENCY);

  let bestLag = 0;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    for (let i = 0; i + lag < normalized.length; i++) {
      correlation += normalized[i] * normalized[i + lag];
    }

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  if (bestLag === 0 || bestCorrelation <= 0) {
    return null;
  }

  return sampleRate / bestLag;
};

export const getExpectedFrequency = (
  solfege: string,
  gender: 'male' | 'female'
): number | undefined => {
  const note = SOLFEGE_TO_NOTE[gender]?.[solfege];
  return note ? NOTE_FREQUENCIES[note] : undefined;
};

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
 * @param sampleRate 샘플링 레이트 (Hz)
 * @returns 비브라토 품질 (0-100%)
 */
export const calculateVibratoQuality = (
  audioSamples: Float32Array,
  sampleRate = 44100
): number => {
  const energy = calculateSignalEnergy(audioSamples);
  if (energy < MIN_SIGNAL_ENERGY) {
    return 0; // 무음 구간 필터링
  }

  const frameSize = Math.min(512, audioSamples.length);
  if (frameSize < 64) return 0;

  const frequencies: number[] = [];

  for (let start = 0; start + frameSize <= audioSamples.length; start += frameSize) {
    const frame = audioSamples.subarray(start, start + frameSize);
    const freq = detectFundamentalFrequency(frame, sampleRate);
    if (freq) {
      frequencies.push(freq);
    }
  }

  if (frequencies.length < 2) {
    return 0;
  }

  const meanFrequency =
    frequencies.reduce((sum, value) => sum + value, 0) / frequencies.length;

  const variance =
    frequencies.reduce((sum, value) => sum + Math.pow(value - meanFrequency, 2), 0) /
    frequencies.length;
  const deviation = Math.sqrt(variance);

  const vibratoDepth = deviation / Math.max(meanFrequency, 1);

  return Math.min(100, vibratoDepth * 200);
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
    frequency: number | null,
    samples: Float32Array,
    sampleRate?: number
  },
  currentScore: number,
  gender: 'male' | 'female' = 'female'
): VocalEvaluationResult => {
  const signalEnergy = calculateSignalEnergy(userAudioData.samples);

  if (userAudioData.frequency === null || userAudioData.frequency <= 0 || signalEnergy < MIN_SIGNAL_ENERGY) {
    return {
      pitchAccuracy: 0,
      vibratoQuality: 0,
      totalScore: currentScore,
      noteHit: false
    };
  }

  // 1. 피치 정확도 계산
  const expectedFrequency =
    getExpectedFrequency(expectedNote, gender) ?? 440;
  const pitchAccuracy = calculatePitchAccuracy(expectedFrequency, userAudioData.frequency);

  // 2. 비브라토 품질 계산
  const vibratoQuality = calculateVibratoQuality(
    userAudioData.samples,
    userAudioData.sampleRate
  );
  
  // 3. 음을 맞췄는지 여부 결정
  const noteHit = pitchAccuracy >= PITCH_ACCURACY_THRESHOLD;
  
  // 4. 점수 계산
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
 * 실시간 피치 감지 설정
 * @param audioContext 오디오 컨텍스트
 * @param stream 미디어 스트림
 * @param onPitchDetected 피치 감지 콜백
 * @returns 정리 함수
 */
export const setupPitchDetection = (
  audioContext: AudioContext,
  stream: MediaStream,
  onPitchDetected: (frequency: number | null, audioData: Float32Array, sampleRate: number) => void
): (() => void) => {
  // 마이크 입력을 오디오 컨텍스트에 연결
  const microphone = audioContext.createMediaStreamSource(stream);

  // 애니메이션 프레임 ID 저장용 변수
  let frameId = 0;
  
  // 분석기 노드 생성
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  
  // 마이크를 분석기에 연결
  microphone.connect(analyser);
  
  const detectPitch = () => {
    // 주파수 데이터 가져오기
    analyser.getFloatTimeDomainData(dataArray);

    const detectedFrequency = detectFundamentalFrequency(dataArray, audioContext.sampleRate);

    // 콜백 호출
    onPitchDetected(detectedFrequency, dataArray, audioContext.sampleRate);
    
    // 다음 프레임에서 다시 감지
    frameId = requestAnimationFrame(detectPitch);
  };
  
  // 감지 시작
  detectPitch();
  
  // 정리 함수 반환
  return () => {
    // 진행 중인 애니메이션 프레임 취소
    cancelAnimationFrame(frameId);

    microphone.disconnect();
    // 필요한 추가 정리 작업
  };
};