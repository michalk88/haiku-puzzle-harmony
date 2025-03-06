
import { useEffect, useState, useRef } from "react";
import HaikuPuzzle from "@/components/HaikuPuzzle";
import Navigation from "@/components/Navigation";
import { useHaikuData } from "@/hooks/useHaikuData";

const Index = () => {
  const [solvedCount, setSolvedCount] = useState(0);
  const initialLoadDoneRef = useRef(false);
  const countUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { completedHaikus, isLoadingCompleted, refetchCompletedHaikus } = useHaikuData();

  // Force refetch when component mounts - but only once
  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      console.log("Index: Forcing initial refetch of completed haikus");
      refetchCompletedHaikus();
      initialLoadDoneRef.current = true;
    }
    
    // Cleanup timer on unmount
    return () => {
      if (countUpdateTimerRef.current) {
        clearTimeout(countUpdateTimerRef.current);
      }
    };
  }, [refetchCompletedHaikus]);

  // Initialize solved count from completed haikus - with better uniqueness checking
  useEffect(() => {
    if (completedHaikus && !isLoadingCompleted) {
      // Cancel any pending updates
      if (countUpdateTimerRef.current) {
        clearTimeout(countUpdateTimerRef.current);
      }
      
      // Set a timer to update the count after a short delay
      // This helps prevent flickering and premature updates
      countUpdateTimerRef.current = setTimeout(() => {
        // Use a Set for unique haiku_ids to ensure accurate counting
        const uniqueHaikuIds = new Set(completedHaikus.map(haiku => haiku.haiku_id));
        const uniqueCount = uniqueHaikuIds.size;
        
        console.log("Index: Setting solved count to", uniqueCount, "unique IDs:", Array.from(uniqueHaikuIds));
        setSolvedCount(uniqueCount);
      }, 300);
    }
  }, [completedHaikus, isLoadingCompleted]);

  const handleSolvedCountChange = (count: number) => {
    console.log("Index: Explicit solved count change to", count);
    setSolvedCount(count);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation solvedCount={solvedCount} />
      <main className="container py-2">
        <HaikuPuzzle onSolvedCountChange={handleSolvedCountChange} />
      </main>
    </div>
  );
};

export default Index;
