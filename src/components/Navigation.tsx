
import { Puzzle } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="border-b border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-14 flex items-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Puzzle className="h-5 w-5" />
          <span className="text-lg font-medium">Haiku Puzzle</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
