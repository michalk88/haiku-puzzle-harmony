
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HaikuHeader from "./haiku/HaikuHeader";
import CompletedHaiku from "./haiku/CompletedHaiku";
import LoadingState from "./haiku/LoadingState";
import NoHaikusAvailable from "./haiku/NoHaikusAvailable";
import HaikuGameplay from "./haiku/HaikuGameplay";
import { useHaikuNavigation } from "../hooks/useHaikuNavigation";
import { useHaikuSolver } from "../hooks/useHaikuSolver";
import { useAuth } from "@/context/AuthContext";

interface HaikuPuzzleProps {
  onSolvedCountChange?: (count: number) => void;
}

const HaikuPuzzle: React.FC<HaikuPuzzleProps> = ({ onSolvedCountChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialNavigationDoneRef = useRef(false);
  const autoNavigationAttemptedRef = useRef(false);
  
  // Hook for haiku navigation and selection
  const {
    haikus,
    currentHaiku,
    availableHaikus,
    isCompleted,
    completedHaiku,
    isLoadingHaikus,
    isLoadingCompleted,
    completedHaikus,
    saveCompletedHaiku,
    refetchCompletedHaikus,
    goToNextUnsolved
  } = useHaikuNavigation({ onSolvedCountChange });

  // Redirect to auth if not logged in
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && !isLoadingHaikus) {
        navigate('/auth');
      }
    }, 1000); // Short delay to prevent flickering during initial load
    
    return () => clearTimeout(timer);
  }, [user, isLoadingHaikus, navigate]);

  // Automatically navigate to next unsolved haiku if current one is already completed
  useEffect(() => {
    if (
      !isLoadingHaikus && 
      !isLoadingCompleted && 
      isCompleted && 
      !autoNavigationAttemptedRef.current && 
      availableHaikus.length > 0
    ) {
      console.log("Auto-navigating to next unsolved haiku...");
      autoNavigationAttemptedRef.current = true;
      goToNextUnsolved();
    }
  }, [isCompleted, isLoadingHaikus, isLoadingCompleted, availableHaikus, goToNextUnsolved]);

  // Hook for haiku solving and completion
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
    handleContinue
  } = useHaikuSolver({
    currentHaiku,
    isCompleted: !!isCompleted,
    completedHaiku,
    saveCompletedHaiku,
    refetchCompletedHaikus,
    goToNextUnsolved
  });

  // Loading state
  if (isLoadingHaikus || isLoadingCompleted) {
    return <LoadingState />;
  }

  // Handle the case when no haikus are available at all
  if (!currentHaiku && (!haikus || haikus.length === 0)) {
    return <div>No haikus available in the system</div>;
  }

  // Check if there are any unsolved haikus
  if (availableHaikus.length === 0 && !isLoadingHaikus && !isLoadingCompleted && haikus?.length > 0) {
    return <NoHaikusAvailable />;
  }

  // Ensure we have a current haiku to display
  if (!currentHaiku) {
    return <LoadingState />;
  }

  // Reset the auto-navigation flag when showing a new haiku
  if (!isCompleted && autoNavigationAttemptedRef.current) {
    autoNavigationAttemptedRef.current = false;
  }

  const showSolvedState = isCompleted || isSolved;
  
  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 py-6 sm:py-8 flex-1">
        <div className="mb-2">
          <HaikuHeader
            title={currentHaiku.title}
            isCompleted={!!isCompleted}
            isSolved={isSolved}
            isLastHaiku={availableHaikus.length === 0}
            onNextHaiku={goToNextUnsolved}
            encouragingMessage=""
            isNextDisabled={!isSolved && !isCompleted}
          />
        </div>

        {showSolvedState ? (
          <CompletedHaiku
            lines={displayLines}
            onNextHaiku={handleContinue}
          />
        ) : (
          <HaikuGameplay
            currentHaiku={currentHaiku}
            gameRef={gameRef}
            usedWords={usedWords}
            remainingWords={remainingWords}
            verificationState={verificationState}
            incorrectWords={incorrectWords}
            onWordUse={handleWordUse}
            onWordReturn={handleWordReturnToPool}
            onVerify={handleVerification}
            onDragStart={handleDragStart}
          />
        )}
      </div>
    </div>
  );
}

export default HaikuPuzzle;
