"use client";

import React from "react";
import PracticeHeader from "./PracticeHeader";
import RangeSelector from "./RangeSelector";
import PracticeControlsFooter from "./PracticeControlsFooter";

interface RangeOption {
  label: string;
  value: string;
}

interface PracticePageLayoutProps {
  levelTitle: string;
  rangeOptions: RangeOption[];
  selectedRange: string;
  onRangeChange: (newRange: string) => void;
  children: React.ReactNode;
  isPlaying: boolean;
  onPlayPauseClick: () => void;
  onRestartClick: () => void;
  onStopClick: () => void;
  currentNoteIndex: number;
  totalNotes: number;
  currentNoteProgress: number;
  onBackClick: () => void;
}

const PracticePageLayout: React.FC<PracticePageLayoutProps> = ({
  levelTitle,
  rangeOptions,
  selectedRange,
  onRangeChange,
  children,
  isPlaying,
  onPlayPauseClick,
  onRestartClick,
  onStopClick,
  currentNoteIndex,
  totalNotes,
  currentNoteProgress,
  onBackClick,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <PracticeHeader title={levelTitle} onBackClick={onBackClick} />

      {/* 범위 선택기 */}
      <RangeSelector
        options={rangeOptions}
        selectedValue={selectedRange}
        onChange={onRangeChange}
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="core-practice-area-light bg-white flex-1 flex flex-col items-center justify-between py-2 overflow-auto">
        {children}
      </div>

      {/* 하단 컨트롤 */}
      <div className="mt-auto">
        <PracticeControlsFooter
          isPlaying={isPlaying}
          onPlayPauseClick={onPlayPauseClick}
          onRestartClick={onRestartClick}
          onStopClick={onStopClick}
          currentNoteIndex={currentNoteIndex}
          totalNotes={totalNotes}
          currentNoteProgress={currentNoteProgress}
        />
      </div>
    </div>
  );
};

export default PracticePageLayout;
