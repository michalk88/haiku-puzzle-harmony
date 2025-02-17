import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HaikuGame from "./HaikuGame";
import WordPool from "./WordPool";
import HaikuHeader from "./haiku/HaikuHeader";
import CompletedHaiku from "./haiku/CompletedHaiku";
import LoadingState from "./haiku/LoadingState";
import BottomNavigation from "./BottomNavigation";

const HaikuPuzzle: React.FC = () => {
  const [draggedWord, setDraggedWord] = useState<string>("");
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [currentHaikuIndex, setCurrentHaikuIndex] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [encouragingMessage, setEncouragingMessage] = useState<string>("");
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (encouragingMessage) {
      setIsMessageVisible(true);
      timeout = setTimeout(() => {
        setIsMessageVisible(false);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [encouragingMessage]);

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
      setEncouragingMessage("");
    }
  });

  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData("text/plain", word);
    setDraggedWord(word);
  };

  const handleWordUse = (word: string) => {
    setUsedWords(prev => new Set([...prev, word]));
  };

  const handleWordReturn = (word: string) => {
    setUsedWords(prev => {
      const newSet = new Set(prev);
      newSet.delete(word);
      return newSet;
    });
  };

  const handleNextHaiku = () => {
    if (haikus && currentHaikuIndex < haikus.length - 1) {
      setCurrentHaikuIndex(prev => prev + 1);
      setUsedWords(new Set());
      setIsSolved(false);
      setEncouragingMessage("");
      setIsMessageVisible(false);
    }
  };

  const handlePreviousHaiku = () => {
    if (currentHaikuIndex > 0) {
      setCurrentHaikuIndex(prev => prev - 1);
      setUsedWords(new Set());
      setIsSolved(false);
      setEncouragingMessage("");
      setIsMessageVisible(false);
    }
  };

  const handleReset = () => {
    setUsedWords(new Set());
    setIsSolved(false);
    setEncouragingMessage("");
    setIsMessageVisible(false);
  };

  const handleSolved = (message: string) => {
    setIsSolved(true);
    setEncouragingMessage(message);
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

  const availableWords = [
    ...currentHaiku.line1_words,
    ...currentHaiku.line2_words,
    ...currentHaiku.line3_words
  ];

  const remainingWords = availableWords.filter(word => !usedWords.has(word));

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-8 py-4 sm:py-8 pb-28">
      <HaikuHeader
        title={currentHaiku.title}
        isCompleted={isCompleted}
        isSolved={isSolved}
        isLastHaiku={currentHaikuIndex === haikus.length - 1}
        onReset={() => resetMutation.mutate(currentHaiku.id)}
        onNextHaiku={handleNextHaiku}
        isResetting={resetMutation.isPending}
        encouragingMessage={isMessageVisible ? encouragingMessage : ""}
      />

      {isCompleted || isSolved ? (
        <CompletedHaiku
          lines={[
            completedHaiku?.line1_arrangement || currentHaiku.line1_words,
            completedHaiku?.line2_arrangement || currentHaiku.line2_words,
            completedHaiku?.line3_arrangement || currentHaiku.line3_words
          ]}
        />
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
            onSolved={handleSolved}
          />
          
          <div className="mt-6 sm:mt-8">
            <WordPool
              words={remainingWords}
              onDragStart={handleDragStart}
              onWordReturn={handleWordReturn}
            />
          </div>
        </>
      )}

      <BottomNavigation
        onPrevious={handlePreviousHaiku}
        onNext={handleNextHaiku}
        onReset={handleReset}
        showPrevious={currentHaikuIndex > 0}
        isNextDisabled={!isSolved && !isCompleted}
        isResetting={resetMutation.isPending}
      />
    </div>
  );
};

export default HaikuPuzzle;
