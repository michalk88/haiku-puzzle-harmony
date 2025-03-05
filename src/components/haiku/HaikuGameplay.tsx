
import React from "react";
import HaikuGame from "../HaikuGame";
import WordPool from "../WordPool";

interface HaikuGameplayProps {
  currentHaiku: any;
  gameRef: React.RefObject<{
    handleWordReturn: (word: string) => void;
    handleReset: () => void;
    getCurrentLines: () => string[][];
    addWordToNextAvailableSpot: (word: string) => void;
  }>;
  usedWords: Set<string>;
  remainingWords: string[];
  verificationState: 'idle' | 'checking' | 'correct' | 'incorrect' | 'continue';
  incorrectWords: Set<string>;
  onWordUse: (word: string) => void;
  onWordReturn: (word: string, lineIndex?: number) => void;
  onVerify: (currentLines: string[][], solution: string[][]) => void;
  onDragStart: (e: React.DragEvent, word: string) => void;
}

const HaikuGameplay: React.FC<HaikuGameplayProps> = ({
  currentHaiku,
  gameRef,
  usedWords,
  remainingWords,
  verificationState,
  incorrectWords,
  onWordUse,
  onWordReturn,
  onVerify,
  onDragStart
}) => {
  if (!currentHaiku) return null;

  const handleWordTap = (word: string) => {
    console.log("Word tapped:", word);
    if (gameRef.current) {
      gameRef.current.addWordToNextAvailableSpot(word);
    }
  };

  return (
    <>
      <div className="w-full overflow-visible">
        <HaikuGame
          ref={gameRef}
          solution={[
            currentHaiku.line1_words,
            currentHaiku.line2_words,
            currentHaiku.line3_words
          ]}
          usedWords={usedWords}
          onWordUse={onWordUse}
          onWordReturn={onWordReturn}
          onVerify={onVerify}
          incorrectWords={incorrectWords}
          verificationState={verificationState}
        />
      </div>
      
      <div className="mt-4 sm:mt-6 mb-20">
        <WordPool
          words={remainingWords}
          onDragStart={onDragStart}
          onWordReturn={onWordReturn}
          onWordTap={handleWordTap}
        />
      </div>
    </>
  );
};

export default HaikuGameplay;
