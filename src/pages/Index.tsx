
import { useEffect, useState } from "react";
import HaikuPuzzle from "@/components/HaikuPuzzle";
import Navigation from "@/components/Navigation";
import { useHaikuData } from "@/hooks/useHaikuData";

const Index = () => {
  const [solvedCount, setSolvedCount] = useState(0);
  const { completedHaikus, isLoadingCompleted, refetchCompletedHaikus } = useHaikuData();

  // Force refetch when component mounts
  useEffect(() => {
    console.log("Index: Forcing refetch of completed haikus");
    refetchCompletedHaikus();
  }, [refetchCompletedHaikus]);

  // Initialize solved count from completed haikus
  useEffect(() => {
    if (completedHaikus && !isLoadingCompleted) {
      // Get unique haiku_ids to count accurately
      const uniqueHaikuIds = new Set(completedHaikus.map(haiku => haiku.haiku_id));
      console.log("Index: Setting solved count to", uniqueHaikuIds.size);
      setSolvedCount(uniqueHaikuIds.size);
    }
  }, [completedHaikus, isLoadingCompleted]);

  const handleSolvedCountChange = (count: number) => {
    console.log("Index: Solved count changed to", count);
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
