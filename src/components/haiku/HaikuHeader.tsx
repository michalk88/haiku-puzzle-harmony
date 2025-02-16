
import React from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface HaikuHeaderProps {
  title: string;
  isCompleted: boolean;
  isSolved: boolean;
  isLastHaiku: boolean;
  onReset: () => void;
  onNextHaiku: () => void;
  isResetting: boolean;
  encouragingMessage?: string;
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
}) => {
  return (
    <div className="mb-6">
      {encouragingMessage && (
        <div className="text-lg font-medium text-green-500 mb-2 text-center animate-in fade-in duration-300">
          {encouragingMessage}
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${(isCompleted || isSolved) ? 'mx-auto' : ''}`}>
          {title}
        </h2>
        <div className="flex gap-2">
          {isCompleted && (
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
