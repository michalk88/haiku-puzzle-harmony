
import { useEffect, useState } from "react";
import HaikuPuzzle from "@/components/HaikuPuzzle";
import Navigation from "@/components/Navigation";
import { useHaikuData } from "@/hooks/useHaikuData";

const Index = () => {
  const [solvedCount, setSolvedCount] = useState(0);
  const { completedHaikus, isLoadingCompleted } = useHaikuData();

  // Initialize solved count from completed haikus
  useEffect(() => {
    if (completedHaikus && !isLoadingCompleted) {
      console.log("Index: Setting solved count to", completedHaikus.length);
      setSolvedCount(completedHaikus.length);
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
