
import React, { useState } from "react";

interface WordTileProps {
  word: string;
  onDragStart: (e: React.DragEvent, word: string) => void;
  onTap?: (word: string) => void;
  size?: "xs" | "sm" | "base";
  inPool?: boolean;
}

const WordTile: React.FC<WordTileProps> = ({ 
  word, 
  onDragStart, 
  onTap, 
  size = "base", 
  inPool = false 
}) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    // Set data transfer properties without preventing default
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData("text/plain", word);
    
    // Prevent scrolling during drag on mobile
    document.body.style.overflow = 'hidden';
    
    // Add touch feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.6';
    }
    
    setIsDragging(true);
    
    // Call the parent's drag start handler
    onDragStart(e, word);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Re-enable scrolling
    document.body.style.overflow = '';
    // Remove touch feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '';
    }
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent page scrolling during drag
    e.preventDefault();
  };

  const handleClick = () => {
    // Only trigger tap if it's in the pool and not a drag operation
    if (inPool && onTap && !isDragging) {
      onTap(word);
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10); // 10ms vibration
      }
    }
  };
  
  // For mobile: start timer on touch start for potential long press
  const handleTouchStart = (e: React.TouchEvent) => {
    if (longPressTimer) clearTimeout(longPressTimer);
    
    const timer = setTimeout(() => {
      // This will be triggered on long press
      // We don't need to do anything special here as the
      // native dragstart event will be triggered
      if (navigator.vibrate) {
        navigator.vibrate([15, 10, 15]); // Pattern for "drag started"
      }
    }, 500); // 500ms is a common threshold for long press
    
    setLongPressTimer(timer);
  };
  
  // Clear timer if touch ends before long press threshold
  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const sizeClasses = {
    xs: "text-xs sm:text-sm px-2 py-0.5",
    sm: "text-sm sm:text-base px-2.5 py-0.5",
    base: "text-base sm:text-lg px-3 py-1"
  };

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      className={`bg-black text-white rounded-lg cursor-move 
                touch-none select-none
                shadow-lg hover:shadow-xl transition-all duration-200
                transform hover:-translate-y-1 hover:bg-gray-900 active:scale-95
                ${inPool && onTap ? 'hover:bg-indigo-700' : ''}
                ${sizeClasses[size]}`}
      role="button"
      aria-label={inPool ? `Tap to place word: ${word}` : `Word: ${word}, drag to reorder`}
    >
      {word}
    </div>
  );
};

export default WordTile;
