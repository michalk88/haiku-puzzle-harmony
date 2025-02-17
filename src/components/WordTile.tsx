
import React from "react";

interface WordTileProps {
  word: string;
  onDragStart: (e: React.DragEvent, word: string) => void;
}

const WordTile: React.FC<WordTileProps> = ({ word, onDragStart }) => {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, word);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-black text-white px-3 py-1 rounded-lg cursor-move 
                shadow-lg hover:shadow-xl transition-all duration-200
                transform hover:-translate-y-1 hover:bg-gray-900
                text-sm sm:text-base"
    >
      {word}
    </div>
  );
};

export default WordTile;
