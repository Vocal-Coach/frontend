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

  // 동적으로 음표 위치 계산
  const calculateNotePosition = (noteText: string): number => {
    const noteIndex = sortedNotes.indexOf(noteText);
    const totalNotes = sortedNotes.length;

    // 상하 마진을 더 크게 하여 음표들을 중앙에 더 가깝게 배치
    const topMargin = 25;
    const bottomMargin = 25;
    const availableSpace = 100 - topMargin - bottomMargin; // 50%만 사용

    // 음표들 사이의 간격 계산
    const spacing = totalNotes > 1 ? availableSpace / (totalNotes - 1) : 0;

    // bottom 위치 계산 (가장 낮은 음이 bottomMargin에서 시작)
    return bottomMargin + noteIndex * spacing;
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

  // 수평선 생성 함수 (동적으로 음표 위치에 맞춰 생성)
  const renderHorizontalLines = (): JSX.Element[] => {
    const lines: JSX.Element[] = [];
    sortedNotes.forEach((note, index) => {
      const position = 100 - calculateNotePosition(note); // top 위치로 변환
      lines.push(
        <div
          key={`hline-${note}`}
          className="absolute left-0 right-0 h-px bg-gray-200 opacity-30"
          style={{ top: `${position}%` }}
        />
      );
    });
    return lines;
  };

  return (
    <div className="pitch-staff rounded-xl p-2 relative h-[220px] w-full max-w-xs mx-auto">
      {/* 수직 점선 그리드 */}
      {renderVerticalDottedLines()}

      {/* 수평선 그리드 (동적) */}
      {renderHorizontalLines()}

      {/* 타겟 라인 (점선) */}
      {targetLineVisible && (
        <div className="target-line absolute left-[30%] top-0 bottom-0"></div>
      )}

      {/* 음표 (동적 위치 적용) */}
      {notesToDisplay.map((note, index) => (
        <NoteRect
          key={`${index}-${note.text}`}
          text={note.text}
          pitchClass={note.pitchClass}
          durationClass={note.durationClass}
          positionClass={note.positionClass}
          dynamicBottomPosition={calculateNotePosition(note.text)}
        />
      ))}

      {/* 피치 경로 라인 (선택적) */}
      {pitchPathData}
    </div>
  );
};

export default PitchStaff;
