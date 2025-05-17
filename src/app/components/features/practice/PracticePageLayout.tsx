'use client';

import React from 'react';
import PracticeHeader from './PracticeHeader';
import RangeSelector from './RangeSelector';
import PracticeControlsFooter from './PracticeControlsFooter';

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
  progressPercent: number;
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
  progressPercent,
  onBackClick,
}) => {
  return (
    <div className="flex flex-col h-full">
      <PracticeHeader title={levelTitle} onBackClick={onBackClick} />
      
      <RangeSelector
        options={rangeOptions}
        selectedValue={selectedRange}
        onChange={onRangeChange}
      />
      
      <div className="core-practice-area-light bg-white p-4 flex-grow flex flex-col items-center justify-around">
        {children}
      </div>
      
      <PracticeControlsFooter
        isPlaying={isPlaying}
        onPlayPauseClick={onPlayPauseClick}
        onRestartClick={onRestartClick}
        onStopClick={onStopClick}
        progressPercent={progressPercent}
      />
    </div>
  );
};

export default PracticePageLayout;