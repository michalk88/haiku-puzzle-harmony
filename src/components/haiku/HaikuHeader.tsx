
import React from "react";
import { Button } from "../ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface HaikuHeaderProps {
  title: string;
  isCompleted: boolean;
  isSolved: boolean;
  isLastHaiku: boolean;
  onReset: () => void;
  onNextHaiku: () => void;
  isResetting: boolean;
  encouragingMessage?: string;
  showPreviewButton?: boolean;
  isPreviewVisible?: boolean;
  onPreviewToggle?: () => void;
}

const HaikuHeader: React.FC<HaikuHeaderProps> = ({
  title,
  isCompleted,
  isSolved,
  isLastHaiku,
  onReset,
  onNextHaiku,
  isResetting,
  encouragingMessage,
  showPreviewButton,
  isPreviewVisible,
  onPreviewToggle,
}) => {
  return (
    <div className="mb-2 sm:mb-4">
      <div className="h-6 mb-1">
        {encouragingMessage && (
          <div className="text-lg font-medium text-green-500 text-center animate-in fade-in slide-in-from-top-4 duration-300">
            {encouragingMessage}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-medium text-gray-600 text-center flex-1">
          {title}
        </h2>
        <div className="flex gap-2 ml-4">
          {showPreviewButton && (
            <Button
              variant="outline"
              size="icon"
              onClick={onPreviewToggle}
              className="w-9 h-9"
            >
              {isPreviewVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
          {(isCompleted || isSolved) && (
            <Button 
              variant="outline"
              onClick={onReset}
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Reset'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HaikuHeader;
