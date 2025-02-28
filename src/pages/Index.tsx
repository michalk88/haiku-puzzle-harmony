
import { useState } from "react";
import HaikuPuzzle from "@/components/HaikuPuzzle";
import Navigation from "@/components/Navigation";

const Index = () => {
  const [solvedCount, setSolvedCount] = useState(0);

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
