
import React, { useRef, useMemo } from "react";
import HaikuGame from "./HaikuGame";
import WordPool from "./WordPool";
import HaikuHeader from "./haiku/HaikuHeader";
import CompletedHaiku from "./haiku/CompletedHaiku";
import LoadingState from "./haiku/LoadingState";
import BottomNavigation from "./BottomNavigation";
import { useHaikuData } from "@/hooks/useHaikuData";
import { useHaikuGame } from "@/hooks/useHaikuGame";
import { shuffleArray } from "@/lib/utils";

const HaikuPuzzle: React.FC = () => {
  const gameRef = useRef<{ 
    handleWordReturn: (word: string) => void;
    handleReset: () => void;
  } | null>(null);
  
  const {
    haikus,
    completedHaikus,
    isLoadingHaikus,
    isLoadingCompleted,
    resetMutation
  } = useHaikuData();

  const {
    draggedWord,
    usedWords,
    currentHaikuIndex,
    isSolved,
    encouragingMessage,
    isMessageVisible,
    handleDragStart,
    handleWordUse,
    handleWordReturn,
    handleReset: handleGameReset,
    handleSolved,
    handleNextHaiku,
    handlePreviousHaiku
  } = useHaikuGame();

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

  const handleResetClick = () => {
    console.log("HaikuPuzzle - Reset clicked");
    gameRef.current?.handleReset();
    handleGameReset();
  };

  return (
    <div className="relative w-full mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-28">
      <div className="max-w-2xl mx-auto">
        <HaikuHeader
          title={currentHaiku.title}
          isCompleted={isCompleted}
          isSolved={isSolved}
          isLastHaiku={currentHaikuIndex === haikus.length - 1}
          onReset={() => resetMutation.mutate(currentHaiku.id)}
          onNextHaiku={handleNextHaiku}
          isResetting={resetMutation.isPending}
          encouragingMessage={isMessageVisible ? encouragingMessage : ""}
        />

        {isCompleted || isSolved ? (
          <CompletedHaiku
            lines={[
              completedHaiku?.line1_arrangement || currentHaiku.line1_words,
              completedHaiku?.line2_arrangement || currentHaiku.line2_words,
              completedHaiku?.line3_arrangement || currentHaiku.line3_words
            ]}
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
                onSolved={handleSolved}
              />
            </div>
            
            <div className="mt-6 sm:mt-8 mb-24">
              <WordPool
                words={remainingWords}
                onDragStart={handleDragStart}
                onWordReturn={handleWordReturnToPool}
              />
            </div>
          </>
        )}

        <BottomNavigation
          onPrevious={handlePreviousHaiku}
          onNext={handleNextHaiku}
          onReset={handleResetClick}
          showPrevious={currentHaikuIndex > 0}
          isNextDisabled={!isSolved && !isCompleted}
          isResetting={resetMutation.isPending}
        />
      </div>
    </div>
  );
};

export default HaikuPuzzle;
