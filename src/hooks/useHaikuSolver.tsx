
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
  onCountUpdate?: () => void;
}

export function useHaikuSolver({
  currentHaiku,
  isCompleted,
  completedHaiku,
  saveCompletedHaiku,
  refetchCompletedHaikus,
  goToNextUnsolved,
  onCountUpdate
}: HaikuSolverProps) {
  const navigationRef = useRef(false);
  const hasSolvedToastShownRef = useRef(false);
  const hasRefetchedAfterSolveRef = useRef(false);
  const currentHaikuIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Update the current haiku ref whenever it changes
  useEffect(() => {
    if (currentHaiku?.id !== currentHaikuIdRef.current) {
      console.log(`useHaikuSolver: currentHaiku changed from ${currentHaikuIdRef.current} to ${currentHaiku?.id}`);
      currentHaikuIdRef.current = currentHaiku?.id || null;
      hasSolvedToastShownRef.current = false; // Reset toast flag for new haiku
      hasRefetchedAfterSolveRef.current = false; // Reset refetch flag for new haiku
    }
  }, [currentHaiku]);

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

  // Handle count updates after save
  const handleSaveComplete = async () => {
    console.log("Save complete, updating counts");
    // Refetch completed haikus to update counts immediately
    await refetchCompletedHaikus();
    if (onCountUpdate) {
      onCountUpdate();
    }
  };

  // Haiku saving functionality with per-instance tracking
  const { 
    saveHaiku, 
    isCurrentHaikuSaved,
    markCurrentHaikuAsSaved
  } = useSaveHaiku({
    currentHaiku,
    isSolved,
    saveCompletedHaiku,
    refetchCompletedHaikus,
    onSaveComplete: handleSaveComplete
  });

  // Mark haiku as saved if it's already completed
  useEffect(() => {
    if (currentHaiku && isCompleted) {
      console.log(`Marking haiku ${currentHaiku.id} as already saved because isCompleted is true`);
      markCurrentHaikuAsSaved(currentHaiku.id);
    }
  }, [currentHaiku, isCompleted, markCurrentHaikuAsSaved]);

  // Save the haiku when solved
  useEffect(() => {
    console.log(`=== SOLVE-SAVE CHECK ===`);
    console.log(`isSolved: ${isSolved}`);
    console.log(`currentHaiku: ${currentHaiku?.id}`);
    console.log(`isCompleted: ${isCompleted}`);
    console.log(`hasSolvedToastShownRef: ${hasSolvedToastShownRef.current}`);
    console.log(`isCurrentHaikuSaved: ${isCurrentHaikuSaved}`);
    
    // Only save once per solve and only if this is a new solve (not a pre-completed one)
    if (isSolved && 
        currentHaiku && 
        !hasSolvedToastShownRef.current && 
        !isCompleted && 
        !isCurrentHaikuSaved) {
      
      console.log("First time solving this haiku - saving");
      
      // Only save once per solve
      hasSolvedToastShownRef.current = true;
      
      // Save haiku
      saveHaiku();
    } else if (isSolved) {
      console.log(`Not saving because: hasSolvedToastShownRef=${hasSolvedToastShownRef.current}, isCompleted=${isCompleted}, isCurrentHaikuSaved=${isCurrentHaikuSaved}`);
    }
  }, [isSolved, currentHaiku, isCompleted, saveHaiku, isCurrentHaikuSaved]);

  // Handle continuing to next haiku
  const handleContinue = async () => {
    if (navigationRef.current) return;
    
    console.log("Continue button clicked - explicit user action");
    navigationRef.current = true;
    
    // First reset the current game state
    handleNextHaiku();
    
    try {
      // Force a refetch of completed haikus to ensure the counter is updated
      console.log("Explicitly refetching completed haikus after Continue button");
      await refetchCompletedHaikus();
      
      // Call onCountUpdate to ensure the counter is updated
      if (onCountUpdate) {
        console.log("Calling onCountUpdate to update counter after Continue");
        onCountUpdate();
      }
      
      // Mark that we've refetched after solving, so we don't do it again
      hasRefetchedAfterSolveRef.current = true;
      
      // Then navigate to the next unsolved haiku
      setTimeout(() => {
        console.log("Navigating to next unsolved haiku after Continue button");
        goToNextUnsolved();
        
        // Reset navigation ref after a delay
        setTimeout(() => {
          navigationRef.current = false;
        }, 300);
      }, 100);
    } catch (error) {
      console.error("Error refetching completed haikus:", error);
      // Still try to navigate even if refetch fails
      goToNextUnsolved();
      navigationRef.current = false;
    }
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
