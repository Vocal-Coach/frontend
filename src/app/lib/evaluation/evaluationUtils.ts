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
const SILENCE_THRESHOLD = 0.01; // 입력 에너지가 낮을 때 감지 건너뛰기

const autoCorrelate = (
  buffer: Float32Array,
  sampleRate: number
): number | null => {
  const size = buffer.length;

  // DC 성분 제거를 위한 평균값 계산
  let mean = 0;
  for (let i = 0; i < size; i++) {
    mean += buffer[i];
  }
  mean /= size;

  const autocorrelation = new Float32Array(size);

  // 자동 상관 계산
  for (let lag = 0; lag < size; lag++) {
    let sum = 0;
    for (let i = 0; i < size - lag; i++) {
      const sample = buffer[i] - mean;
      const delayedSample = buffer[i + lag] - mean;
      sum += sample * delayedSample;
    }
    autocorrelation[lag] = sum;
  }

  // 초기 감쇠 이후 최대 피크 찾기
  let lagIndex = 0;
  while (lagIndex < size - 1 && autocorrelation[lagIndex] > autocorrelation[lagIndex + 1]) {
    lagIndex++;
  }

  let peakIndex = -1;
  let peakValue = -Infinity;
  for (let i = lagIndex; i < size; i++) {
    if (autocorrelation[i] > peakValue) {
      peakValue = autocorrelation[i];
      peakIndex = i;
    }
  }

  if (peakIndex <= 0) {
    return null;
  }

  return sampleRate / peakIndex;
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
  gender: 'male' | 'female' = 'female'
): VocalEvaluationResult => {
  // 1. 피치 정확도 계산
  const expectedFrequency =
    getExpectedFrequency(expectedNote, gender) ?? 440;
  const pitchAccuracy = calculatePitchAccuracy(expectedFrequency, userAudioData.frequency);
  
  // 2. 비브라토 품질 계산
  const vibratoQuality = calculateVibratoQuality(userAudioData.samples);
  
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
  onPitchDetected: (frequency: number, audioData: Float32Array) => void
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
  
  // 피치 감지 알고리즘 구현 필요
  // 여기서는 단순화된 방식만 포함
  const detectPitch = () => {
    // 주파수 데이터 가져오기
    analyser.getFloatTimeDomainData(dataArray);

    // 입력 에너지 측정 (RMS)
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sumSquares / bufferLength);

    if (rms >= SILENCE_THRESHOLD) {
      const detectedFrequency = autoCorrelate(dataArray, audioContext.sampleRate);

      if (detectedFrequency) {
        onPitchDetected(detectedFrequency, dataArray);
      }
    }

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