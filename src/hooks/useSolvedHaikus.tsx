
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
      
      // Create display data from the completed haikus and their corresponding original haiku data
      const solvedHaikusList: SolvedHaikuDisplay[] = completedHaikus
        .filter(completion => {
          if (!completion.originalHaiku) {
            console.warn(`No originalHaiku found for completion with haiku_id: ${completion.haiku_id}`);
            return false;
          }
          return true;
        })
        .map(completion => {
          const originalHaiku = completion.originalHaiku;
          
          if (!originalHaiku) {
            console.warn(`No haiku found for id: ${completion.haiku_id}`);
            return null;
          }

          // Log detailed information for debugging
          console.log(`--- DETAILED HAIKU INFO ---`);
          console.log(`Haiku ID: ${completion.haiku_id}`);
          console.log(`Title: ${originalHaiku.title}`);
          console.log(`Completion ID: ${completion.id}`);
          
          // Log the actual line arrangements
          console.log(`Line1 arrangement (${completion.line1_arrangement?.length || 0} words):`, 
            JSON.stringify(completion.line1_arrangement));
          console.log(`Line2 arrangement (${completion.line2_arrangement?.length || 0} words):`, 
            JSON.stringify(completion.line2_arrangement));
          console.log(`Line3 arrangement (${completion.line3_arrangement?.length || 0} words):`, 
            JSON.stringify(completion.line3_arrangement));
          
          // Log the full object for comparison
          console.log(`Full completion object:`, JSON.stringify(completion, null, 2));

          // Make sure line1_arrangement, line2_arrangement, line3_arrangement are valid arrays
          const line1 = Array.isArray(completion.line1_arrangement) ? completion.line1_arrangement : [];
          const line2 = Array.isArray(completion.line2_arrangement) ? completion.line2_arrangement : [];
          const line3 = Array.isArray(completion.line3_arrangement) ? completion.line3_arrangement : [];

          return {
            id: completion.id,
            haiku_id: completion.haiku_id,
            title: originalHaiku.title || "Untitled Haiku",
            lines: [line1, line2, line3]
          };
        })
        .filter(Boolean) as SolvedHaikuDisplay[];
      
      console.log("Processed solved haikus for display:", solvedHaikusList.length);
      
      // Log each processed haiku for verification
      solvedHaikusList.forEach((haiku, index) => {
        console.log(`Processed Haiku ${index + 1} (${haiku.haiku_id}):`, {
          id: haiku.id,
          title: haiku.title,
          line1: haiku.lines[0],
          line2: haiku.lines[1],
          line3: haiku.lines[2]
        });
      });
      
      setDisplayHaikus(solvedHaikusList);
      
      // Update the solved count
      setSolvedCount(solvedHaikusList.length);
    }
  }, [completedHaikus, isLoadingCompleted]);

  const handleResetAll = async () => {
    if (window.confirm("Are you sure you want to reset all your solved haikus? This will allow you to solve them again.")) {
      setIsResetting(true);
      console.log("Starting reset all process...");
      
      try {
        await resetAllMutation.mutateAsync();
        console.log("Reset completed, setting solvedCount to 0");
        
        // Clear the local state immediately
        setDisplayHaikus([]);
        setSolvedCount(0);
        
        // Add a small delay to ensure the UI updates before navigating
        setTimeout(() => {
          console.log("Redirecting to home after reset");
          navigate('/', { replace: true });
        }, 500);
      } catch (error) {
        console.error("Error resetting all haikus:", error);
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
