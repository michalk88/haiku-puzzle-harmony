
import React from "react";
import WordTile from "./WordTile";

interface WordPoolProps {
  words: string[];
  onDragStart: (e: React.DragEvent, word: string) => void;
  onWordReturn: (word: string, lineIndex?: number) => void;
}

const WordPool: React.FC<WordPoolProps> = ({ words, onDragStart, onWordReturn }) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    if (word) {
      onWordReturn(word);
    }
  };

  // Calculate word size based on average word length
  const wordSize = words.join(' ').length / words.length > 6 ? "sm" : "base";

  return (
    <div 
      className="flex flex-wrap gap-1.5 sm:gap-3 justify-center p-2 sm:p-4 
                 border-2 border-dashed border-haiku-border rounded-lg"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {words.map((word) => (
        <WordTile
          key={word}
          word={word}
          onDragStart={onDragStart}
          size={wordSize}
        />
      ))}
    </div>
  );
};

export default WordPool;
