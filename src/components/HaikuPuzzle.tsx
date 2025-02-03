import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HaikuGame from "./HaikuGame";
import WordPool from "./WordPool";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HaikuPuzzle: React.FC = () => {
  const [draggedWord, setDraggedWord] = useState<string>("");
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [currentHaikuIndex, setCurrentHaikuIndex] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: haikus, isLoading: isLoadingHaikus } = useQuery({
    queryKey: ['haikus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('haikus')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: completedHaikus, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['completed_haikus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('completed_haikus')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const resetMutation = useMutation({
    mutationFn: async (haikuId: string) => {
      const { error } = await supabase
        .from('completed_haikus')
        .delete()
        .eq('haiku_id', haikuId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completed_haikus'] });
      setIsSolved(false);
      setUsedWords(new Set());
      toast({
        title: "Haiku Reset",
        description: "You can now solve this haiku again!",
      });
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

  const handleReset = (haikuId: string) => {
    resetMutation.mutate(haikuId);
  };

  if (isLoadingHaikus || isLoadingCompleted) {
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
  const isCompleted = completedHaikus?.some(ch => ch.haiku_id === currentHaiku.id);
  const completedHaiku = completedHaikus?.find(ch => ch.haiku_id === currentHaiku.id);

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
        <div className="flex gap-2">
          {isCompleted && (
            <Button 
              variant="outline"
              onClick={() => handleReset(currentHaiku.id)}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Reset'
              )}
            </Button>
          )}
          <Button 
            onClick={handleNextHaiku}
            disabled={!isSolved || currentHaikuIndex === haikus.length - 1}
          >
            Next Haiku
          </Button>
        </div>
      </div>

      {isCompleted ? (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            {[completedHaiku?.line1_arrangement, completedHaiku?.line2_arrangement, completedHaiku?.line3_arrangement].map((line, index) => (
              <p key={index} className="text-lg">
                {line?.join(' ')}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <>
          <HaikuGame
            key={currentHaikuIndex} // Add this line to force remount on haiku change
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
        </>
      )}
    </div>
  );
};

export default HaikuPuzzle;