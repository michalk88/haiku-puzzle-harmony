
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
  const saveAttemptsRef = useRef(0);
  const currentHaikuIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Reset the save tracking when moving to a new haiku
  useEffect(() => {
    if (currentHaiku?.id !== currentHaikuIdRef.current) {
      console.log(`Moving to a new haiku: ${currentHaiku?.id} (was: ${currentHaikuIdRef.current})`);
      didSaveCurrentHaiku.current = false;
      saveAttemptsRef.current = 0;
      currentHaikuIdRef.current = currentHaiku?.id || null;
    }
  }, [currentHaiku]);

  // Save the current haiku to Supabase when it's solved
  useEffect(() => {
    const saveHaiku = async () => {
      if (isSolved && currentHaiku && !didSaveCurrentHaiku.current) {
        try {
          // Get the current lines from the game ref
          const currentLines = gameRef.current?.getCurrentLines() || solvedLines;
          
          console.log(`========== ATTEMPTING TO SAVE HAIKU ==========`);
          console.log(`Haiku ID: ${currentHaiku.id}, Title: ${currentHaiku.title}`);
          console.log("Current lines for haiku:", JSON.stringify(currentLines));
          
          // Increment save attempts
          saveAttemptsRef.current += 1;
          console.log(`Save attempt #${saveAttemptsRef.current}`);
          
          // Validate all lines have content
          const line1HasContent = currentLines[0] && currentLines[0].length > 0;
          const line2HasContent = currentLines[1] && currentLines[1].length > 0;
          const line3HasContent = currentLines[2] && currentLines[2].length > 0;
          
          // All lines must have content to be considered valid
          const hasAllContent = line1HasContent && line2HasContent && line3HasContent;
          
          if (hasAllContent) {
            // Ensure we're creating deep copies of the arrays
            const line1 = [...currentLines[0]];
            const line2 = [...currentLines[1]];
            const line3 = [...currentLines[2]];
            
            console.log("Saving line arrangements:", {
              haiku_id: currentHaiku.id,
              line1: JSON.stringify(line1),
              line2: JSON.stringify(line2),
              line3: JSON.stringify(line3)
            });
            
            // Mark as saved to avoid duplicate saves
            didSaveCurrentHaiku.current = true;
            
            // Update solvedLines in state for display
            setSolvedLines([line1, line2, line3]);
            
            // Save the haiku to Supabase with proper haiku_id
            await saveCompletedHaiku.mutateAsync({
              haiku_id: currentHaiku.id,
              line1_arrangement: line1,
              line2_arrangement: line2,
              line3_arrangement: line3
            });
            
            toast({
              title: "Haiku saved!",
              description: "Your solution has been saved.",
            });
            
            // Force refetch completed haikus to update the data
            await refetchCompletedHaikus();
            
            console.log("Haiku saved successfully");
          } else {
            console.warn("Not saving haiku - one or more lines are empty");
            console.warn(`Line 1 has content: ${line1HasContent}`);
            console.warn(`Line 2 has content: ${line2HasContent}`);
            console.warn(`Line 3 has content: ${line3HasContent}`);
            
            toast({
              title: "Haiku incomplete",
              description: "Cannot save incomplete haiku. Please complete all lines.",
              variant: "destructive"
            });
            
            // Reset solved state to allow trying again
            didSaveCurrentHaiku.current = false;
          }
        } catch (error) {
          console.error("Error saving haiku:", error);
          didSaveCurrentHaiku.current = false;
          toast({
            title: "Error saving haiku",
            description: "There was an error saving your solution. Please try again.",
            variant: "destructive"
          });
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

  const handleVerification = (currentLines: string[][], solution: string[][]) => {
    console.log("Handling verification with lines:", JSON.stringify(currentLines));
    
    // Deep copy the lines to avoid reference issues
    const linesDeepCopy = currentLines.map(line => line ? [...line] : []);
    setSolvedLines(linesDeepCopy);
    
    handleVerify(currentLines, solution);
  };

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
