'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'; // lucide-react 라이브러리에서 ArrowLeft 아이콘 임포트 추가
import { levels } from '@/app/lib/levelsData';
import PracticePageLayout from '@/app/components/features/practice/PracticePageLayout';
import PitchStaff from '@/app/components/features/practice/PitchStaff';
import ScoreDisplay from '@/app/components/features/practice/ScoreDisplay';
import InstructionsText from '@/app/components/features/practice/InstructionsText';

interface PracticePageProps {
  params: {
    levelId: string;
  };
}

export default function PracticePage({ params }: PracticePageProps) {
  const router = useRouter();
  const levelId = parseInt(params.levelId);
  
  // Find the level data
  const levelData = levels.find(level => level.id === levelId);
  
  // Handle if level not found
  if (!levelData) {
    return <div>Level not found</div>;
  }
  
  // State for practice controls
  const [selectedRange, setSelectedRange] = useState<string>('female');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(levelId === 1 ? 30 : 10);
  const [score] = useState<number>(levelId === 1 ? 850 : 920);
  
  // Default range options for levels without specific ranges
  const defaultRangeOptions = [
    { label: "Female (C4-C5)", value: 'female' },
    { label: "Male (C3-C4)", value: 'male' },
  ];
  
  // Get range options
  const rangeOptions = levelData.ranges ? [
    { label: `Female (${levelData.ranges.female})`, value: 'female' },
    { label: `Male (${levelData.ranges.male})`, value: 'male' },
  ] : defaultRangeOptions;
  
  // Default display notes for levels without specific notes
  const defaultDisplayNotes = [
    {
      text: "Do",
      pitchClass: "p4-do",
      durationClass: "note-duration-medium",
      positionClass: "note-position-current"
    }
  ];
  
  // Event handlers
  const handleRangeChange = (newRange: string) => {
    setSelectedRange(newRange);
  };
  
  const handlePlayPauseClick = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleRestartClick = () => {
    setIsPlaying(false);
    // In a real app, we would reset the practice state here
  };
  
  const handleStopClick = () => {
    setIsPlaying(false);
    // In a real app, we would stop the practice and save results
  };
  
  const handleBackClick = () => {
    router.push('/levels');
  };
  
  // For levels 3-5, show a coming soon message
  if (levelId >= 3) {
    return (
      <div className="flex flex-col h-full">
        <div className="practice-header-light sticky top-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between p-4">
          <button
            className="back-button p-2 rounded-full hover:bg-gray-100 text-black"
            title="Go back"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-center flex-grow font-semibold text-xl text-gray-800">
            {levelData.title}
          </h2>
          <div className="w-10"></div>
        </div>
        
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <h3 className={`text-xl font-bold ${levelData.accentColor} mb-4`}>Coming Soon!</h3>
          <p className="text-gray-600 mb-6">{levelData.summary}</p>
          <p className="text-gray-500 text-sm">This level is under development and will be available in a future update.</p>
        </div>
      </div>
    );
  }
  
  return (
    <PracticePageLayout
      levelTitle={levelData.title}
      rangeOptions={rangeOptions}
      selectedRange={selectedRange}
      onRangeChange={handleRangeChange}
      isPlaying={isPlaying}
      onPlayPauseClick={handlePlayPauseClick}
      onRestartClick={handleRestartClick}
      onStopClick={handleStopClick}
      progressPercent={progressPercent}
      onBackClick={handleBackClick}
    >
      <div className="w-full max-w-xs text-center">
        <p className="practice-subtext-light text-xs mb-1 text-gray-500">
          Visual Guide: {levelData.visualGuide || "Coming Soon"}
        </p>
        <PitchStaff notesToDisplay={levelData.displayNotes || defaultDisplayNotes} />
      </div>
      
      <ScoreDisplay score={score} />
      
      <InstructionsText
        focusText={levelData.focusText || "Coming soon"}
        rhythmText={levelData.rhythmText || "Coming soon"}
      />
    </PracticePageLayout>
  );
}