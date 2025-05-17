import React from 'react';
import NoteRect from './NoteRect';

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
  // 희미한 수직 점선 생성 함수
  const renderVerticalDottedLines = () => {
    const lines = [];
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
  
  // 수평선 생성 함수
  const renderHorizontalLines = () => {
    const lines = [];
    for (let i = 1; i < 8; i++) {
      const position = i * 12.5; // 12.5%, 25%, 37.5%, ... 87.5%
      lines.push(
        <div 
          key={`hline-${i}`} 
          className="absolute left-0 right-0 h-px bg-gray-200 opacity-40"
          style={{ top: `${position}%` }}
        />
      );
    }
    return lines;
  };
  
  return (
    <div className="pitch-staff rounded-xl p-2 relative h-[400px] w-full max-w-xs mx-auto">
      {/* 수직 점선 그리드 */}
      {renderVerticalDottedLines()}
      
      {/* 수평선 그리드 */}
      {renderHorizontalLines()}
      
      {/* 타겟 라인 (점선) */}
      {targetLineVisible && (
        <div className="target-line absolute left-[30%] top-0 bottom-0"></div>
      )}

      {/* 음표 */}
      {notesToDisplay.map((note, index) => (
        <NoteRect
          key={`${index}-${note.text}`}
          text={note.text}
          pitchClass={note.pitchClass}
          durationClass={note.durationClass}
          positionClass={note.positionClass}
        />
      ))}

      {/* 피치 경로 라인 (선택적) */}
      {pitchPathData}
    </div>
  );
};

export default PitchStaff;