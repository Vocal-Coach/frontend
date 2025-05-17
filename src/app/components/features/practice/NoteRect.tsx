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
  // 음표 색상 매핑 (더 명확하게 구분되는 색상으로 변경)
  const noteColorMap: { [key: string]: string } = {
    'Do': 'bg-blue-500',
    'Re': 'bg-indigo-500', 
    'Mi': 'bg-purple-500',
    'Fa': 'bg-pink-500',
    'So': 'bg-red-500',
    'La': 'bg-orange-500',
    'Ti': 'bg-yellow-500',
    'Do2': 'bg-green-500'
  };

  // 해당 음표에 맞는 색상 가져오기 (기본값은 인디고)
  const bgColor = noteColorMap[text] || 'bg-indigo-500';

  return (
    <div 
      className={`
        note-circle
        ${positionClass} 
        ${pitchClass} 
        ${bgColor}
        text-white 
        text-xs
        font-bold
        shadow-md
        flex items-center justify-center
        transition-all duration-200 ease-linear
      `}
    >
      {text.substring(0, 2)}
    </div>
  );
};

export default NoteRect;