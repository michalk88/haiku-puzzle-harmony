
import React from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface BottomNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
  showPrevious: boolean;
  isNextDisabled: boolean;
  isResetting: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onPrevious,
  onNext,
  onReset,
  showPrevious,
  isNextDisabled,
  isResetting
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm border-t border-gray-200">
      <div className="container mx-auto px-4 h-20 flex items-center justify-center gap-4">
        {showPrevious && (
          <Button 
            onClick={onPrevious}
            className="w-12 h-12 rounded-full p-0 shadow-lg hover:shadow-xl 
                     transition-all duration-200 bg-black hover:bg-gray-900 
                     transform hover:-translate-y-1"
            aria-label="Previous Haiku"
          >
            <ChevronLeft className="h-6 w-6 text-white" strokeWidth={3} />
          </Button>
        )}
        <Button 
          onClick={onReset}
          className="w-12 h-12 rounded-full p-0 shadow-lg hover:shadow-xl 
                   transition-all duration-200 bg-black hover:bg-gray-900 
                   transform hover:-translate-y-1 disabled:opacity-30 
                   disabled:transform-none disabled:shadow-none disabled:hover:bg-black"
          aria-label="Reset Haiku"
          disabled={isResetting}
        >
          <RefreshCw className="h-6 w-6 text-white" strokeWidth={3} />
        </Button>
        <Button 
          onClick={onNext}
          className="w-12 h-12 rounded-full p-0 shadow-lg hover:shadow-xl 
                   transition-all duration-200 bg-black hover:bg-gray-900 
                   transform hover:-translate-y-1 disabled:opacity-30 
                   disabled:transform-none disabled:shadow-none disabled:hover:bg-black"
          aria-label="Next Haiku"
          disabled={isNextDisabled}
        >
          <ChevronRight className="h-6 w-6 text-white" strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
};

export default BottomNavigation;
