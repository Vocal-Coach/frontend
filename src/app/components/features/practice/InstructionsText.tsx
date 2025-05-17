import React from 'react';

interface InstructionsTextProps {
  visualGuideText?: string;
  focusText: string;
  rhythmText: string;
}

const InstructionsText: React.FC<InstructionsTextProps> = ({
  visualGuideText,
  focusText,
  rhythmText,
}) => {
  return (
    <div className="text-center">
      {visualGuideText && (
        <p className="practice-subtext-light text-xs mb-0.5 text-gray-500">
          {visualGuideText}
        </p>
      )}
      <p className="text-sm font-medium practice-text-light text-gray-700">
        {focusText}
      </p>
      <p className="text-xs practice-subtext-light mt-0.5 text-gray-500">
        Rhythm: {rhythmText}
      </p>
    </div>
  );
};

export default InstructionsText;