'use client';

import React from 'react';
import Button from '@/app/components/ui/Button';

interface RangeOption {
  label: string;
  value: string;
}

interface RangeSelectorProps {
  options: RangeOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const RangeSelector: React.FC<RangeSelectorProps> = ({
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <div className="page-practice-range-toggle-group range-toggle-group-light sticky top-[61px] z-10 flex justify-center p-2.5 bg-white border-b border-gray-200">
      {options.map((option, index) => (
        <Button
          key={option.value}
          variant="toggle"
          isActive={option.value === selectedValue}
          onClick={() => onChange(option.value)}
          className={`page-practice-range-toggle-button ${
            index === 0 
              ? 'rounded-l-lg rounded-r-none border-r-0' 
              : 'rounded-r-lg rounded-l-none'
          } px-4 py-2 text-sm`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default RangeSelector;