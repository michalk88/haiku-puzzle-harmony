
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

    console.log("handleDrop - Word being added:", word);
    console.log("handleDrop - Current lines state:", lines);

    // Remove the word from all lines first
    const newLines = lines.map(line => line.filter(w => w !== word));
    
    // Add the word to the target line
    newLines[index] = [...newLines[index], word];
    console.log("handleDrop - New lines state:", newLines);
    setLines(newLines);

    // Only call onWordUse if the word isn't in any line
    const isWordInLines = lines.some(line => line.includes(word));
    console.log("handleDrop - Is word already in lines?", isWordInLines);
    if (!isWordInLines) {
      onWordUse(word);
    }
  };

  const handleWordDrop = (lineIndex: number) => (draggedWord: string, dropIndex: number) => {
    console.log("handleWordDrop - Word being reordered:", draggedWord);
    console.log("handleWordDrop - Current lines state:", lines);

    // Remove the word from all lines first
    const newLines = lines.map(line => line.filter(w => w !== draggedWord));
    
    // Add the word at the specific position in the target line
    newLines[lineIndex] = [
      ...newLines[lineIndex].slice(0, dropIndex),
      draggedWord,
      ...newLines[lineIndex].slice(dropIndex)
    ];
    
    console.log("handleWordDrop - New lines state:", newLines);
    setLines(newLines);
  };

  const handleWordReturn = (word: string) => {
    console.log("handleWordReturn - Word being returned:", word);
    console.log("handleWordReturn - Current lines state:", lines);

    // First check if the word is actually in any line
    const isWordInLines = lines.some(line => line.includes(word));
    console.log("handleWordReturn - Is word in lines?", isWordInLines);

    if (!isWordInLines) {
      console.log("handleWordReturn - Word not found in lines, returning early");
      return;
    }

    // Remove the word from all lines and update state
    setLines(prev => {
      console.log("handleWordReturn - Previous lines state:", prev);
      const newLines = prev.map(line => line.filter(w => w !== word));
      console.log("handleWordReturn - New lines state after removal:", newLines);
      
      // Only return the word to pool if it was actually removed
      if (JSON.stringify(newLines) !== JSON.stringify(prev)) {
        console.log("handleWordReturn - Word was removed, returning to pool");
        onWordReturn(word);
      } else {
        console.log("handleWordReturn - No changes in lines state");
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
        />
      ))}
    </div>
  );
};

export default HaikuGame;
