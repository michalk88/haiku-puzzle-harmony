import React, { useRef, useMemo, useState } from "react";
import HaikuGame from "./HaikuGame";
import WordPool from "./WordPool";
import HaikuHeader from "./haiku/HaikuHeader";
import CompletedHaiku from "./haiku/CompletedHaiku";
import LoadingState from "./haiku/LoadingState";
import BottomNavigation from "./BottomNavigation";
import { useHaikuData } from "@/hooks/useHaikuData";
import { useHaikuGame } from "@/hooks/useHaikuGame";
import { useHaikuSession } from "@/hooks/useHaikuSession";
import { shuffleArray } from "@/lib/utils";

const HaikuPuzzle: React.FC = () => {
  const gameRef = useRef<{ 
    handleWordReturn: (word: string) => void;
    handleReset: () => void;
    getCurrentLines: () => string[];
  } | null>(null);
  
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  
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

  const {
    sessionHaikus,
    saveHaikuToSession,
    removeHaikuFromSession,
    getSessionHaiku
  } = useHaikuSession();

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
  const sessionHaiku = getSessionHaiku(currentHaiku.id);

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
    setIsPreviewVisible(false);
    removeHaikuFromSession(currentHaiku.id);
  };

  const handleHaikuSolved = (message: string) => {
    handleSolved(message);
    // Save to session when solved with the actual arranged lines
    const currentLines = gameRef.current?.getCurrentLines();
    if (currentLines) {
      saveHaikuToSession({
        id: currentHaiku.id,
        line1_arrangement: currentLines[0],
        line2_arrangement: currentLines[1],
        line3_arrangement: currentLines[2]
      });
    }
  };

  const showSolvedState = isCompleted || isSolved || (sessionHaiku && isPreviewVisible);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex-1 overflow-y-auto">
        <div className="mb-2">
          <HaikuHeader
            title={currentHaiku.title}
            isCompleted={isCompleted}
            isSolved={isSolved}
            isLastHaiku={currentHaikuIndex === haikus.length - 1}
            onReset={() => resetMutation.mutate(currentHaiku.id)}
            onNextHaiku={handleNextHaiku}
            isResetting={resetMutation.isPending}
            encouragingMessage={isMessageVisible ? encouragingMessage : ""}
            showPreviewButton={sessionHaiku && !isCompleted && !isSolved}
            isPreviewVisible={isPreviewVisible}
            onPreviewToggle={() => setIsPreviewVisible(!isPreviewVisible)}
          />
        </div>

        {showSolvedState ? (
          <CompletedHaiku
            lines={[
              completedHaiku?.line1_arrangement || sessionHaiku?.line1_arrangement || currentHaiku.line1_words,
              completedHaiku?.line2_arrangement || sessionHaiku?.line2_arrangement || currentHaiku.line2_words,
              completedHaiku?.line3_arrangement || sessionHaiku?.line3_arrangement || currentHaiku.line3_words
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
                onSolved={handleHaikuSolved}
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

      <div className="sticky bottom-0 left-0 right-0 z-50">
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
