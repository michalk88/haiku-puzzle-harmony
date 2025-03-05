
import { useState } from "react";

type VerificationState = 'idle' | 'checking' | 'correct' | 'incorrect' | 'continue';

export const useHaikuGame = () => {
  const [draggedWord, setDraggedWord] = useState<string>("");
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [currentHaikuIndex, setCurrentHaikuIndex] = useState(0);
  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [incorrectWords, setIncorrectWords] = useState<Set<string>>(new Set());
  const [isSolved, setIsSolved] = useState(false);
  const [solvedLines, setSolvedLines] = useState<string[][]>([[], [], []]);

  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData("text/plain", word);
    setDraggedWord(word);
  };

  const handleWordUse = (word: string) => {
    setUsedWords(prev => new Set([...prev, word]));
  };

  const handleWordReturn = (word: string) => {
    setUsedWords(prev => {
      const newSet = new Set(prev);
      newSet.delete(word);
      return newSet;
    });
    setIncorrectWords(prev => {
      const newSet = new Set(prev);
      newSet.delete(word);
      return newSet;
    });
  };

  const handleVerify = (currentLines: string[][], solution: string[][]) => {
    console.log("Verifying haiku with lines:", currentLines);
    setVerificationState('checking');
    
    const isCorrect = currentLines.every((line, i) => 
      line.length === solution[i].length && 
      line.every((word, j) => word === solution[i][j])
    );

    if (isCorrect) {
      setVerificationState('correct');
      setIsSolved(true);
      setSolvedLines([...currentLines]);
      
      setTimeout(() => {
        setVerificationState('continue');
      }, 1500);
    } else {
      setVerificationState('incorrect');
      const incorrectWordsSet = new Set<string>();
      currentLines.forEach((line, lineIndex) => {
        line.forEach((word, wordIndex) => {
          if (solution[lineIndex][wordIndex] !== word) {
            incorrectWordsSet.add(word);
          }
        });
      });
      setIncorrectWords(incorrectWordsSet);
      setTimeout(() => {
        setVerificationState('idle');
        setIncorrectWords(new Set());
      }, 2000);
    }
  };

  const handleNextHaiku = () => {
    setVerificationState('idle');
    setUsedWords(new Set());
    setIncorrectWords(new Set());
    setIsSolved(false);
    setSolvedLines([[], [], []]);
  };

  return {
    draggedWord,
    usedWords,
    currentHaikuIndex,
    encouragingMessage: "", // Returning empty string instead of removing to maintain interface compatibility
    isMessageVisible: false, // Always false now
    verificationState,
    incorrectWords,
    isSolved,
    solvedLines,
    handleDragStart,
    handleWordUse,
    handleWordReturn,
    handleVerify,
    handleNextHaiku,
    setCurrentHaikuIndex,
    setSolvedLines,
  };
};
