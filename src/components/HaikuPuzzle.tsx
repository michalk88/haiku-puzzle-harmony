import React, { useState } from "react";
import HaikuLine from "./HaikuLine";
import WordTile from "./WordTile";

// The solution represents the correct order of words for each line
const solution = [
  ["a", "haiku", "today"],
  ["dementia", "will", "not", "keep"],
  ["one", "day", "away"]
];

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
    const word = draggedWord || e.dataTransfer.getData("text/plain");
    if (word) {
      // Remove the word from its current line if it exists in any line
      const newLines = lines.map(line => line.filter(w => w !== word));
      
      // Add the word to the target line
      newLines[lineIndex] = [...newLines[lineIndex], word];
      setLines(newLines);
      
      // Ensure the word is marked as used
      setUsedWords(new Set([...usedWords, word]));
      setDraggedWord("");
    }
  };

  const handleDragStart = (word: string) => {
    setDraggedWord(word);
  };

  const handleWordReorder = (lineIndex: number, draggedWord: string, dropIndex: number) => {
    const newLines = [...lines];
    
    // Remove the word from all lines
    lines.forEach((line, idx) => {
      newLines[idx] = line.filter(w => w !== draggedWord);
    });
    
    // Add the word at the specific position in the target line
    const currentLine = [...newLines[lineIndex]];
    currentLine.splice(dropIndex, 0, draggedWord);
    newLines[lineIndex] = currentLine;
    setLines(newLines);
  };

  const handleWordReturnToPool = (word: string, lineIndex: number) => {
    const newLines = [...lines];
    newLines[lineIndex] = newLines[lineIndex].filter(w => w !== word);
    setLines(newLines);
    
    const newUsedWords = new Set(usedWords);
    newUsedWords.delete(word);
    setUsedWords(newUsedWords);
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
            onWordReturnToPool={(word) => handleWordReturnToPool(word, index)}
          />
        ))}
      </div>
      
      <div 
        className="flex flex-wrap gap-3 justify-center p-4 border-2 border-dashed border-haiku-border rounded-lg"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const word = e.dataTransfer.getData("text/plain");
          if (word) {
            lines.forEach((line, index) => {
              if (line.includes(word)) {
                handleWordReturnToPool(word, index);
              }
            });
          }
        }}
      >
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