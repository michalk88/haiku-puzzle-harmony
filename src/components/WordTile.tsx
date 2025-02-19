
import React from "react";

interface WordTileProps {
  word: string;
  onDragStart: (e: React.DragEvent, word: string) => void;
  size?: "xs" | "sm" | "base";
}

const WordTile: React.FC<WordTileProps> = ({ word, onDragStart, size = "base" }) => {
  const handleDragStart = (e: React.DragEvent) => {
    // Prevent scrolling during drag on mobile
    document.body.style.overflow = 'hidden';
    // Add touch feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.6';
    }
    onDragStart(e, word);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Re-enable scrolling
    document.body.style.overflow = '';
    // Remove touch feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent page scrolling during drag
    e.preventDefault();
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
      onDragEnd={handleDragEnd}
      onTouchMove={handleTouchMove}
      className={`bg-black text-white rounded-lg cursor-move 
                touch-none select-none
                shadow-lg hover:shadow-xl transition-all duration-200
                transform hover:-translate-y-1 hover:bg-gray-900 active:scale-95
                ${sizeClasses[size]}`}
    >
      {word}
    </div>
  );
};

export default WordTile;
