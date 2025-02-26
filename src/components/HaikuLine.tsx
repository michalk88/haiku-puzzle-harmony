
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface HaikuLineProps {
  words: string[];
  onDrop: (e: React.DragEvent) => void;
  onWordDrop: (draggedWord: string, dropIndex: number) => void;
  onWordReturnToPool: (word: string) => void;
  className?: string;
  lineIndex: number;
  incorrectWords?: Set<string>;
}

const HaikuLine: React.FC<HaikuLineProps> = ({ 
  words, 
  onDrop, 
  onWordDrop, 
  onWordReturnToPool,
  className,
  lineIndex,
  incorrectWords = new Set()
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
    e.preventDefault();
  };

  // Calculate word size based on total content length and number of words
  const wordSize = useMemo(() => {
    const totalLength = words.join(' ').length;
    const wordCount = words.length;
    
    // More aggressive size reduction for longer content
    if (wordCount >= 6) return "xs";
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
        "flex items-center justify-center px-1 py-2 sm:p-3 touch-none overflow-visible",
        className
      )}
    >
      <div className="w-full max-w-[98%] flex flex-nowrap items-center justify-center gap-1 sm:gap-2">
        {words.map((word, index) => (
          <div
            key={`${word}-${index}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", word);
              e.dataTransfer.setData("lineIndex", lineIndex.toString());
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = '0.6';
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = '';
              }
            }}
            onDragOver={(e) => handleWordDragOver(e, index)}
            onDrop={(e) => handleWordDrop(e, index)}
            onTouchMove={handleTouchMove}
            className={cn(
              `cursor-move touch-none select-none whitespace-nowrap shrink-0
              shadow-lg hover:shadow-xl transition-all duration-200
              transform hover:-translate-y-1 active:scale-95 rounded-lg`,
              incorrectWords.has(word) 
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-black hover:bg-gray-900",
              wordSize === "xs" ? "text-xs sm:text-sm px-1.5 py-0.5" :
              wordSize === "sm" ? "text-sm sm:text-base px-2 py-0.75" :
              "text-base sm:text-lg px-2.5 py-1"
            )}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HaikuLine;
