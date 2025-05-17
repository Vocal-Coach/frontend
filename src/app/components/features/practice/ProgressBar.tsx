import React from 'react';

interface ProgressBarProps {
  percent: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percent }) => {
  return (
    <div className="w-full h-2 progress-bar-track-light bg-gray-200 rounded-full overflow-hidden mb-4">
      <div
        className="h-full progress-bar-fill-light bg-indigo-600"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;