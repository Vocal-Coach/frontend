import React from "react";
import NoteRect from "./NoteRect";

interface Note {
  text: string;
  pitchClass: string;
  durationClass: string;
  positionClass: string;
}

interface PitchStaffProps {
  notesToDisplay: Note[];
  targetLineVisible?: boolean;
  pitchPathData?: React.ReactNode;
}

const PitchStaff: React.FC<PitchStaffProps> = ({
  notesToDisplay,
  targetLineVisible = true,
  pitchPathData,
}) => {
  // 음표 높이 순서 정의 (낮은 음부터 높은 음까지)
  const noteOrder = [
    "Do",
    "Re",
    "Mi",
    "Fa",
    "So",
    "La",
    "Ti",
    "Do2",
    "Re2",
    "Mi2",
    "Fa2",
    "So2",
    "La2",
    "Ti2",
    "Do3",
  ];

  // 현재 표시되는 음표들의 고유한 음표 타입들 추출
  const uniqueNotes = Array.from(
    new Set(notesToDisplay.map((note) => note.text))
  );

  // 음표들을 높이 순서로 정렬
  const sortedNotes = uniqueNotes.sort((a, b) => {
    const indexA = noteOrder.indexOf(a);
    const indexB = noteOrder.indexOf(b);
    return indexA - indexB;
  });

  // 그래프 전체의 수직 오프셋 계산 (잘리는 부분만 조정)
  const calculateGraphOffset = (): number => {
    if (sortedNotes.length === 0) return 0;

    // 가장 높은 음의 인덱스 확인
    const highestNoteIndex = noteOrder.indexOf(
      sortedNotes[sortedNotes.length - 1]
    );

    // Do2 (인덱스 7) 이상의 높은 음들만 체크
    if (highestNoteIndex > 7) {
      // 잘릴 수 있는 높은 음의 개수 계산
      const notesAboveDo2 = highestNoteIndex - 7;

      // 각 음표당 25px씩 아래로 이동하여 높은 음들이 보이도록 조정
      return notesAboveDo2 * 25;
    }

    // Do2 이하의 음표들은 그래프 이동 없음
    return 0;
  };

  // 희미한 수직 점선 생성 함수
  const renderVerticalDottedLines = (): JSX.Element[] => {
    const lines: JSX.Element[] = [];
    for (let i = 0; i < 11; i++) {
      const position = i * 10; // 0%, 10%, 20%, ... 100%
      lines.push(
        <div
          key={`vline-${i}`}
          className="absolute top-0 bottom-0 w-px border-l border-dashed border-gray-200 opacity-40"
          style={{ left: `${position}%` }}
        />
      );
    }
    return lines;
  };

  // 수평선 생성 함수 (고정된 위치)
  const renderHorizontalLines = (): JSX.Element[] => {
    const lines: JSX.Element[] = [];
    for (let i = 1; i < 8; i++) {
      const position = i * 12.5; // 12.5%, 25%, 37.5%, ... 87.5%
      lines.push(
        <div
          key={`hline-${i}`}
          className="absolute left-0 right-0 h-px bg-gray-200 opacity-30"
          style={{ top: `${position}%` }}
        />
      );
    }
    return lines;
  };

  const graphOffset = calculateGraphOffset();

  return (
    <div className="pitch-staff rounded-xl p-2 relative h-[220px] w-full max-w-xs mx-auto overflow-hidden">
      {/* 그래프 컨테이너 (오프셋 적용) */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `translateY(${graphOffset}px)` }}
      >
        {/* 수직 점선 그리드 */}
        {renderVerticalDottedLines()}

        {/* 수평선 그리드 (고정) */}
        {renderHorizontalLines()}

        {/* 타겟 라인 (점선) */}
        {targetLineVisible && (
          <div className="target-line absolute left-[30%] top-0 bottom-0"></div>
        )}

        {/* 음표 (원래 CSS 위치 사용) */}
        {notesToDisplay.map((note, index) => (
          <NoteRect
            key={`${index}-${note.text}`}
            text={note.text}
            pitchClass={note.pitchClass}
            durationClass={note.durationClass}
            positionClass={note.positionClass}
          />
        ))}
      </div>

      {/* 피치 경로 라인 (선택적) */}
      {pitchPathData}
    </div>
  );
};

export default PitchStaff;
