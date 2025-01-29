import HaikuPuzzle from "@/components/HaikuPuzzle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-16">
        <h1 className="text-3xl font-semibold text-center mb-12 text-haiku-text">
          Haiku Puzzle
        </h1>
        <HaikuPuzzle />
      </main>
    </div>
  );
};

export default Index;