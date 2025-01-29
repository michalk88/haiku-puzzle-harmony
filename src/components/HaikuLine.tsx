import React from "react";
import { cn } from "@/lib/utils";

interface HaikuLineProps {
  words: string[];
  onDrop: (e: React.DragEvent) => void;
  onWordDrop: (draggedWord: string, dropIndex: number) => void;
  className?: string;
}

const HaikuLine: React.FC<HaikuLineProps> = ({ words, onDrop, onWordDrop, className }) => {
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

  return (
    <div
      onDrop={onDrop}
      onDragOver={handleDragOver}
      className={cn(
        "min-h-[40px] w-full border-b-2 border-haiku-border mb-6 flex gap-2 items-center",
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
          className="bg-haiku-tile px-3 py-1 rounded-lg text-haiku-text cursor-move 
                    hover:animate-tile-hover shadow-sm hover:shadow transition-shadow"
        >
          {word}
        </div>
      ))}
    </div>
  );
};

export default HaikuLine;