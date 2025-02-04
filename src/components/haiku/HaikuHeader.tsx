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
}

const HaikuHeader: React.FC<HaikuHeaderProps> = ({
  title,
  isCompleted,
  isSolved,
  isLastHaiku,
  onReset,
  onNextHaiku,
  isResetting,
}) => {
  return (
    <div className="mb-6 flex justify-between items-center">
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
        {!isLastHaiku && isSolved && (
          <Button 
            onClick={onNextHaiku}
            disabled={!isSolved}
          >
            Next Haiku
          </Button>
        )}
      </div>
    </div>
  );
};

export default HaikuHeader;