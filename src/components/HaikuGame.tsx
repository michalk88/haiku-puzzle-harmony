import React, { useState, useEffect } from "react";
import HaikuLine from "./HaikuLine";
import { useToast } from "@/hooks/use-toast";

interface HaikuGameProps {
  solution: string[][];
  usedWords: Set<string>;
  onWordUse: (word: string) => void;
  onWordReturn: (word: string, lineIndex: number) => void;
  onSolved: () => void;
}

const HaikuGame: React.FC<HaikuGameProps> = ({ 
  solution, 
  usedWords, 
  onWordUse, 
  onWordReturn,
  onSolved
}) => {
  const [lines, setLines] = useState<string[][]>([[], [], []]);
  const { toast } = useToast();

  // Reset lines when solution changes (new haiku is loaded)
  useEffect(() => {
    setLines([[], [], []]);
  }, [solution]);

  useEffect(() => {
    checkSolution();
  }, [lines]);

  const checkSolution = () => {
    const isSolved = lines.every((line, lineIndex) => {
      if (line.length !== solution[lineIndex].length) return false;
      return line.every((word, wordIndex) => word === solution[lineIndex][wordIndex]);
    });

    if (isSolved) {
      toast({
        title: "Congratulations!",
        description: "You've successfully arranged the haiku in the correct order!",
        duration: 5000,
      });
      onSolved();
    }
  };

  const handleDrop = (lineIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    if (word) {
      // Create a copy of the current lines
      const newLines = [...lines];
      
      // Remove the word from its current line if it exists
      const currentLineIndex = lines.findIndex(line => line.includes(word));
      if (currentLineIndex !== -1) {
        newLines[currentLineIndex] = newLines[currentLineIndex].filter(w => w !== word);
      }
      
      // Add the word to the target line
      newLines[lineIndex] = [...newLines[lineIndex], word];
      setLines(newLines);
      
      // Ensure the word is marked as used
      onWordUse(word);
    }
  };

  const handleWordReorder = (lineIndex: number, draggedWord: string, dropIndex: number) => {
    const newLines = [...lines];
    
    // Remove the word from its current line if it exists
    const currentLineIndex = lines.findIndex(line => line.includes(draggedWord));
    if (currentLineIndex !== -1) {
      newLines[currentLineIndex] = newLines[currentLineIndex].filter(w => w !== draggedWord);
    }
    
    // Add the word at the specific position in the target line
    const currentLine = [...newLines[lineIndex]];
    currentLine.splice(dropIndex, 0, draggedWord);
    newLines[lineIndex] = currentLine;
    setLines(newLines);
  };

  return (
    <div className="mb-12">
      {lines.map((line, index) => (
        <HaikuLine
          key={index}
          words={line}
          onDrop={handleDrop(index)}
          onWordDrop={(draggedWord, dropIndex) => handleWordReorder(index, draggedWord, dropIndex)}
          onWordReturnToPool={(word) => onWordReturn(word, index)}
        />
      ))}
    </div>
  );
};

export default HaikuGame;