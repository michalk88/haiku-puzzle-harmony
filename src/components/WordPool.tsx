
import React from "react";
import WordTile from "./WordTile";

interface WordPoolProps {
  words: string[];
  onDragStart: (e: React.DragEvent, word: string) => void;
  onWordReturn: (word: string, lineIndex?: number) => void;
  onWordTap?: (word: string) => void;
}

const WordPool: React.FC<WordPoolProps> = ({ 
  words, 
  onDragStart, 
  onWordReturn, 
  onWordTap 
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    // Prevent default to enable dropping
    e.preventDefault();
    // Set dropEffect to move for consistent visual feedback
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    const lineIndex = e.dataTransfer.getData("lineIndex");
    
    console.log("WordPool handleDrop - Received word:", word);
    console.log("WordPool handleDrop - Received lineIndex:", lineIndex);
    
    if (!word) {
      console.log("WordPool handleDrop - No word data received");
      return;
    }

    console.log("WordPool handleDrop - Calling onWordReturn with:", { word, lineIndex: lineIndex ? parseInt(lineIndex) : undefined });
    onWordReturn(word, lineIndex ? parseInt(lineIndex) : undefined);
    
    e.dataTransfer.clearData();
  };

  const handleWordTap = (word: string) => {
    if (onWordTap) {
      console.log("WordPool handleWordTap - Word tapped:", word);
      onWordTap(word);
    }
  };

  // Calculate word size based on average word length
  const wordSize = words.join(' ').length / words.length > 6 ? "sm" : "base";

  return (
    <div 
      className="flex flex-wrap gap-1.5 sm:gap-3 justify-center p-2 sm:p-4 
                 rounded-lg"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="region"
      aria-label="Word pool"
    >
      {words.map((word) => (
        <WordTile
          key={`pool-${word}`}
          word={word}
          onDragStart={onDragStart}
          onTap={handleWordTap}
          size={wordSize}
          inPool={true}
        />
      ))}
    </div>
  );
};

export default WordPool;
