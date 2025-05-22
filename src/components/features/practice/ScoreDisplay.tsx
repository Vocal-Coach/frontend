import React from 'react';

interface ScoreDisplayProps {
  score: number;
  label?: string;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, label = 'SCORE' }) => {
  return (
    <div className="score-display text-center">
      <div className="score-label score-label-light text-xs text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className="score-value score-value-light text-3xl font-bold text-gray-800 leading-none">
        {score}
      </div>
    </div>
  );
};

export default ScoreDisplay;