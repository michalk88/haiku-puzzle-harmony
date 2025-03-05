
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useHaikuData } from '@/hooks/useHaikuData';
import { CompletedHaiku } from '@/types/haiku';

interface SolvedHaikuDisplay {
  id: string;
  title: string;
  lines: string[][];
  haiku_id: string;
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
        
        // Validate line arrangements
        const line1 = Array.isArray(completion.line1_arrangement) 
          ? [...completion.line1_arrangement] // Create a copy to avoid mutation issues
          : [];
        const line2 = Array.isArray(completion.line2_arrangement) 
          ? [...completion.line2_arrangement]
          : [];
        const line3 = Array.isArray(completion.line3_arrangement) 
          ? [...completion.line3_arrangement]
          : [];
        
        // Add to the display list
        solvedHaikusList.push({
          id: completion.id,
          haiku_id: completion.haiku_id,
          title: originalHaiku.title || "Untitled Haiku",
          lines: [line1, line2, line3]
        });
        
        // Log for debugging
        console.log(`Processed haiku "${originalHaiku.title}":`, {
          line1: line1.join(' '),
          line2: line2.join(' '),
          line3: line3.join(' ')
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
