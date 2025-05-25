/**
 * 음표 애니메이션을 위한 유틸리티 파일
 */

// 애니메이션 타입 정의
export type AnimationState = {
  currentNoteIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  score: number;
  currentTime: number; // 현재 경과 시간 (전체 애니메이션 기준)
};

// 초기 애니메이션 상태
export const initialAnimationState: AnimationState = {
  currentNoteIndex: 0,
  isPlaying: false,
  isPaused: false,
  progress: 0,
  score: 0,
  currentTime: 0,
};

// 음표의 위치를 계산하는 함수 (모든 음표가 동시에 움직이도록)
export const calculateNotePosition = (
  noteIndex: number, // 음표 인덱스
  currentTime: number, // 현재 애니메이션 시간
  tempo: number, // 템포 (BPM)
  noteCount: number // 전체 음표 수
): string => {
  // 노트가 화면에 표시되기 시작하는 시간 (인덱스별로 다름)
  const beatDuration = 60 / tempo; // 초당 비트 수
  const noteStartTime = noteIndex * beatDuration;

  // 노트의 현재 상대적 위치 계산 (0: 오른쪽 끝, 1: 왼쪽 끝)
  // 노트가 화면에 들어오기 전에는 오른쪽 밖에 있음
  const timeDiff = currentTime - noteStartTime;

  if (timeDiff < -2 * beatDuration) {
    // 아직 화면에 들어올 시간이 안됨 (완전히 숨김)
    return "hidden";
  }

  if (timeDiff < -beatDuration) {
    // 곧 화면에 들어올 예정 (오른쪽 끝에 대기)
    return "note-position-next-2";
  }

  if (timeDiff > 2 * beatDuration) {
    // 이미 화면을 지나감 (왼쪽으로 사라짐)
    return "hidden";
  }

  if (timeDiff > beatDuration) {
    // 타겟 라인을 지나 왼쪽으로 이동 중
    return "note-position-prev";
  }

  // 타겟 라인을 향해 오른쪽에서 왼쪽으로 이동 중
  // 위치를 0%~100% 범위로 매핑
  // -beatDuration: 오른쪽 끝(0%), beatDuration: 왼쪽 끝(100%)
  const position = ((timeDiff + beatDuration) / (2 * beatDuration)) * 100;
  const clampedPosition = Math.min(100, Math.max(0, position));

  // 가장 가까운 5단위로 반올림 (스타일 클래스 매핑을 위해)
  return `note-position-${Math.round(clampedPosition / 5) * 5}`;
};

// 현재 재생 중인 음표 인덱스 계산
export const calculateCurrentNoteIndex = (
  currentTime: number,
  tempo: number
): number => {
  const beatDuration = 60 / tempo; // 초당 비트 수
  return Math.floor(currentTime / beatDuration);
};

// 애니메이션 진행 상태에 따른 진행도 계산 함수
export const calculateProgress = (
  currentNoteIndex: number,
  totalNotes: number
): number => {
  // 음표별 진행도 비율 계산 (마지막 음표는 100%)
  if (totalNotes <= 1) return 0;
  return Math.min(100, (currentNoteIndex / totalNotes) * 100);
};

// 레벨에 따른 점수 계산 함수 (임의 값, 실제 구현에서는 사용자 정확도에 따라 조정)
export const calculateScore = (
  levelId: number,
  currentNoteIndex: number,
  totalNotes: number
): number => {
  // 임의의 점수 계산 (실제 구현에서는 사용자 정확도로 대체)
  const baseScore = levelId === 1 ? 800 : 900;
  const progress = currentNoteIndex / totalNotes;

  return Math.floor(baseScore + progress * 100 + Math.random() * 50);
};
