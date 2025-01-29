import React from "react";
import { cn } from "@/lib/utils";

interface HaikuLineProps {
  words: string[];
  onDrop: (e: React.DragEvent) => void;
  className?: string;
}

const HaikuLine: React.FC<HaikuLineProps> = ({ words, onDrop, className }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
          className="bg-haiku-tile px-3 py-1 rounded-lg text-haiku-text"
        >
          {word}
        </div>
      ))}
    </div>
  );
};

export default HaikuLine;