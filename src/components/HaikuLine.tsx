
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface HaikuLineProps {
  words: string[];
  onDrop: (e: React.DragEvent) => void;
  onWordDrop: (draggedWord: string, dropIndex: number) => void;
  onWordReturnToPool: (word: string) => void;
  className?: string;
}

const HaikuLine: React.FC<HaikuLineProps> = ({ 
  words, 
  onDrop, 
  onWordDrop, 
  onWordReturnToPool,
  className 
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

  // Calculate word size based on total content length
  const wordSize = useMemo(() => {
    const totalLength = words.join(' ').length;
    if (totalLength > 20) return "xs";
    if (totalLength > 15) return "sm";
    return "base";
  }, [words]) as "xs" | "sm" | "base";

  return (
    <div
      onDrop={onDrop}
      onDragOver={handleDragOver}
      className={cn(
        "min-h-[48px] sm:min-h-[72px] w-full border-b-2 border-haiku-border mb-4 sm:mb-6",
        "flex flex-nowrap gap-1.5 sm:gap-2 items-center p-2 overflow-x-auto",
        className
      )}
    >
      {words.map((word, index) => (
        <div
          key={`${word}-${index}`}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", word);
          }}
          onDragOver={(e) => handleWordDragOver(e, index)}
          onDrop={(e) => handleWordDrop(e, index)}
          className={`bg-black text-white rounded-lg cursor-move 
                    shadow-lg hover:shadow-xl transition-all duration-200
                    transform hover:-translate-y-1 hover:bg-gray-900
                    ${wordSize === "xs" ? "text-xs sm:text-sm px-2 py-0.5" :
                      wordSize === "sm" ? "text-sm sm:text-base px-2.5 py-0.5" :
                      "text-base sm:text-lg px-3 py-1"}`}
        >
          {word}
        </div>
      ))}
    </div>
  );
};

export default HaikuLine;
