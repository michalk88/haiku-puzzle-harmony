
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
  const hasSolvedToastShownRef = useRef(false);
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
    // Reset toast shown flag when haiku changes
    hasSolvedToastShownRef.current = false;
  }, [currentHaiku, updateCurrentHaikuRef]);

  // Show toast when solved, but don't auto-refetch
  useEffect(() => {
    if (isSolved && currentHaiku && !hasSolvedToastShownRef.current) {
      // Only show the toast once per solve
      hasSolvedToastShownRef.current = true;
      
      // Show toast when haiku is solved
      toast({
        title: "Congratulations!",
        description: "You've solved the haiku correctly.",
      });
      
      // Save haiku but skip the immediate refetch to prevent count updates
      // This helps prevent the UI from updating prematurely
      saveHaiku(true); // true = skip refetch
    }
  }, [isSolved, currentHaiku, saveHaiku, toast]);

  // Handle continuing to next haiku - this is only called when the user
  // explicitly clicks the Continue button
  const handleContinue = async () => {
    if (navigationRef.current) return;
    
    navigationRef.current = true;
    
    // First reset the current game state
    handleNextHaiku();
    
    // Now we can safely refetch the completed haikus to update counts
    // This happens after the user has clicked "Continue"
    await refetchCompletedHaikus();
    
    // Then navigate to the next unsolved haiku
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
