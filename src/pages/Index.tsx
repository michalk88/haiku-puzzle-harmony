
import HaikuPuzzle from "@/components/HaikuPuzzle";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-2">
        <HaikuPuzzle />
      </main>
    </div>
  );
};

export default Index;
