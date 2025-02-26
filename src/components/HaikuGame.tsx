import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import HaikuLine from "./HaikuLine";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface HaikuGameProps {
  solution: string[][];
  usedWords: Set<string>;
  onWordUse: (word: string) => void;
  onWordReturn: (word: string) => void;
  onVerify: (lines: string[][]) => void;
  incorrectWords?: Set<string>;
  verificationState: 'idle' | 'checking' | 'correct' | 'incorrect' | 'continue';
}

const HaikuGame = forwardRef<{ 
  handleWordReturn: (word: string) => void;
  handleReset: () => void;
  getCurrentLines: () => string[][];
}, HaikuGameProps>(({
  solution,
  usedWords,
  onWordUse,
  onWordReturn,
  onVerify,
  incorrectWords = new Set(),
  verificationState
}, ref) => {
  const [lines, setLines] = useState<string[][]>([[], [], []]);
  const linesRef = useRef(lines);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  useImperativeHandle(ref, () => ({
    handleWordReturn: (word: string) => {
      setLines(prev => {
        const newLines = prev.map(line => line.filter(w => w !== word));
        return newLines;
      });
    },
    handleReset: () => {
      setLines([[], [], []]);
    },
    getCurrentLines: () => linesRef.current
  }));

  const isComplete = lines.every((line, i) => line.length === solution[i].length);

  const buttonStyles = {
    idle: "bg-black hover:bg-gray-900",
    checking: "bg-black opacity-50",
    correct: "bg-green-500 hover:bg-green-600",
    incorrect: "bg-orange-500 hover:bg-orange-600",
    continue: "bg-green-500 hover:bg-green-600"
  };

  const buttonText = {
    idle: "Check",
    checking: "Checking...",
    correct: "Correct!",
    incorrect: "Incorrect!",
    continue: "Continue"
  };

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    console.log("HaikuGame handleDrop - Word:", word, "Target line index:", index);
    
    if (!word || !isValidWord(word)) {
      console.log("HaikuGame handleDrop - No valid word data received");
      return;
    }

    console.log("HaikuGame handleDrop - Current lines state:", JSON.stringify(lines));

    const newLines = lines.map(line => line.filter(w => w !== word));
    
    newLines[index] = [...newLines[index], word];
    console.log("HaikuGame handleDrop - New lines state:", JSON.stringify(newLines));
    setLines(newLines);

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

    const newLines = lines.map(line => line.filter(w => w !== draggedWord));
    
    newLines[lineIndex] = [
      ...newLines[lineIndex].slice(0, dropIndex),
      draggedWord,
      ...newLines[lineIndex].slice(dropIndex)
    ];
    
    console.log("HaikuGame handleWordDrop - New lines:", JSON.stringify(newLines));
    setLines(newLines);

    const isWordInLines = lines.some(line => line.includes(draggedWord));
    if (!isWordInLines) {
      onWordUse(draggedWord);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {solution.map((_, index) => (
          <HaikuLine
            key={index}
            words={lines[index]}
            onDrop={handleDrop(index)}
            onWordDrop={handleWordDrop(index)}
            onWordReturnToPool={onWordReturn}
            lineIndex={index}
            incorrectWords={incorrectWords}
          />
        ))}
      </div>
      
      {isComplete && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => verificationState === 'continue' ? undefined : onVerify(lines)}
            disabled={verificationState === 'checking'}
            className={cn(
              "transition-all duration-300",
              buttonStyles[verificationState]
            )}
          >
            {buttonText[verificationState]}
          </Button>
        </div>
      )}
    </div>
  );
});

HaikuGame.displayName = "HaikuGame";

export default HaikuGame;
