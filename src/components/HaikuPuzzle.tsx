
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HaikuGame from "./HaikuGame";
import WordPool from "./WordPool";
import { useToast } from "@/hooks/use-toast";
import HaikuHeader from "./haiku/HaikuHeader";
import CompletedHaiku from "./haiku/CompletedHaiku";
import LoadingState from "./haiku/LoadingState";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";

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

  if (isLoadingHaikus || isLoadingCompleted) {
    return <LoadingState />;
  }

  if (!haikus || haikus.length === 0) {
    return <div>No haikus available</div>;
  }

  const currentHaiku = haikus[currentHaikuIndex];
  const isCompleted = completedHaikus?.some(ch => ch.haiku_id === currentHaiku.id);
  const completedHaiku = completedHaikus?.find(ch => ch.haiku_id === currentHaiku.id);
  const isLastHaiku = currentHaikuIndex === haikus.length - 1;

  const availableWords = [
    ...currentHaiku.line1_words,
    ...currentHaiku.line2_words,
    ...currentHaiku.line3_words
  ];

  const remainingWords = availableWords.filter(word => !usedWords.has(word));

  return (
    <div className="max-w-2xl mx-auto p-8">
      <HaikuHeader
        title={currentHaiku.title}
        isCompleted={isCompleted}
        isSolved={isSolved}
        isLastHaiku={isLastHaiku}
        onReset={() => resetMutation.mutate(currentHaiku.id)}
        onNextHaiku={handleNextHaiku}
        isResetting={resetMutation.isPending}
      />

      {isCompleted || isSolved ? (
        <>
          <CompletedHaiku
            lines={[
              completedHaiku?.line1_arrangement || currentHaiku.line1_words,
              completedHaiku?.line2_arrangement || currentHaiku.line2_words,
              completedHaiku?.line3_arrangement || currentHaiku.line3_words
            ]}
          />
          {!isLastHaiku && isSolved && (
            <div className="mt-8 flex justify-center">
              <Button 
                onClick={handleNextHaiku}
                className="px-6 py-2 text-lg"
              >
                Next Haiku
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          <HaikuGame
            key={currentHaikuIndex}
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
