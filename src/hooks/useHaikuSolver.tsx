
import { useEffect, useRef } from "react";
import { useHaikuGameState } from "./useHaikuGameState";
import { useSaveHaiku } from "./useSaveHaiku";
import { Haiku, CompletedHaiku } from "@/types/haiku";
import { useToast } from "./use-toast";

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
  const navigationRef = useRef(false);
  const { toast } = useToast();

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
    // Reset navigation flag when haiku changes
    navigationRef.current = false;
  }, [currentHaiku, updateCurrentHaikuRef]);

  // Save haiku when solved and show congratulations toast
  useEffect(() => {
    if (isSolved && currentHaiku && !navigationRef.current) {
      // Show toast when haiku is solved
      toast({
        title: "Congratulations!",
        description: "You've solved the haiku correctly.",
      });
      
      // Save haiku but don't auto-navigate
      saveHaiku();
    }
  }, [isSolved, currentHaiku, saveHaiku, toast]);

  // Handle continuing to next haiku - this is only called when the user
  // explicitly clicks the Continue button
  const handleContinue = () => {
    if (navigationRef.current) return;
    
    navigationRef.current = true;
    
    // First reset the current game state
    handleNextHaiku();
    
    // Then navigate to the next unsolved haiku, but only when explicitly requested
    setTimeout(() => {
      goToNextUnsolved();
    }, 100);
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
