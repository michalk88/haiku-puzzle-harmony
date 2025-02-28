
import { Puzzle } from "lucide-react";
import { Link } from "react-router-dom";

interface NavigationProps {
  solvedCount?: number;
}

const Navigation = ({ solvedCount }: NavigationProps) => {
  return (
    <nav className="bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <Puzzle className="h-5 w-5" />
          <span className="text-lg font-medium">Haiku Puzzle</span>
        </div>
        {solvedCount !== undefined && (
          <div className="text-emerald-600 font-medium">
            {solvedCount} {solvedCount === 1 ? 'Haiku' : 'Haikus'} Solved
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
