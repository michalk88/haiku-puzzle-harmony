
import { Puzzle, LogOut, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  solvedCount?: number;
}

const Navigation = ({ solvedCount = 0 }: NavigationProps) => {
  const { user, signOut } = useAuth();

  // Add console log to track when solvedCount changes
  console.log("Navigation rendering with solvedCount:", solvedCount);

  return (
    <nav className="bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <Puzzle className="h-5 w-5" />
          <span className="text-lg font-medium">Haiku Puzzle</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <Link to="/solved" className="text-emerald-600 font-medium hover:underline">
              {solvedCount} {solvedCount === 1 ? 'Haiku' : 'Haikus'} Solved
            </Link>
          )}
          
          {user ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => signOut()}
              className="flex items-center gap-1 text-gray-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 text-gray-600"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
