'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PracticeHeaderProps {
  title: string;
  onBackClick: () => void;
}

const PracticeHeader: React.FC<PracticeHeaderProps> = ({ title, onBackClick }) => {
  return (
    <div className="practice-header-light sticky top-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between p-4">
      <button
        className="back-button p-2 rounded-full hover:bg-gray-100 text-black"
        title="Go back"
        onClick={onBackClick}
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <h2 className="text-center flex-grow font-semibold text-xl text-gray-800">
        {title}
      </h2>
      <div className="w-10"></div>
    </div>
  );
};

export default PracticeHeader;