import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}

const MobileFrame: React.FC<MobileFrameProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div 
        className={`w-full max-w-[375px] h-[812px] bg-background text-text-primary rounded-3xl shadow-xl overflow-hidden ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default MobileFrame;