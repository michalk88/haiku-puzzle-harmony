
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
  const hasSavedCurrentHaikuRef = useRef(false);
  const lastSavedHaikuIdRef = useRef<string | null>(null);
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

  // Handle count updates after save
  const handleSaveComplete = async () => {
    console.log("Save complete, updating counts");
    // Refetch completed haikus to update counts immediately
    await refetchCompletedHaikus();
    if (onCountUpdate) {
      onCountUpdate();
    }
  };

  // Haiku saving functionality
  const { updateCurrentHaikuRef, saveHaiku } = useSaveHaiku({
    currentHaiku,
    isSolved,
    saveCompletedHaiku,
    refetchCompletedHaikus,
    onSaveComplete: handleSaveComplete
  });

  // Update current haiku reference when it changes
  useEffect(() => {
    const haikuId = currentHaiku?.id || null;
    console.log(`==== HAIKU CHANGED ====`);
    console.log(`New haiku ID: ${haikuId}`);
    console.log(`Previous lastSavedHaikuId: ${lastSavedHaikuIdRef.current}`);
    console.log(`isCompleted status: ${isCompleted}`);
    
    updateCurrentHaikuRef(haikuId);
    
    // Reset navigation flag when haiku changes
    navigationRef.current = false;
    
    // Reset toast shown flag when haiku changes
    hasSolvedToastShownRef.current = false;
    
    // Reset refetch flag when haiku changes
    hasRefetchedAfterSolveRef.current = false;
    
    // Set save flag if this is a previously completed haiku
    if (isCompleted) {
      console.log(`Setting hasSavedCurrentHaikuRef=true because this haiku is already completed`);
      hasSavedCurrentHaikuRef.current = true;
      lastSavedHaikuIdRef.current = haikuId;
    } else {
      console.log(`Resetting hasSavedCurrentHaikuRef=false for new unsolved haiku`);
      hasSavedCurrentHaikuRef.current = false;
    }
  }, [currentHaiku, updateCurrentHaikuRef, isCompleted]);

  // Save the haiku when solved, but don't show toast (visual feedback already present)
  useEffect(() => {
    console.log(`=== SOLVE-SAVE CHECK ===`);
    console.log(`isSolved: ${isSolved}`);
    console.log(`currentHaiku: ${currentHaiku?.id}`);
    console.log(`isCompleted: ${isCompleted}`);
    console.log(`hasSolvedToastShownRef: ${hasSolvedToastShownRef.current}`);
    console.log(`hasSavedCurrentHaikuRef: ${hasSavedCurrentHaikuRef.current}`);
    console.log(`lastSavedHaikuIdRef: ${lastSavedHaikuIdRef.current}`);
    
    // Only save once per solve and only if this is a new solve (not a pre-completed one)
    if (isSolved && 
        currentHaiku && 
        !hasSolvedToastShownRef.current && 
        !isCompleted && 
        !hasSavedCurrentHaikuRef.current && 
        lastSavedHaikuIdRef.current !== currentHaiku.id) {
      
      console.log("First time solving this haiku - saving");
      // Only save once per solve
      hasSolvedToastShownRef.current = true;
      hasSavedCurrentHaikuRef.current = true;
      lastSavedHaikuIdRef.current = currentHaiku.id;
      
      // Save haiku but don't show toast (we already have "Great job!" in the UI)
      saveHaiku();
    } else if (isCompleted && currentHaiku) {
      console.log("This haiku was already completed - not saving again");
      hasSavedCurrentHaikuRef.current = true;
      lastSavedHaikuIdRef.current = currentHaiku.id;
    } else if (isSolved) {
      console.log(`Not saving because: hasSolvedToastShownRef=${hasSolvedToastShownRef.current}, isCompleted=${isCompleted}, hasSavedCurrentHaikuRef=${hasSavedCurrentHaikuRef.current}, lastSavedHaikuId=${lastSavedHaikuIdRef.current}`);
    }
  }, [isSolved, currentHaiku, isCompleted, saveHaiku]);

  // Handle continuing to next haiku - this is only called when the user
  // explicitly clicks the Continue button
  const handleContinue = async () => {
    if (navigationRef.current) return;
    
    console.log("Continue button clicked - explicit user action");
    navigationRef.current = true;
    
    // First reset the current game state
    handleNextHaiku();
    
    try {
      // Now we can safely refetch the completed haikus to update counts
      // This happens after the user has clicked "Continue"
      console.log("Explicitly refetching completed haikus after Continue button");
      await refetchCompletedHaikus();
      
      // Mark that we've refetched after solving, so we don't do it again
      hasRefetchedAfterSolveRef.current = true;
      
      // Then navigate to the next unsolved haiku
      setTimeout(() => {
        console.log("Navigating to next unsolved haiku after Continue button");
        goToNextUnsolved();
      }, 100);
    } catch (error) {
      console.error("Error refetching completed haikus:", error);
      // Still try to navigate even if refetch fails
      goToNextUnsolved();
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
