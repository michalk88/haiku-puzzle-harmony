
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useHaikuData } from '@/hooks/useHaikuData';
import { CompletedHaiku } from '@/types/haiku';

interface SolvedHaikuDisplay {
  id: string;
  title: string;
  haiku_id: string;
  words: {
    line1: string[];
    line2: string[];
    line3: string[];
  };
}

export const useSolvedHaikus = () => {
  const { completedHaikus, isLoadingCompleted, refetchCompletedHaikus, resetAllMutation } = useHaikuData();
  const [solvedCount, setSolvedCount] = useState(0);
  const [displayHaikus, setDisplayHaikus] = useState<SolvedHaikuDisplay[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Force refetch when component mounts to ensure fresh data
  useEffect(() => {
    if (user) {
      console.log("SolvedHaikus: Forcing refetch of completed haikus");
      refetchCompletedHaikus();
    }
  }, [user, refetchCompletedHaikus]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user && !isLoadingCompleted) {
      navigate('/auth');
    }
  }, [user, isLoadingCompleted, navigate]);

  // Process the completed haikus data to create proper display data
  useEffect(() => {
    if (completedHaikus && !isLoadingCompleted) {
      console.log("Processing haikus for display:", completedHaikus.length, "completions");
      
      const solvedHaikusList: SolvedHaikuDisplay[] = [];
      
      for (const completion of completedHaikus) {
        if (!completion.originalHaiku) {
          console.warn(`No originalHaiku found for completion with haiku_id: ${completion.haiku_id}`);
          continue;
        }
        
        const originalHaiku = completion.originalHaiku;
        
        // Add to the display list with the original words from the haiku
        solvedHaikusList.push({
          id: completion.id,
          haiku_id: completion.haiku_id,
          title: originalHaiku.title || "Untitled Haiku",
          words: {
            line1: originalHaiku.line1_words || [],
            line2: originalHaiku.line2_words || [],
            line3: originalHaiku.line3_words || []
          }
        });
        
        // Log for debugging
        console.log(`Processed haiku "${originalHaiku.title}":`, {
          line1: originalHaiku.line1_words.join(' '),
          line2: originalHaiku.line2_words.join(' '),
          line3: originalHaiku.line3_words.join(' ')
        });
      }
      
      setDisplayHaikus(solvedHaikusList);
      setSolvedCount(solvedHaikusList.length);
    }
  }, [completedHaikus, isLoadingCompleted]);

  const handleResetAll = async () => {
    if (window.confirm("Are you sure you want to reset all your solved haikus? This will allow you to solve them again.")) {
      setIsResetting(true);
      console.log("Starting reset all process...");
      
      try {
        await resetAllMutation.mutateAsync();
        
        // Clear the local state immediately
        setDisplayHaikus([]);
        setSolvedCount(0);
        
        // Force a refetch to make sure we get the latest data
        await refetchCompletedHaikus();
        
        // Add a small delay before redirecting
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } catch (error) {
        console.error("Error resetting all haikus:", error);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return {
    displayHaikus,
    isResetting,
    isLoadingCompleted,
    solvedCount,
    handleResetAll,
    setSolvedCount
  };
};
