
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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

// Helper function to validate words
const isValidWord = (word: string): boolean => {
  return Boolean(word && word.trim() && !word.includes("\r") && !word.includes("\n"));
};

const HaikuGame = forwardRef<{ 
  handleWordReturn: (word: string) => void;
  handleReset: () => void;
}, HaikuGameProps>(({
  solution,
  usedWords,
  onWordUse,
  onWordReturn,
  onSolved,
}, ref) => {
  const [lines, setLines] = useState<string[][]>([[], [], []]);
  const [isCorrect, setIsCorrect] = useState(false);
  const linesRef = useRef(lines);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  useImperativeHandle(ref, () => ({
    handleWordReturn: (word: string) => {
      console.log("HaikuGame handleWordReturn - Word being returned:", word);
      setLines(prev => {
        const newLines = prev.map(line => line.filter(w => w !== word));
        console.log("HaikuGame handleWordReturn - New lines state:", JSON.stringify(newLines));
        return newLines;
      });
    },
    handleReset: () => {
      console.log("HaikuGame handleReset - Resetting all lines");
      // Return all words to the pool before clearing lines
      lines.flat().filter(isValidWord).forEach(word => {
        onWordReturn(word);
      });
      setLines([[], [], []]);
      setIsCorrect(false);
    }
  }));

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
    console.log("HaikuGame handleDrop - Word:", word, "Target line index:", index);
    
    if (!word || !isValidWord(word)) {
      console.log("HaikuGame handleDrop - No valid word data received");
      return;
    }

    console.log("HaikuGame handleDrop - Current lines state:", JSON.stringify(lines));

    // Remove the word from all lines first to prevent duplicates
    const newLines = lines.map(line => line.filter(w => w !== word));
    
    // Add the word to the target line
    newLines[index] = [...newLines[index], word];
    console.log("HaikuGame handleDrop - New lines state:", JSON.stringify(newLines));
    setLines(newLines);

    // Only call onWordUse if the word isn't in any line
    const isWordInLines = lines.some(line => line.includes(word));
    console.log("HaikuGame handleDrop - Is word already in lines?", isWordInLines);
    if (!isWordInLines) {
      onWordUse(word);
    }
  };

  const handleWordDrop = (lineIndex: number) => (draggedWord: string, dropIndex: number) => {
    console.log("HaikuGame handleWordDrop - Word:", draggedWord, "Line:", lineIndex, "Position:", dropIndex);
    console.log("HaikuGame handleWordDrop - Current lines:", JSON.stringify(lines));

    if (!isValidWord(draggedWord)) {
      console.log("HaikuGame handleWordDrop - Invalid word:", draggedWord);
      return;
    }

    // Remove the word from all lines first to prevent duplicates
    const newLines = lines.map(line => line.filter(w => w !== draggedWord));
    
    // Add the word at the specific position in the target line
    newLines[lineIndex] = [
      ...newLines[lineIndex].slice(0, dropIndex),
      draggedWord,
      ...newLines[lineIndex].slice(dropIndex)
    ];
    
    console.log("HaikuGame handleWordDrop - New lines:", JSON.stringify(newLines));
    setLines(newLines);

    // Check if the word is already in any line
    const isWordInLines = lines.some(line => line.includes(draggedWord));
    if (!isWordInLines) {
      // If the word is not in any line, add it to usedWords
      onWordUse(draggedWord);
    }
  };

  return (
    <div className="space-y-4">
      {solution.map((_, index) => (
        <HaikuLine
          key={index}
          words={lines[index].filter(isValidWord)}
          onDrop={handleDrop(index)}
          onWordDrop={handleWordDrop(index)}
          onWordReturnToPool={onWordReturn}
          lineIndex={index}
        />
      ))}
    </div>
  );
});

HaikuGame.displayName = "HaikuGame";

export default HaikuGame;
