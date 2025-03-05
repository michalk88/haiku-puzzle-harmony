
import { useRef, useEffect } from "react";
import { useHaikuGame } from "./useHaikuGame";
import { shuffleArray } from "../lib/utils";
import { useToast } from "./use-toast";

interface HaikuSolverProps {
  currentHaiku: any;
  isCompleted: boolean;
  completedHaiku: any;
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
  const {
    draggedWord,
    usedWords,
    isSolved,
    encouragingMessage,
    isMessageVisible,
    verificationState,
    incorrectWords,
    solvedLines,
    handleDragStart,
    handleWordUse,
    handleWordReturn,
    handleVerify,
    handleNextHaiku,
    setSolvedLines
  } = useHaikuGame();

  const gameRef = useRef<{ 
    handleWordReturn: (word: string) => void;
    handleReset: () => void;
    getCurrentLines: () => string[][];
  } | null>(null);

  const didSaveCurrentHaiku = useRef(false);
  const { toast } = useToast();

  // Reset the save tracking when moving to a new haiku
  useEffect(() => {
    didSaveCurrentHaiku.current = false;
  }, [currentHaiku]);

  // Save the current haiku to Supabase when it's solved
  useEffect(() => {
    const saveHaiku = async () => {
      if (isSolved && currentHaiku && !didSaveCurrentHaiku.current) {
        // Get the current lines from the game ref
        const currentLines = gameRef.current?.getCurrentLines() || solvedLines;
        console.log("Current lines for haiku:", currentLines);
        
        // Check if we have actual content in the lines
        const hasContent = currentLines.some(line => line && line.length > 0);
        
        if (hasContent) {
          console.log("Saving solved haiku with ID:", currentHaiku.id);
          console.log("Saving solved haiku with lines:", currentLines);
          
          // Mark as saved to avoid duplicate saves
          didSaveCurrentHaiku.current = true;
          
          // Update solvedLines in state for display
          setSolvedLines([...currentLines]);
          
          try {
            // Save the haiku to Supabase
            await saveCompletedHaiku.mutateAsync({
              haiku_id: currentHaiku.id,
              line1_arrangement: currentLines[0] || [],
              line2_arrangement: currentLines[1] || [],
              line3_arrangement: currentLines[2] || []
            });
            
            toast({
              title: "Haiku saved!",
              description: "Your solution has been saved.",
            });
            
            // Force refetch completed haikus to update the count
            await refetchCompletedHaikus();
            
            console.log("Haiku saved successfully");
            
            // REMOVED: We don't automatically navigate to next haiku anymore
            // User must click the Continue button
          } catch (error) {
            console.error("Error saving haiku:", error);
            didSaveCurrentHaiku.current = false;
            toast({
              title: "Error saving haiku",
              description: "There was an error saving your solution.",
              variant: "destructive"
            });
          }
        } else {
          console.warn("Not saving haiku - lines are empty");
        }
      }
    };
    
    saveHaiku();
  }, [isSolved, currentHaiku, saveCompletedHaiku, toast, solvedLines, setSolvedLines, refetchCompletedHaikus]);

  // Handle word return from haiku lines to word pool
  const handleWordReturnToPool = (word: string, lineIndex?: number) => {
    console.log("HaikuPuzzle - Word returned to pool:", word, "from line:", lineIndex);
    gameRef.current?.handleWordReturn(word);
    handleWordReturn(word);
  };

  // Handle verification of haiku solution
  const handleVerification = (currentLines: string[][], solution: string[][]) => {
    console.log("Handling verification with lines:", currentLines);
    setSolvedLines([...currentLines]);
    handleVerify(currentLines, solution);
  };

  // Handle next haiku after solving
  const handleContinue = () => {
    handleNextHaiku();
    goToNextUnsolved();
  };

  // Get available words for the current haiku
  const availableWords = currentHaiku ? [
    ...currentHaiku.line1_words,
    ...currentHaiku.line2_words,
    ...currentHaiku.line3_words
  ] : [];
  
  const shuffledWords = shuffleArray([...availableWords]);
  const remainingWords = shuffledWords.filter(word => !usedWords.has(word));

  // Get the correct display lines for a completed haiku
  const displayLines = isSolved 
    ? solvedLines 
    : completedHaiku 
      ? [
          completedHaiku.line1_arrangement || [],
          completedHaiku.line2_arrangement || [],
          completedHaiku.line3_arrangement || []
        ] 
      : [[], [], []];

  return {
    gameRef,
    isSolved,
    isCompleted,
    usedWords,
    encouragingMessage,
    isMessageVisible,
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
