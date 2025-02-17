
import React from "react";

interface WordTileProps {
  word: string;
  onDragStart: (e: React.DragEvent, word: string) => void;
  size?: "xs" | "sm" | "base";
}

const WordTile: React.FC<WordTileProps> = ({ word, onDragStart, size = "base" }) => {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, word);
  };

  const sizeClasses = {
    xs: "text-xs sm:text-sm px-2 py-0.5",
    sm: "text-sm sm:text-base px-2.5 py-0.5",
    base: "text-base sm:text-lg px-3 py-1"
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`bg-black text-white rounded-lg cursor-move 
                shadow-lg hover:shadow-xl transition-all duration-200
                transform hover:-translate-y-1 hover:bg-gray-900
                ${sizeClasses[size]}`}
    >
      {word}
    </div>
  );
};

export default WordTile;
