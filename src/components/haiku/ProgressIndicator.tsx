
import React from "react";

interface ProgressIndicatorProps {
  totalHaikus: number;
  solvedCount: number;
  percentage: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  totalHaikus, 
  solvedCount, 
  percentage 
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600 font-medium">Progress</span>
        <span className="text-sm text-gray-600">
          {solvedCount} / {totalHaikus} solved
        </span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
