
import HaikuPuzzle from "@/components/HaikuPuzzle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <h1 className="text-2xl font-medium text-gray-600 text-center mb-6">
          Haiku Puzzle
        </h1>
        <HaikuPuzzle />
      </main>
    </div>
  );
};

export default Index;
