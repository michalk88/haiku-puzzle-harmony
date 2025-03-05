
import { useRef } from "react";
import { useHaikuGame } from "./useHaikuGame";
import { shuffleArray } from "@/lib/utils";
import { Haiku, CompletedHaiku } from "@/types/haiku";

interface HaikuGameStateProps {
  currentHaiku: Haiku | null;
  completedHaiku: CompletedHaiku | undefined;
}

export function useHaikuGameState({
  currentHaiku,
  completedHaiku
}: HaikuGameStateProps) {
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

  // Prepare available words
  const availableWords = currentHaiku ? [
    ...currentHaiku.line1_words,
    ...currentHaiku.line2_words,
    ...currentHaiku.line3_words
  ] : [];
  
  const shuffledWords = shuffleArray([...availableWords]);
  const remainingWords = shuffledWords.filter(word => !usedWords.has(word));

  // Determine display lines
  const displayLines = isSolved 
    ? solvedLines 
    : completedHaiku 
      ? [[], [], []] // Empty lines since we no longer store arrangements
      : [[], [], []];

  return {
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
  };
}
