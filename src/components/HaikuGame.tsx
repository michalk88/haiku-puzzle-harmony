
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

    onWordUse(word);
    setLines(prev => prev.map((line, i) => 
      i === index ? [...line, word] : line
    ));
  };

  const handleWordDrop = (lineIndex: number) => (draggedWord: string, dropIndex: number) => {
    setLines(prev => prev.map((line, i) => 
      i === lineIndex ? [
        ...line.slice(0, dropIndex),
        draggedWord,
        ...line.slice(dropIndex + 1)
      ] : line
    ));
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
