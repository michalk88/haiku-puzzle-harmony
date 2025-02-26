
import React from "react";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

interface HaikuHeaderProps {
  title: string;
  isCompleted: boolean;
  isSolved: boolean;
  isLastHaiku: boolean;
  onNextHaiku: () => void;
  encouragingMessage?: string;
  isNextDisabled?: boolean;
}

const HaikuHeader: React.FC<HaikuHeaderProps> = ({
  title,
  encouragingMessage,
}) => {
  return (
    <div className="mb-8 sm:mb-12">
      <div className="h-6 mb-1">
        {encouragingMessage && (
          <div className="text-lg font-medium text-green-500 text-center animate-in fade-in slide-in-from-top-4 duration-300">
            {encouragingMessage}
          </div>
        )}
      </div>
      <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 text-center">
        {title}
      </h2>
    </div>
  );
};

export default HaikuHeader;
