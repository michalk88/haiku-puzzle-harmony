
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HaikuHeader from "./haiku/HaikuHeader";
import CompletedHaiku from "./haiku/CompletedHaiku";
import LoadingState from "./haiku/LoadingState";
import NoHaikusAvailable from "./haiku/NoHaikusAvailable";
import HaikuGameplay from "./haiku/HaikuGameplay";
import ProgressIndicator from "./haiku/ProgressIndicator";
import { useHaikuNavigation } from "../hooks/useHaikuNavigation";
import { useHaikuSolver } from "../hooks/useHaikuSolver";
import { useAuth } from "@/context/AuthContext";

interface HaikuPuzzleProps {
  onSolvedCountChange?: (count: number) => void;
}

const HaikuPuzzle: React.FC<HaikuPuzzleProps> = ({ onSolvedCountChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialLoadDoneRef = useRef(false);
  const solvingInProgressRef = useRef(false);
  
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

  // Only navigate to next unsolved haiku on initial load when a haiku is already completed
  useEffect(() => {
    if (
      !isLoadingHaikus && 
      !isLoadingCompleted && 
      isCompleted && 
      !initialLoadDoneRef.current && 
      availableHaikus.length > 0 &&
      !solvingInProgressRef.current
    ) {
      console.log("Initial navigation to next unsolved haiku on load...");
      initialLoadDoneRef.current = true;
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
    goToNextUnsolved: () => {
      // Set a flag to prevent multiple navigations
      solvingInProgressRef.current = true;
      setTimeout(() => {
        goToNextUnsolved();
        // Reset the flag after navigation completes
        setTimeout(() => {
          solvingInProgressRef.current = false;
        }, 200);
      }, 100);
    }
  });

  // Calculate progress percentage
  const totalHaikus = haikus?.length || 0;
  const solvedCount = completedHaikus?.length || 0;
  const progressPercentage = totalHaikus > 0 ? Math.round((solvedCount / totalHaikus) * 100) : 0;

  // Loading state
  if (isLoadingHaikus || isLoadingCompleted) {
    return <LoadingState />;
  }

  // Handle the case when no haikus are available at all
  if (!currentHaiku && (!haikus || haikus.length === 0)) {
    return <div className="flex justify-center items-center min-h-[400px]">No haikus available in the system</div>;
  }

  // Check if there are any unsolved haikus
  if (availableHaikus.length === 0 && !isLoadingHaikus && !isLoadingCompleted && haikus?.length > 0) {
    return <NoHaikusAvailable />;
  }

  // Ensure we have a current haiku to display
  if (!currentHaiku) {
    return <LoadingState />;
  }

  const showSolvedState = isCompleted || isSolved;
  
  return (
    <div className="relative min-h-screen flex flex-col bg-white transition-all duration-300">
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 py-6 sm:py-8 flex-1">
        <ProgressIndicator 
          totalHaikus={totalHaikus}
          solvedCount={solvedCount}
          percentage={progressPercentage}
        />

        <div className="mb-2">
          <HaikuHeader
            title={currentHaiku.title}
            isCompleted={!!isCompleted}
            isSolved={isSolved}
            isLastHaiku={availableHaikus.length === 0}
            onNextHaiku={goToNextUnsolved}
            encouragingMessage={isSolved ? "Great job!" : ""}
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
