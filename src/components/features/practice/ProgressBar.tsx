import React from "react";

interface ProgressBarProps {
  currentNoteIndex: number;
  totalNotes: number;
  currentNoteProgress: number; // 현재 음표 내에서의 진행도 (0-100)
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentNoteIndex,
  totalNotes,
  currentNoteProgress,
}) => {
  return (
    <div className="w-full mb-4 px-2">
      <div className="flex gap-1">
        {Array.from({ length: totalNotes }, (_, index) => {
          let fillPercentage = 0;

          if (index < currentNoteIndex) {
            // 이미 완료된 음표들
            fillPercentage = 100;
          } else if (index === currentNoteIndex) {
            // 현재 진행 중인 음표
            fillPercentage = currentNoteProgress;
          }
          // 아직 시작되지 않은 음표들은 0% (기본값)

          return (
            <div
              key={index}
              className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ease-out ${
                  index < currentNoteIndex
                    ? "bg-indigo-600"
                    : index === currentNoteIndex
                    ? "bg-indigo-500"
                    : "bg-gray-200"
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
