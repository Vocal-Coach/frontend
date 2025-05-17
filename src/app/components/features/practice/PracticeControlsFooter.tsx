'use client';

import React from 'react';
import { Play, Pause, RotateCw, Square } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface PracticeControlsFooterProps {
  isPlaying: boolean;
  onPlayPauseClick: () => void;
  onRestartClick: () => void;
  onStopClick: () => void;
  progressPercent: number;
}

const PracticeControlsFooter: React.FC<PracticeControlsFooterProps> = ({
  isPlaying,
  onPlayPauseClick,
  onRestartClick,
  onStopClick,
  progressPercent,
}) => {
  return (
    <div className="p-4 practice-footer-light bg-white border-t border-gray-200">
      <ProgressBar percent={progressPercent} />
      
      <div className="practice-footer-controls flex items-center justify-between px-6 py-2">
        <button
          className="control-button control-button-light restart restart-button-light p-2 rounded-full hover:bg-gray-100"
          title="Restart"
          onClick={onRestartClick}
        >
          <RotateCw className="w-6 h-6 text-gray-600" />
        </button>
        
        <div className="flex-grow flex justify-center">
          <button
            className="control-button play-pause play-pause-light bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
            title={isPlaying ? "Pause" : "Play"}
            onClick={onPlayPauseClick}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white" />
            )}
          </button>
        </div>
        
        <button
          className="control-button control-button-light stop stop-button-light p-2 rounded-full hover:bg-red-50"
          title="Stop"
          onClick={onStopClick}
        >
          <Square className="w-6 h-6 text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default PracticeControlsFooter;