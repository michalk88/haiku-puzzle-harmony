
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
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const isSolved = lines.every((line, i) => 
      line.length === solution[i].length && 
      line.every((word, j) => word === solution[i][j])
    );

    if (isSolved && !isCorrect) {
      setIsCorrect(true);
      const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      
      setTimeout(() => {
        onSolved(randomMessage);
      }, 2000);
    }
  }, [lines, solution, onSolved, isCorrect]);

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    if (!word) return;

    // Remove the word from all lines first
    const newLines = lines.map(line => line.filter(w => w !== word));
    
    // Add the word to the target line
    newLines[index] = [...newLines[index], word];
    setLines(newLines);

    // Only call onWordUse if the word isn't in any line
    const isWordInLines = lines.some(line => line.includes(word));
    if (!isWordInLines) {
      onWordUse(word);
    }
  };

  const handleWordDrop = (lineIndex: number) => (draggedWord: string, dropIndex: number) => {
    // Remove the word from all lines first
    const newLines = lines.map(line => line.filter(w => w !== draggedWord));
    
    // Add the word at the specific position in the target line
    newLines[lineIndex] = [
      ...newLines[lineIndex].slice(0, dropIndex),
      draggedWord,
      ...newLines[lineIndex].slice(dropIndex)
    ];
    
    setLines(newLines);
  };

  const handleWordReturn = (word: string) => {
    setLines(prev => {
      const newLines = prev.map(line => line.filter(w => w !== word));
      
      // Only return the word to pool if it was actually removed
      if (JSON.stringify(newLines) !== JSON.stringify(prev)) {
        onWordReturn(word);
      }
      return newLines;
    });
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
          lineIndex={index}
        />
      ))}
    </div>
  );
};

export default HaikuGame;
