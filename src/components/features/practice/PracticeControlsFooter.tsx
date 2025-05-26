"use client";

import React from "react";
import { Play, Pause, RotateCw, Square } from "lucide-react";
import ProgressBar from "./ProgressBar";

interface PracticeControlsFooterProps {
  isPlaying: boolean;
  onPlayPauseClick: () => void;
  onRestartClick: () => void;
  onStopClick: () => void;
  currentNoteIndex: number;
  totalNotes: number;
  currentNoteProgress: number;
}

const PracticeControlsFooter: React.FC<PracticeControlsFooterProps> = ({
  isPlaying,
  onPlayPauseClick,
  onRestartClick,
  onStopClick,
  currentNoteIndex,
  totalNotes,
  currentNoteProgress,
}) => {
  return (
    <div className="p-2 practice-footer-light bg-white border-t border-gray-200">
      <ProgressBar
        currentNoteIndex={currentNoteIndex}
        totalNotes={totalNotes}
        currentNoteProgress={currentNoteProgress}
      />

      <div className="practice-footer-controls flex items-center justify-between px-4 py-1">
        <button
          className="control-button control-button-light restart restart-button-light p-2 rounded-full hover:bg-gray-100"
          title="Restart"
          onClick={onRestartClick}
        >
          <RotateCw className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-grow flex justify-center">
          <button
            className="control-button play-pause play-pause-light bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
            title={isPlaying ? "Pause" : "Play"}
            onClick={onPlayPauseClick}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        <button
          className="control-button control-button-light stop stop-button-light p-2 rounded-full hover:bg-red-50"
          title="Stop"
          onClick={onStopClick}
        >
          <Square className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default PracticeControlsFooter;
