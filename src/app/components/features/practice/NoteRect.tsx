import React from 'react';

interface NoteRectProps {
  text: string;
  pitchClass: string;
  durationClass: string;
  positionClass: string;
}

const NoteRect: React.FC<NoteRectProps> = ({
  text,
  pitchClass,
  durationClass,
  positionClass,
}) => {
  return (
    <div 
      className={`note-rect note-rect-light ${durationClass} ${positionClass} ${pitchClass} bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm`}
    >
      {text}
    </div>
  );
};

export default NoteRect;