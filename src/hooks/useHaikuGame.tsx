
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
    console.log("useHaikuGame handleDragStart - Setting dragged word:", word);
    e.dataTransfer.setData("text/plain", word);
    setDraggedWord(word);
  };

  const handleWordUse = (word: string) => {
    console.log("useHaikuGame handleWordUse - Adding word to usedWords:", word);
    setUsedWords(prev => new Set([...prev, word]));
  };

  const handleWordReturn = (word: string) => {
    console.log("useHaikuGame handleWordReturn - Removing word from usedWords:", word);
    setUsedWords(prev => {
      const newSet = new Set(prev);
      newSet.delete(word);
      console.log("useHaikuGame handleWordReturn - New usedWords set:", Array.from(newSet));
      return newSet;
    });
  };

  const handleReset = () => {
    console.log("useHaikuGame handleReset - Resetting game state");
    setUsedWords(new Set());
    setIsSolved(false);
    setEncouragingMessage("");
    setIsMessageVisible(false);
  };

  const handleSolved = (message: string) => {
    console.log("useHaikuGame handleSolved - Setting game as solved with message:", message);
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
