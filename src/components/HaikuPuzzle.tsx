
import React, { useRef, useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HaikuGame from "./HaikuGame";
import WordPool from "./WordPool";
import HaikuHeader from "./haiku/HaikuHeader";
import CompletedHaiku from "./haiku/CompletedHaiku";
import LoadingState from "./haiku/LoadingState";
import NoHaikusAvailable from "./haiku/NoHaikusAvailable";
import { useHaikuData } from "../hooks/useHaikuData";
import { useHaikuGame } from "../hooks/useHaikuGame";
import { shuffleArray } from "../lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface HaikuPuzzleProps {
  onSolvedCountChange?: (count: number) => void;
}

const HaikuPuzzle: React.FC<HaikuPuzzleProps> = ({ onSolvedCountChange }) => {
  const gameRef = useRef<{ 
    handleWordReturn: (word: string) => void;
    handleReset: () => void;
    getCurrentLines: () => string[][];
  } | null>(null);
  
  const {
    haikus,
    completedHaikus,
    saveCompletedHaiku,
    isLoadingHaikus,
    isLoadingCompleted,
  } = useHaikuData();

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [availableHaikus, setAvailableHaikus] = useState<any[]>([]);
  const [solvedLines, setSolvedLines] = useState<string[][]>([[], [], []]);

  // Redirect to auth if not logged in
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && !isLoadingHaikus) {
        navigate('/auth');
      }
    }, 1000); // Short delay to prevent flickering during initial load
    
    return () => clearTimeout(timer);
  }, [user, isLoadingHaikus, navigate]);

  // Filter out completed haikus to get available ones
  useEffect(() => {
    if (haikus && completedHaikus) {
      console.log("Filtering available haikus...");
      console.log("All haikus:", haikus.length);
      console.log("Completed haikus:", completedHaikus.length);
      
      const completedIds = new Set(completedHaikus.map(ch => ch.haiku_id));
      console.log("Completed IDs:", Array.from(completedIds));
      
      const available = haikus.filter(haiku => !completedIds.has(haiku.id));
      console.log("Available haikus after filtering:", available.length);
      
      setAvailableHaikus(available);
    }
  }, [haikus, completedHaikus]);

  const {
    draggedWord,
    usedWords,
    currentHaikuIndex,
    isSolved,
    encouragingMessage,
    isMessageVisible,
    verificationState,
    incorrectWords,
    handleDragStart,
    handleWordUse,
    handleWordReturn,
    handleVerify,
    handleNextHaiku,
    setCurrentHaikuIndex,
  } = useHaikuGame();

  // Sync the solvedCount with the parent component
  useEffect(() => {
    if (onSolvedCountChange && completedHaikus) {
      console.log("Updating solved count to:", completedHaikus.length);
      onSolvedCountChange(completedHaikus.length);
    }
  }, [completedHaikus, onSolvedCountChange]);

  // Ref to track if we've already saved the current haiku to avoid duplicates
  const didSaveCurrentHaiku = useRef(false);
  
  // Reset the save tracking when moving to a new haiku
  useEffect(() => {
    didSaveCurrentHaiku.current = false;
  }, [currentHaikuIndex]);

  // Save the current haiku to Supabase when it's solved
  useEffect(() => {
    if (isSolved && haikus && haikus.length > 0 && !didSaveCurrentHaiku.current && user) {
      const currentHaiku = haikus[currentHaikuIndex];
      
      // Important: we need to get the current lines from the game ref or use the saved solution
      const currentLines = gameRef.current?.getCurrentLines() || [[], [], []];
      
      console.log("Current lines for haiku:", currentLines);
      
      // Check if we have actual content in the lines
      const hasContent = currentLines.some(line => line.length > 0);
      
      if (hasContent) {
        console.log("Saving solved haiku with lines:", currentLines);
        
        // Store the solved lines for display
        setSolvedLines([...currentLines]);
        
        // Mark as saved to avoid duplicate saves
        didSaveCurrentHaiku.current = true;
        
        // Save the haiku to Supabase
        saveCompletedHaiku.mutate({
          haiku_id: currentHaiku.id,
          line1_arrangement: currentLines[0] || [],
          line2_arrangement: currentLines[1] || [],
          line3_arrangement: currentLines[2] || []
        }, {
          onSuccess: () => {
            toast({
              title: "Haiku saved!",
              description: "Your solution has been saved.",
            });
            console.log("Haiku saved successfully");
          },
          onError: (error) => {
            console.error("Error saving haiku:", error);
            toast({
              title: "Error saving haiku",
              description: "There was an error saving your solution.",
              variant: "destructive"
            });
            // Reset the save flag so we can try again
            didSaveCurrentHaiku.current = false;
          }
        });
      } else {
        console.warn("Not saving haiku - lines are empty");
      }
    }
  }, [isSolved, haikus, currentHaikuIndex, saveCompletedHaiku, user, toast]);

  // Handle next haiku logic - find the next unsolved haiku
  const goToNextUnsolved = () => {
    if (!haikus || !completedHaikus) return;
    
    const completedIds = new Set(completedHaikus.map(ch => ch.haiku_id));
    console.log("Going to next unsolved. Current index:", currentHaikuIndex);
    console.log("Available haikus:", availableHaikus.length);
    
    // Find the next unsolved haiku index
    let nextIndex = currentHaikuIndex;
    let foundUnsolved = false;
    
    // Try to find an unsolved haiku after the current one
    for (let i = currentHaikuIndex + 1; i < haikus.length; i++) {
      if (!completedIds.has(haikus[i].id)) {
        nextIndex = i;
        foundUnsolved = true;
        console.log("Found next unsolved at index:", nextIndex);
        break;
      }
    }
    
    // If no unsolved haiku found after the current one, start from the beginning
    if (!foundUnsolved && haikus.length > 0) {
      for (let i = 0; i < currentHaikuIndex; i++) {
        if (!completedIds.has(haikus[i].id)) {
          nextIndex = i;
          foundUnsolved = true;
          console.log("Found next unsolved from beginning at index:", nextIndex);
          break;
        }
      }
    }
    
    if (foundUnsolved) {
      console.log("Setting current haiku index to:", nextIndex);
      setCurrentHaikuIndex(nextIndex);
      handleNextHaiku();
    } else {
      // All haikus are solved, show a message or redirect
      console.log("All haikus are solved, redirecting to /solved");
      navigate('/solved');
    }
  };

  const availableWords = useMemo(() => {
    if (!haikus || haikus.length === 0) return [];
    
    const currentHaiku = haikus[currentHaikuIndex];
    if (!currentHaiku) {
      console.warn("No haiku found at index:", currentHaikuIndex);
      return [];
    }
    
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

  // Check if there are any unsolved haikus
  if (availableHaikus.length === 0 && !isLoadingHaikus && !isLoadingCompleted) {
    return <NoHaikusAvailable />;
  }

  // Now that we have haikus, get the current one
  const currentHaiku = haikus[currentHaikuIndex];
  if (!currentHaiku) {
    console.warn("No haiku found at index:", currentHaikuIndex);
    return <div>Haiku not found</div>;
  }
  
  const isCompleted = completedHaikus?.some(ch => ch.haiku_id === currentHaiku.id);
  const completedHaiku = completedHaikus?.find(ch => ch.haiku_id === currentHaiku.id);

  // If the current haiku is already completed, go to the next unsolved one
  if (isCompleted && !isSolved && availableHaikus.length > 0 && !isLoadingHaikus) {
    // Set a small timeout to avoid infinite loops during state updates
    setTimeout(() => {
      console.log("Current haiku is already completed, going to next unsolved");
      goToNextUnsolved();
    }, 0);
  }

  const remainingWords = availableWords.filter(word => !usedWords.has(word));

  const handleWordReturnToPool = (word: string, lineIndex?: number) => {
    console.log("HaikuPuzzle - Word returned to pool:", word, "from line:", lineIndex);
    gameRef.current?.handleWordReturn(word);
    handleWordReturn(word);
  };

  const handleVerification = (currentLines: string[][], solution: string[][]) => {
    handleVerify(currentLines, solution);
  };

  const showSolvedState = isCompleted || isSolved;
  
  // Use the stored solved lines or get from completedHaiku if available
  const displayLines = isSolved 
    ? solvedLines 
    : completedHaiku 
      ? [
          completedHaiku.line1_arrangement || [],
          completedHaiku.line2_arrangement || [],
          completedHaiku.line3_arrangement || []
        ] 
      : [[], [], []];

  console.log("Display lines for solved haiku:", displayLines);

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 py-6 sm:py-8 flex-1">
        <div className="mb-2">
          <HaikuHeader
            title={currentHaiku.title}
            isCompleted={isCompleted}
            isSolved={isSolved}
            isLastHaiku={availableHaikus.length === 0}
            onNextHaiku={goToNextUnsolved}
            encouragingMessage={isMessageVisible ? encouragingMessage : ""}
            isNextDisabled={!isSolved && !isCompleted}
          />
        </div>

        {showSolvedState ? (
          <CompletedHaiku
            lines={displayLines}
            onNextHaiku={goToNextUnsolved}
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
                onVerify={handleVerification}
                incorrectWords={incorrectWords}
                verificationState={verificationState}
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
    </div>
  );
};

export default HaikuPuzzle;
