
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import HaikuLine from "./HaikuLine";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface HaikuGameProps {
  solution: string[][];
  usedWords: Set<string>;
  onWordUse: (word: string) => void;
  onWordReturn: (word: string) => void;
  onVerify: (currentLines: string[][], solution: string[][]) => void;
  onWordTap?: (word: string) => void;
  incorrectWords?: Set<string>;
  verificationState: 'idle' | 'checking' | 'correct' | 'incorrect' | 'continue';
}

const HaikuGame = forwardRef<{ 
  handleWordReturn: (word: string) => void;
  handleReset: () => void;
  getCurrentLines: () => string[][];
  addWordToNextAvailableSpot: (word: string) => void;
}, HaikuGameProps>(({
  solution,
  usedWords,
  onWordUse,
  onWordReturn,
  onVerify,
  onWordTap,
  incorrectWords = new Set(),
  verificationState
}, ref) => {
  const [lines, setLines] = useState<string[][]>([[], [], []]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const linesRef = useRef(lines);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const getTargetWordCount = (lineIndex: number) => {
    return solution[lineIndex]?.length || 0;
  };

  // Determine which line should be active based on current word counts
  useEffect(() => {
    // Check if there's room in the first line
    if (lines[0].length < getTargetWordCount(0)) {
      setActiveLineIndex(0);
    }
    // Check if there's room in the second line
    else if (lines[1].length < getTargetWordCount(1)) {
      setActiveLineIndex(1);
    }
    // Check if there's room in the third line
    else if (lines[2].length < getTargetWordCount(2)) {
      setActiveLineIndex(2);
    }
    // All lines are full
    else {
      setActiveLineIndex(-1);
    }
  }, [lines, solution]);

  useImperativeHandle(ref, () => ({
    handleWordReturn: (word: string) => {
      setLines(prev => {
        const newLines = prev.map(line => line.filter(w => w !== word));
        return newLines;
      });
    },
    handleReset: () => {
      setLines([[], [], []]);
      setActiveLineIndex(0);
    },
    getCurrentLines: () => linesRef.current,
    addWordToNextAvailableSpot: (word: string) => {
      if (activeLineIndex < 0) {
        console.log("No available spots to add word:", word);
        return; // All lines are full
      }

      setLines(prev => {
        // Remove the word from any line if it exists
        const newLines = prev.map(line => line.filter(w => w !== word));
        
        // Add the word to the active line
        if (activeLineIndex >= 0 && activeLineIndex < newLines.length) {
          newLines[activeLineIndex] = [...newLines[activeLineIndex], word];
        }
        
        return newLines;
      });

      // Mark word as used
      if (!usedWords.has(word)) {
        onWordUse(word);
      }
    }
  }));

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    
    if (!word) {
      return;
    }

    const newLines = lines.map(line => line.filter(w => w !== word));
    newLines[index] = [...newLines[index], word];
    setLines(newLines);

    const isWordInLines = lines.some(line => line.includes(word));
    if (!isWordInLines) {
      onWordUse(word);
    }
  };

  const handleWordDrop = (lineIndex: number) => (draggedWord: string, dropIndex: number) => {
    if (!draggedWord) {
      return;
    }

    const newLines = lines.map(line => line.filter(w => w !== draggedWord));
    
    newLines[lineIndex] = [
      ...newLines[lineIndex].slice(0, dropIndex),
      draggedWord,
      ...newLines[lineIndex].slice(dropIndex)
    ];
    
    setLines(newLines);

    const isWordInLines = lines.some(line => line.includes(draggedWord));
    if (!isWordInLines) {
      onWordUse(draggedWord);
    }
  };

  const isComplete = lines.every((line, i) => line.length === solution[i].length);

  const buttonVariants = {
    idle: "secondary",
    checking: "secondary opacity-50",
    correct: "primary",
    incorrect: "bg-orange-500 hover:bg-orange-600 text-white",
    continue: "primary"
  };

  const buttonText = {
    idle: "Check",
    checking: "Checking...",
    correct: "Correct!",
    incorrect: "Incorrect!",
    continue: "Continue"
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
            isActive={index === activeLineIndex}
            targetWordCount={getTargetWordCount(index)}
          />
        ))}
      </div>
      
      {isComplete && (
        <div className="flex justify-center mt-10 mb-14">
          <Button
            onClick={() => verificationState === 'continue' ? undefined : onVerify(lines, solution)}
            disabled={verificationState === 'checking'}
            className={cn(
              "haiku-action-button",
              buttonVariants[verificationState]
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
