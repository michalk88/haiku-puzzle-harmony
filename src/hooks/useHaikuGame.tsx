
import { useState, useEffect } from "react";

export const useHaikuGame = () => {
  const [draggedWord, setDraggedWord] = useState<string>("");
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [currentHaikuIndex, setCurrentHaikuIndex] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [encouragingMessage, setEncouragingMessage] = useState<string>("");
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (encouragingMessage) {
      setIsMessageVisible(true);
      timeout = setTimeout(() => {
        setIsMessageVisible(false);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [encouragingMessage]);

  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData("text/plain", word);
    setDraggedWord(word);
  };

  const handleWordUse = (word: string) => {
    // Only add the word if it's not already used
    if (!usedWords.has(word)) {
      setUsedWords(prev => new Set([...prev, word]));
    }
  };

  const handleWordReturn = (word: string) => {
    setUsedWords(prev => {
      const newSet = new Set(prev);
      newSet.delete(word);
      return newSet;
    });
  };

  const handleReset = () => {
    setUsedWords(new Set());
    setIsSolved(false);
    setEncouragingMessage("");
    setIsMessageVisible(false);
  };

  const handleSolved = (message: string) => {
    setIsSolved(true);
    setEncouragingMessage(message);
  };

  const handleNextHaiku = () => {
    setCurrentHaikuIndex(prev => prev + 1);
    handleReset();
  };

  const handlePreviousHaiku = () => {
    setCurrentHaikuIndex(prev => prev - 1);
    handleReset();
  };

  return {
    draggedWord,
    usedWords,
    currentHaikuIndex,
    isSolved,
    encouragingMessage,
    isMessageVisible,
    handleDragStart,
    handleWordUse,
    handleWordReturn,
    handleReset,
    handleSolved,
    handleNextHaiku,
    handlePreviousHaiku
  };
};
