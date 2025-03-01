
import HaikuPuzzle from "@/components/HaikuPuzzle";
import Navigation from "@/components/Navigation";
import { useState } from "react";
import { useHaikuData } from "@/hooks/useHaikuData";

const Index = () => {
  const [solvedCount, setSolvedCount] = useState(0);
  const { completedHaikus } = useHaikuData();

  // Initialize solved count from completed haikus
  useState(() => {
    if (completedHaikus) {
      setSolvedCount(completedHaikus.length);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation solvedCount={solvedCount} />
      <main className="container py-2">
        <HaikuPuzzle onSolvedCountChange={setSolvedCount} />
      </main>
    </div>
  );
};

export default Index;
