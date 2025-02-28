
import React, { useRef, useMemo, useEffect } from "react";
import HaikuGame from "./HaikuGame";
import WordPool from "./WordPool";
import HaikuHeader from "./haiku/HaikuHeader";
import CompletedHaiku from "./haiku/CompletedHaiku";
import LoadingState from "./haiku/LoadingState";
import { useHaikuData } from "../hooks/useHaikuData";
import { useHaikuGame } from "../hooks/useHaikuGame";
import { shuffleArray } from "../lib/utils";

interface HaikuPuzzleProps {
  onSolvedCountChange?: (count: number) => void;
}

const HaikuPuzzle: React.FC<HaikuPuzzleProps> = ({ onSolvedCountChange }) => {
  const gameRef = useRef<{ 
    handleWordReturn: (word: string) => void;
    handleReset: () => void;
    getCurrentLines: () => string[][];
  } | null>(null);
  
  const {
    haikus,
    completedHaikus,
    isLoadingHaikus,
    isLoadingCompleted,
  } = useHaikuData();

  const {
    draggedWord,
    usedWords,
    currentHaikuIndex,
    isSolved,
    encouragingMessage,
    isMessageVisible,
    verificationState,
    incorrectWords,
    solvedCount,
    handleDragStart,
    handleWordUse,
    handleWordReturn,
    handleVerify,
    handleNextHaiku,
  } = useHaikuGame();

  // Sync the solvedCount with the parent component
  useEffect(() => {
    if (onSolvedCountChange) {
      onSolvedCountChange(solvedCount);
    }
  }, [solvedCount, onSolvedCountChange]);

  const availableWords = useMemo(() => {
    if (!haikus || haikus.length === 0) return [];
    
    const currentHaiku = haikus[currentHaikuIndex];
    const words = [
      ...currentHaiku.line1_words,
      ...currentHaiku.line2_words,
      ...currentHaiku.line3_words
    ];
    return shuffleArray(words);
  }, [haikus, currentHaikuIndex]);

  if (isLoadingHaikus || isLoadingCompleted) {
    return <LoadingState />;
  }

  if (!haikus || haikus.length === 0) {
    return <div>No haikus available</div>;
  }

  const currentHaiku = haikus[currentHaikuIndex];
  const isCompleted = completedHaikus?.some(ch => ch.haiku_id === currentHaiku.id);
  const completedHaiku = completedHaikus?.find(ch => ch.haiku_id === currentHaiku.id);

  const remainingWords = availableWords.filter(word => !usedWords.has(word));

  const handleWordReturnToPool = (word: string, lineIndex?: number) => {
    console.log("HaikuPuzzle - Word returned to pool:", word, "from line:", lineIndex);
    gameRef.current?.handleWordReturn(word);
    handleWordReturn(word);
  };

  const handleVerification = (currentLines: string[][], solution: string[][]) => {
    handleVerify(currentLines, solution);
  };

  const showSolvedState = isCompleted || isSolved;

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 py-6 sm:py-8 flex-1">
        <div className="mb-2">
          <HaikuHeader
            title={currentHaiku.title}
            isCompleted={isCompleted}
            isSolved={isSolved}
            isLastHaiku={currentHaikuIndex === haikus.length - 1}
            onNextHaiku={handleNextHaiku}
            encouragingMessage={isMessageVisible ? encouragingMessage : ""}
            isNextDisabled={!isSolved && !isCompleted}
          />
        </div>

        {showSolvedState ? (
          <CompletedHaiku
            lines={[
              completedHaiku?.line1_arrangement || currentHaiku.line1_words,
              completedHaiku?.line2_arrangement || currentHaiku.line2_words,
              completedHaiku?.line3_arrangement || currentHaiku.line3_words
            ]}
            onNextHaiku={handleNextHaiku}
          />
        ) : (
          <>
            <div className="w-full overflow-visible">
              <HaikuGame
                ref={gameRef}
                key={currentHaikuIndex}
                solution={[
                  currentHaiku.line1_words,
                  currentHaiku.line2_words,
                  currentHaiku.line3_words
                ]}
                usedWords={usedWords}
                onWordUse={handleWordUse}
                onWordReturn={handleWordReturnToPool}
                onVerify={handleVerification}
                incorrectWords={incorrectWords}
                verificationState={verificationState}
              />
            </div>
            
            <div className="mt-4 sm:mt-6 mb-20">
              <WordPool
                words={remainingWords}
                onDragStart={handleDragStart}
                onWordReturn={handleWordReturnToPool}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HaikuPuzzle;
