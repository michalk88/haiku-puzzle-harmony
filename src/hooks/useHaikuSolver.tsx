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

  useEffect(() => {
    if (currentHaiku?.id !== currentHaikuIdRef.current) {
      console.log(`Moving to a new haiku: ${currentHaiku?.id} (was: ${currentHaikuIdRef.current})`);
      didSaveCurrentHaiku.current = false;
      saveAttemptsRef.current = 0;
      currentHaikuIdRef.current = currentHaiku?.id || null;
    }
  }, [currentHaiku]);

  useEffect(() => {
    const saveHaiku = async () => {
      if (isSolved && currentHaiku && !didSaveCurrentHaiku.current) {
        try {
          console.log(`========== ATTEMPTING TO SAVE HAIKU ==========`);
          console.log(`Haiku ID: ${currentHaiku.id}, Title: ${currentHaiku.title}`);
          
          // Increment save attempts
          saveAttemptsRef.current += 1;
          console.log(`Save attempt #${saveAttemptsRef.current}`);
          
          // Mark as saved to avoid duplicate saves
          didSaveCurrentHaiku.current = true;
          
          // Save only the haiku_id to Supabase
          await saveCompletedHaiku.mutateAsync({
            haiku_id: currentHaiku.id
          });
          
          toast({
            title: "Haiku saved!",
            description: "Your solution has been saved.",
          });
          
          // Force refetch completed haikus to update the data
          await refetchCompletedHaikus();
          
          console.log("Haiku saved successfully");
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
  }, [isSolved, currentHaiku, saveCompletedHaiku, toast, refetchCompletedHaikus]);

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

  const availableWords = currentHaiku ? [
    ...currentHaiku.line1_words,
    ...currentHaiku.line2_words,
    ...currentHaiku.line3_words
  ] : [];
  
  const shuffledWords = shuffleArray([...availableWords]);
  const remainingWords = shuffledWords.filter(word => !usedWords.has(word));

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
