
import React, { useState, useEffect } from "react";
import HaikuLine from "./HaikuLine";

interface HaikuGameProps {
  solution: string[][];
  usedWords: Set<string>;
  onWordUse: (word: string) => void;
  onWordReturn: (word: string) => void;
  onSolved: (message: string) => void;
}

const encouragingMessages = [
  "Correct!",
  "Perfect!",
  "Well done!",
  "Excellent!",
  "Brilliant!",
  "Beautiful!",
  "Masterful!",
  "Wonderful!"
];

const HaikuGame: React.FC<HaikuGameProps> = ({
  solution,
  usedWords,
  onWordUse,
  onWordReturn,
  onSolved,
}) => {
  const [lines, setLines] = useState<string[][]>([[], [], []]);

  useEffect(() => {
    if (lines.every((line, i) => 
      line.length === solution[i].length && 
      line.every((word, j) => word === solution[i][j])
    )) {
      const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      onSolved(randomMessage);
    }
  }, [lines, solution, onSolved]);

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    if (!word) return;

    // Only call onWordUse if the word isn't already in any line
    const isWordInLines = lines.some(line => line.includes(word));
    if (!isWordInLines) {
      onWordUse(word);
    }

    // Remove the word from any other line where it might exist
    setLines(prev => prev.map((line, i) => 
      i === index ? [...line, word] : line.filter(w => w !== word)
    ));
  };

  const handleWordDrop = (lineIndex: number) => (draggedWord: string, dropIndex: number) => {
    // Remove the word from its original position in any line
    setLines(prev => {
      const newLines = prev.map(line => line.filter(w => w !== draggedWord));
      // Add the word at the new position
      newLines[lineIndex] = [
        ...newLines[lineIndex].slice(0, dropIndex),
        draggedWord,
        ...newLines[lineIndex].slice(dropIndex)
      ];
      return newLines;
    });
  };

  const handleWordReturn = (word: string) => {
    onWordReturn(word);
    setLines(prev => prev.map(line => line.filter(w => w !== word)));
  };

  return (
    <div className="space-y-4">
      {solution.map((_, index) => (
        <HaikuLine
          key={index}
          words={lines[index]}
          onDrop={handleDrop(index)}
          onWordDrop={handleWordDrop(index)}
          onWordReturnToPool={handleWordReturn}
        />
      ))}
    </div>
  );
};

export default HaikuGame;
