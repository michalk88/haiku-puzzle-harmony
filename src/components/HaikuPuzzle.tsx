import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HaikuGame from "./HaikuGame";
import WordPool from "./WordPool";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

const HaikuPuzzle: React.FC = () => {
  const [draggedWord, setDraggedWord] = useState<string>("");
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [currentHaikuIndex, setCurrentHaikuIndex] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  const { data: haikus, isLoading } = useQuery({
    queryKey: ['haikus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('haikus')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData("text/plain", word);
    setDraggedWord(word);
  };

  const handleWordUse = (word: string) => {
    setUsedWords(new Set([...usedWords, word]));
    setDraggedWord("");
  };

  const handleWordReturn = (word: string) => {
    const newUsedWords = new Set(usedWords);
    newUsedWords.delete(word);
    setUsedWords(newUsedWords);
  };

  const handleNextHaiku = () => {
    if (haikus && currentHaikuIndex < haikus.length - 1) {
      setCurrentHaikuIndex(prev => prev + 1);
      setUsedWords(new Set());
      setIsSolved(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!haikus || haikus.length === 0) {
    return <div>No haikus available</div>;
  }

  const currentHaiku = haikus[currentHaikuIndex];
  const availableWords = [
    ...currentHaiku.line1_words,
    ...currentHaiku.line2_words,
    ...currentHaiku.line3_words
  ];

  const remainingWords = availableWords.filter(word => !usedWords.has(word));

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{currentHaiku.title}</h2>
        <Button 
          onClick={handleNextHaiku}
          disabled={!isSolved || currentHaikuIndex === haikus.length - 1}
        >
          Next Haiku
        </Button>
      </div>

      <HaikuGame
        solution={[
          currentHaiku.line1_words,
          currentHaiku.line2_words,
          currentHaiku.line3_words
        ]}
        usedWords={usedWords}
        onWordUse={handleWordUse}
        onWordReturn={handleWordReturn}
        onSolved={() => setIsSolved(true)}
      />
      
      <WordPool
        words={remainingWords}
        onDragStart={handleDragStart}
        onWordReturn={handleWordReturn}
      />
    </div>
  );
};

export default HaikuPuzzle;