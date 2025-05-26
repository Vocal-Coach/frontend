"use client";

import React from "react";
import Button from "@/components/ui/Button";

interface RangeOption {
  label: string;
  value: string;
}

interface RangeSelectorProps {
  options: RangeOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RangeSelector: React.FC<RangeSelectorProps> = ({
  options,
  selectedValue,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="page-practice-range-toggle-group range-toggle-group-light sticky top-[61px] z-10 flex justify-center p-2.5 bg-white border-b border-gray-200">
      {options.map((option, index) => (
        <Button
          key={option.value}
          variant="toggle"
          isActive={option.value === selectedValue}
          onClick={() => !disabled && onChange(option.value)}
          disabled={disabled}
          className={`page-practice-range-toggle-button ${
            index === 0
              ? "rounded-l-lg rounded-r-none border-r-0"
              : "rounded-r-lg rounded-l-none"
          } px-4 py-2 text-sm ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default RangeSelector;
