import React, { useState } from "react";
import HaikuGame from "./HaikuGame";
import WordPool from "./WordPool";

const solution = [
  ["one", "haiku", "a", "day"],
  ["will", "keep", "dementia", "away"],
  ["why", "not", "start", "today"]
];

const availableWords = [
  "haiku", "away", "a", "today",
  "keep", "not", "start", "one",
  "why", "will", "dementia", "day"
];

const HaikuPuzzle: React.FC = () => {
  const [draggedWord, setDraggedWord] = useState<string>("");
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  const handleDragStart = (word: string) => {
    e.dataTransfer.setData("text/plain", word);
    setDraggedWord(word);
  };

  const handleWordUse = (word: string) => {
    setUsedWords(new Set([...usedWords, word]));
    setDraggedWord("");
  };

  const handleWordReturn = (word: string, lineIndex?: number) => {
    const newUsedWords = new Set(usedWords);
    newUsedWords.delete(word);
    setUsedWords(newUsedWords);
  };

  const remainingWords = availableWords.filter(word => !usedWords.has(word));

  return (
    <div className="max-w-2xl mx-auto p-8">
      <HaikuGame
        solution={solution}
        usedWords={usedWords}
        onWordUse={handleWordUse}
        onWordReturn={handleWordReturn}
      />
      
      <WordPool
        words={remainingWords}
        onDragStart={handleDragStart}
        onWordReturn={handleWordReturn}
      />
    </div>
  );
};

export default HaikuPuzzle;