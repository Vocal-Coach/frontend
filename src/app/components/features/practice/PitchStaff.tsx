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
  return (
    <div className="pitch-staff pitch-staff-light rounded-lg p-2 relative bg-gray-50 h-70 w-full max-w-xs mx-auto">
      {targetLineVisible && (
        <div className="target-line target-line-light absolute left-[30%] top-0 bottom-0 w-0.5 bg-amber-400 z-10"></div>
      )}

      {/* Staff lines */}
      <div className="absolute top-1/4 left-0 right-0 h-px staff-line-light border-b border-gray-300"></div>
      <div className="absolute top-1/2 left-0 right-0 h-px staff-line-light border-b border-gray-300"></div>
      <div className="absolute top-3/4 left-0 right-0 h-px staff-line-light border-b border-gray-300"></div>

      {/* Notes */}
      {notesToDisplay.map((note, index) => (
        <NoteRect
          key={index}
          text={note.text}
          pitchClass={note.pitchClass}
          durationClass={note.durationClass}
          positionClass={note.positionClass}
        />
      ))}

      {/* Pitch path lines */}
      {pitchPathData || (
        <svg className="pitch-path-line pitch-path-line-light absolute top-0 left-0 w-full h-full" viewBox="0 0 100 280" preserveAspectRatio="none">
          <path d="M calc(25% - 40px + 40px) calc(100% - 60% - 15px) L calc(60% - 25px) calc(100% - 40% - 15px)" stroke="#4338ca" strokeWidth="2" fill="none" strokeDasharray="4" />
          <path d="M calc(60% - 25px + 50px) calc(100% - 40% - 15px) L calc(95% - 40px) calc(100% - 20% - 15px)" stroke="#4338ca" strokeWidth="2" fill="none" strokeDasharray="4" />
        </svg>
      )}
    </div>
  );
};

export default PitchStaff;