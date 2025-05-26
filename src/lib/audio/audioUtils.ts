/**
 * 오디오 재생 및 처리를 위한 유틸리티 파일
 */

// 음의 주파수 매핑 (A4 = 440Hz 기준)
interface NoteFrequencies {
  [key: string]: number;
}

// 옥타브별 음 주파수 매핑 (C0부터 B8까지)
const NOTE_FREQUENCIES: NoteFrequencies = {
  // 옥타브 3 (남성 목소리 대략적인 범위)
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  // 옥타브 4 (여성 목소리 대략적인 범위 시작)
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  // 옥타브 5
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
};

// 솔페이지(solfege)를 실제 음표로 변환
interface SolfegeToNote {
  [key: string]: string;
}

// 옥타브에 따른 솔페이지와 실제 음표 매핑
export const SOLFEGE_TO_NOTE: { [key: string]: SolfegeToNote } = {
  male: {
    Do: "C3",
    Re: "D3",
    Mi: "E3",
    Fa: "F3",
    So: "G3",
    La: "A3",
    Ti: "B3",
    Do2: "C4",
  },
  female: {
    Do: "C4",
    Re: "D4",
    Mi: "E4",
    Fa: "F4",
    So: "G4",
    La: "A4",
    Ti: "B4",
    Do2: "C5",
  },
};

// 오디오 컨텍스트를 저장할 변수
let audioContext: AudioContext | null = null;

// 오디오 컨텍스트 초기화 함수
export const initAudioContext = (): AudioContext => {
  if (!audioContext) {
    // Safari 브라우저 호환성을 위한 처리
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

// 사운드 합성을 이용한 음 재생 함수
export const playTone = (
  note: string,
  gender: "male" | "female",
  duration: number = 1,
  volume: number = 0.5
): void => {
  const context = initAudioContext();

  // 음 높이를 성별에 따라 매핑
  const noteToPlay = SOLFEGE_TO_NOTE[gender][note];
  const frequency = NOTE_FREQUENCIES[noteToPlay];

  if (!frequency) {
    console.error(`Unknown note: ${note} for gender: ${gender}`);
    return;
  }

  // 오실레이터 생성 (사인파)
  const oscillator = context.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  // 게인 노드 생성 (볼륨 조절용)
  const gainNode = context.createGain();
  gainNode.gain.value = volume;

  // 음이 갑자기 시작/끝나지 않도록 페이드 인/아웃 적용
  const now = context.currentTime;
  const fadeTime = 0.05; // 50ms의 페이드 인/아웃

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + fadeTime);
  gainNode.gain.setValueAtTime(volume, now + duration - fadeTime);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  // 오디오 그래프 연결
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  // 오실레이터 시작 및 정지 설정
  oscillator.start(now);
  oscillator.stop(now + duration);
};

// 사운드 파일을 이용한 음 재생 함수
export const playNoteFromFile = async (
  note: string,
  gender: "male" | "female",
  duration: number = 1
): Promise<void> => {
  const context = initAudioContext();

  // 파일 경로 생성 (예: audio/female/C4.mp3)
  const filePath = `/audio/${gender}/${SOLFEGE_TO_NOTE[gender][note]}.mp3`;

  try {
    // 오디오 파일 가져오기
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load audio file: ${filePath}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);

    // 오디오 소스 생성
    const source = context.createBufferSource();
    source.buffer = audioBuffer;

    // 페이드 인/아웃을 위한 게인 노드
    const gainNode = context.createGain();
    const now = context.currentTime;
    const fadeTime = 0.05;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + fadeTime);

    // 오디오 파일이 설정한 duration보다 길 경우
    if (audioBuffer.duration > duration) {
      gainNode.gain.setValueAtTime(1, now + duration - fadeTime);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
      source.start(now, 0, duration);
    } else {
      // 오디오 파일이 duration보다 짧을 경우, 있는 그대로 재생
      gainNode.gain.setValueAtTime(1, now + audioBuffer.duration - fadeTime);
      gainNode.gain.linearRampToValueAtTime(0, now + audioBuffer.duration);
      source.start(now);
    }

    source.connect(gainNode);
    gainNode.connect(context.destination);
  } catch (error) {
    console.error("Error playing audio file:", error);
    // 파일 재생에 실패하면 합성 소리로 대체
    playTone(note, gender, duration);
  }
};

// 시퀀스 재생을 위한 timeout ID들을 저장할 배열
let sequenceTimeouts: NodeJS.Timeout[] = [];

// 레벨 1 도레미레도 시퀀스 재생 함수 (음표 배열, 성별, 템포(BPM)를 매개변수로 받음)
export const playSequence = (
  notes: string[],
  gender: "male" | "female",
  tempo: number = 60, // BPM (Beats Per Minute)
  onNotePlay?: (index: number) => void, // 각 음이 재생될 때 호출될 콜백 함수
  onSequenceEnd?: () => void // 시퀀스가 끝났을 때 호출될 콜백 함수
): void => {
  // 이전 시퀀스가 있다면 정리
  clearSequence();

  // BPM을 초 단위 길이로 변환 (예: 60 BPM = 1초당 1비트)
  const beatDuration = 60 / tempo;

  // 각 음표의 재생 시간과 콜백 호출
  notes.forEach((note, index) => {
    const timeoutId = setTimeout(() => {
      playTone(note, gender, beatDuration);
      if (onNotePlay) {
        onNotePlay(index);
      }

      // 마지막 음표 재생 후 콜백 호출
      if (index === notes.length - 1 && onSequenceEnd) {
        const endTimeoutId = setTimeout(onSequenceEnd, beatDuration * 1000);
        sequenceTimeouts.push(endTimeoutId);
      }
    }, index * beatDuration * 1000);

    sequenceTimeouts.push(timeoutId);
  });
};

// 시퀀스 재생 중단 함수
export const clearSequence = (): void => {
  sequenceTimeouts.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  sequenceTimeouts = [];
};

// 오디오 컨텍스트 해제 함수
export const cleanupAudio = (): void => {
  // 진행 중인 시퀀스 정리
  clearSequence();

  if (audioContext) {
    audioContext.close().then(() => {
      audioContext = null;
    });
  }
};
