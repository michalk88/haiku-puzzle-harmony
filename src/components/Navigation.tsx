
import { ArrowLeft, Puzzle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface NavigationProps {
  solvedCount?: number;
}

const Navigation = ({ solvedCount }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const showBackButton = location.pathname === '/solved';

  return (
    <nav className="border-b border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          {showBackButton ? (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Puzzle className="h-5 w-5" />
          )}
          <span className="text-lg font-medium">Haiku Puzzle</span>
        </div>
        {solvedCount !== undefined && location.pathname !== '/solved' && (
          <Link 
            to="/solved" 
            className="text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            {solvedCount} {solvedCount === 1 ? 'Haiku' : 'Haikus'} Solved
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
