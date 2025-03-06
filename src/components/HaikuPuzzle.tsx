
import React, { useEffect, useRef, useState } from "react";
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
  const initialLoadDoneRef = useRef(false);
  const solvingInProgressRef = useRef(false);
  const noMoreHaikusRef = useRef(false);
  const [forcedCountUpdate, setForcedCountUpdate] = useState(0);
  
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
  } = useHaikuNavigation({ onSolvedCountChange, forcedCountUpdate });

  // Force count update function
  const handleForceCountUpdate = () => {
    console.log("Forcing count update in HaikuPuzzle");
    setForcedCountUpdate(prev => prev + 1);
  };

  // Check if this is the last available haiku
  const isLastAvailableHaiku = availableHaikus.length === 1 && 
    currentHaiku && 
    availableHaikus[0]?.id === currentHaiku.id;

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
    onCountUpdate: handleForceCountUpdate,
    goToNextUnsolved: () => {
      // Set a flag to prevent multiple navigations
      solvingInProgressRef.current = true;
      
      // Check if we just solved the last available haiku
      if (isSolved && isLastAvailableHaiku) {
        noMoreHaikusRef.current = true;
      }
      
      // Force a count update before navigation
      handleForceCountUpdate();
      
      setTimeout(() => {
        goToNextUnsolved();
        // Reset the flag after navigation completes
        setTimeout(() => {
          solvingInProgressRef.current = false;
        }, 200);
      }, 100);
    }
  });

  // Loading state
  if (isLoadingHaikus || isLoadingCompleted) {
    return <LoadingState />;
  }

  // Handle the case when no haikus are available at all
  if (!currentHaiku && (!haikus || haikus.length === 0)) {
    return <div className="flex justify-center items-center min-h-[400px]">No haikus available in the system</div>;
  }

  // Only show NoHaikusAvailable when we've explicitly completed all haikus and clicked continue
  if (noMoreHaikusRef.current && availableHaikus.length === 0) {
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
        <div className="mb-2">
          <HaikuHeader
            title={currentHaiku.title}
            isCompleted={!!isCompleted}
            isSolved={isSolved}
            isLastHaiku={isLastAvailableHaiku}
            onNextHaiku={goToNextUnsolved}
            encouragingMessage={isSolved ? "Great job!" : ""}
            isNextDisabled={!isSolved && !isCompleted}
          />
        </div>

        {showSolvedState ? (
          <CompletedHaiku
            lines={displayLines}
            onAnimationComplete={handleForceCountUpdate}
            onNextHaiku={() => {
              // Flag this as the end if it was the last haiku
              if (isLastAvailableHaiku) {
                noMoreHaikusRef.current = true;
              }
              
              // Force count update before continuing
              handleForceCountUpdate();
              
              // Continue to next haiku
              handleContinue();
            }}
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
