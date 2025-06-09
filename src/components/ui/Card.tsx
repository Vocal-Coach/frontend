"use client";

import React from "react";

interface CardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  accentColorClass?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  icon,
  onClick,
  accentColorClass = "text-indigo-600",
  className = "",
}) => {
  return (
    <div
      className={`bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {icon && (
          <div
            className={`bg-${
              accentColorClass.split("-")[1]
            }-100 p-3 rounded-xl`}
          >
            {icon}
          </div>
        )}
        <div>
          <h3
            className={`text-lg font-semibold ${
              accentColorClass || "text-gray-700"
            } mb-1`}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 leading-snug">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
