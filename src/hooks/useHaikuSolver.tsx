
import { useEffect } from "react";
import { useHaikuGameState } from "./useHaikuGameState";
import { useSaveHaiku } from "./useSaveHaiku";
import { Haiku, CompletedHaiku } from "@/types/haiku";

interface HaikuSolverProps {
  currentHaiku: Haiku | null;
  isCompleted: boolean;
  completedHaiku: CompletedHaiku | undefined;
  saveCompletedHaiku: any;
  refetchCompletedHaikus: () => Promise<any>;
  goToNextUnsolved: () => void;
}

export function useHaikuSolver({
  currentHaiku,
  isCompleted,
  completedHaiku,
  saveCompletedHaiku,
  refetchCompletedHaikus,
  goToNextUnsolved
}: HaikuSolverProps) {
  // Game state management
  const {
    gameRef,
    isSolved,
    usedWords,
    verificationState,
    incorrectWords,
    remainingWords,
    displayLines,
    handleDragStart,
    handleWordUse,
    handleWordReturnToPool,
    handleVerification,
    handleNextHaiku
  } = useHaikuGameState({
    currentHaiku,
    completedHaiku
  });

  // Haiku saving functionality
  const { updateCurrentHaikuRef, saveHaiku } = useSaveHaiku({
    currentHaiku,
    isSolved,
    saveCompletedHaiku,
    refetchCompletedHaikus
  });

  // Update current haiku reference when it changes
  useEffect(() => {
    updateCurrentHaikuRef(currentHaiku?.id || null);
  }, [currentHaiku, updateCurrentHaikuRef]);

  // Save haiku when solved but don't auto-navigate
  useEffect(() => {
    if (isSolved && currentHaiku) {
      // Only save, don't trigger any navigation
      saveHaiku();
    }
  }, [isSolved, currentHaiku, saveHaiku]);

  // Handle continuing to next haiku - this is only called when the user
  // explicitly clicks the Continue button
  const handleContinue = () => {
    // First reset the current game state
    handleNextHaiku();
    
    // Then navigate to the next unsolved haiku, but only when explicitly requested
    goToNextUnsolved();
  };

  return {
    gameRef,
    isSolved,
    isCompleted,
    usedWords,
    verificationState,
    incorrectWords,
    remainingWords,
    displayLines,
    handleDragStart,
    handleWordUse,
    handleWordReturnToPool,
    handleVerification,
    handleContinue
  };
}
