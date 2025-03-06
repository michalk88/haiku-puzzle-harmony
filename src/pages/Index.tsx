
import { useEffect, useState, useRef } from "react";
import HaikuPuzzle from "@/components/HaikuPuzzle";
import Navigation from "@/components/Navigation";
import { useHaikuData } from "@/hooks/useHaikuData";

const Index = () => {
  const [solvedCount, setSolvedCount] = useState(0);
  const initialLoadDoneRef = useRef(false);
  const countUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countUpdateLockRef = useRef(false);
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

  // Initialize solved count from completed haikus - with faster updates
  useEffect(() => {
    if (completedHaikus && !isLoadingCompleted && !countUpdateLockRef.current) {
      // Cancel any pending updates
      if (countUpdateTimerRef.current) {
        clearTimeout(countUpdateTimerRef.current);
      }
      
      // Update immediately to reduce delay
      // Use a Set for unique haiku_ids to ensure accurate counting
      const uniqueHaikuIds = new Set(completedHaikus.map(haiku => haiku.haiku_id));
      const uniqueCount = uniqueHaikuIds.size;
      
      console.log("Index: Setting solved count to", uniqueCount, "unique IDs:", Array.from(uniqueHaikuIds));
      setSolvedCount(uniqueCount);
    }
  }, [completedHaikus, isLoadingCompleted]);

  const handleSolvedCountChange = (count: number) => {
    console.log("Index: Explicit solved count change request to", count);
    
    // Set a brief lock to prevent effect-triggered updates from overriding this explicit update
    countUpdateLockRef.current = true;
    
    // Cancel any pending updates
    if (countUpdateTimerRef.current) {
      clearTimeout(countUpdateTimerRef.current);
    }
    
    // Update the count immediately since this is an explicit change
    setSolvedCount(count);
    
    // Release the lock after a delay
    setTimeout(() => {
      countUpdateLockRef.current = false;
    }, 300);
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
