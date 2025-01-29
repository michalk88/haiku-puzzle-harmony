import React, { useState } from "react";
import HaikuLine from "./HaikuLine";
import WordTile from "./WordTile";

const availableWords = [
  "haiku", "away", "a", "today",
  "keep", "not", "start", "one",
  "why", "will", "dementia", "day"
];

const HaikuPuzzle: React.FC = () => {
  const [lines, setLines] = useState<string[][]>([[], [], []]);
  const [draggedWord, setDraggedWord] = useState<string>("");
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  const handleDrop = (lineIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedWord) {
      const newLines = [...lines];
      newLines[lineIndex] = [...newLines[lineIndex], draggedWord];
      setLines(newLines);
      setUsedWords(new Set([...usedWords, draggedWord]));
      setDraggedWord("");
    }
  };

  const handleDragStart = (word: string) => {
    setDraggedWord(word);
  };

  const handleWordReorder = (lineIndex: number, draggedWord: string, dropIndex: number) => {
    const newLines = [...lines];
    const currentLine = [...newLines[lineIndex]];
    
    // Remove the word from its current position if it exists in the line
    const currentIndex = currentLine.indexOf(draggedWord);
    if (currentIndex !== -1) {
      currentLine.splice(currentIndex, 1);
    }
    
    // Insert the word at the new position
    currentLine.splice(dropIndex, 0, draggedWord);
    newLines[lineIndex] = currentLine;
    setLines(newLines);
  };

  const remainingWords = availableWords.filter(word => !usedWords.has(word));

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-12">
        {lines.map((line, index) => (
          <HaikuLine
            key={index}
            words={line}
            onDrop={handleDrop(index)}
            onWordDrop={(draggedWord, dropIndex) => handleWordReorder(index, draggedWord, dropIndex)}
          />
        ))}
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {remainingWords.map((word) => (
          <WordTile
            key={word}
            word={word}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
};

export default HaikuPuzzle;