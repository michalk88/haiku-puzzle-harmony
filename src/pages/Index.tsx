
import HaikuPuzzle from "@/components/HaikuPuzzle";
import Navigation from "@/components/Navigation";
import { useHaikuSession } from "@/hooks/useHaikuSession";

const Index = () => {
  const { solvedCount, setSolvedCount } = useHaikuSession();

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
