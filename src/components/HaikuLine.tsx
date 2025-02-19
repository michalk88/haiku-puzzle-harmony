
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface HaikuLineProps {
  words: string[];
  onDrop: (e: React.DragEvent) => void;
  onWordDrop: (draggedWord: string, dropIndex: number) => void;
  onWordReturnToPool: (word: string) => void;
  className?: string;
  lineIndex: number;
}

const HaikuLine: React.FC<HaikuLineProps> = ({ 
  words, 
  onDrop, 
  onWordDrop, 
  onWordReturnToPool,
  className,
  lineIndex
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleWordDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleWordDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedWord = e.dataTransfer.getData("text/plain");
    if (draggedWord) {
      onWordDrop(draggedWord, dropIndex);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent page scrolling during drag
    e.preventDefault();
  };

  // Calculate word size based on total content length and number of words
  const wordSize = useMemo(() => {
    const totalLength = words.join(' ').length;
    const wordCount = words.length;
    
    if (wordCount >= 5 || totalLength > 25) return "xs";
    if (wordCount >= 4 || totalLength > 20) return "sm";
    return "base";
  }, [words]) as "xs" | "sm" | "base";

  return (
    <div
      onDrop={onDrop}
      onDragOver={handleDragOver}
      onTouchMove={handleTouchMove}
      className={cn(
        "min-h-[64px] sm:min-h-[96px] w-full border-b-2 border-haiku-border mb-4 sm:mb-6",
        "flex flex-nowrap overflow-x-hidden items-center p-3 sm:p-4 touch-none",
        className
      )}
    >
      <div className="flex flex-nowrap gap-2 sm:gap-3 mx-auto">
        {words.map((word, index) => (
          <div
            key={`${word}-${index}`}
            draggable
            onDragStart={(e) => {
              console.log(`HaikuLine onDragStart - Word: ${word}, LineIndex: ${lineIndex}`);
              e.dataTransfer.setData("text/plain", word);
              e.dataTransfer.setData("lineIndex", lineIndex.toString());
              // Add touch feedback
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = '0.6';
              }
              console.log("HaikuLine onDragStart - Data set in dataTransfer");
            }}
            onDragEnd={(e) => {
              // Remove touch feedback
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = '';
              }
            }}
            onDragOver={(e) => handleWordDragOver(e, index)}
            onDrop={(e) => handleWordDrop(e, index)}
            onTouchMove={handleTouchMove}
            className={`bg-black text-white rounded-lg cursor-move 
                      touch-none select-none whitespace-nowrap
                      shadow-lg hover:shadow-xl transition-all duration-200
                      transform hover:-translate-y-1 hover:bg-gray-900 active:scale-95
                      ${wordSize === "xs" ? "text-sm sm:text-base px-2.5 py-1" :
                        wordSize === "sm" ? "text-base sm:text-lg px-3 py-1.5" :
                        "text-lg sm:text-xl px-4 py-2"}`}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HaikuLine;
