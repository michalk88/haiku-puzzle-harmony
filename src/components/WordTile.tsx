import React from "react";

interface WordTileProps {
  word: string;
  onDragStart: (word: string) => void;
}

const WordTile: React.FC<WordTileProps> = ({ word, onDragStart }) => {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(word);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-haiku-tile px-3 py-1 rounded-lg text-haiku-text cursor-move 
                hover:animate-tile-hover shadow-sm hover:shadow transition-shadow"
    >
      {word}
    </div>
  );
};

export default WordTile;