
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import LoadingState from '@/components/haiku/LoadingState';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHaikuData } from '@/hooks/useHaikuData';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NoHaikuAvailable from '@/components/haiku/NoHaikusAvailable';
import { CompletedHaiku } from '@/types/haiku';

interface SolvedHaikuDisplay {
  id: string;
  title: string;
  lines: string[][];
  haiku_id: string;
}

const SolvedHaikus = () => {
  const { completedHaikus, isLoadingCompleted, refetchCompletedHaikus, resetAllMutation } = useHaikuData();
  const [solvedCount, setSolvedCount] = useState(0);
  const [displayHaikus, setDisplayHaikus] = useState<SolvedHaikuDisplay[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Force refetch when component mounts to ensure fresh data
  useEffect(() => {
    if (user) {
      console.log("SolvedHaikus: Forcing refetch of completed haikus");
      refetchCompletedHaikus();
    }
  }, [user, refetchCompletedHaikus]);

  useEffect(() => {
    if (!user && !isLoadingCompleted) {
      navigate('/auth');
    }
  }, [user, isLoadingCompleted, navigate]);

  // Process the completed haikus data to create proper display data
  useEffect(() => {
    if (completedHaikus && !isLoadingCompleted) {
      console.log("Processing haikus for display:", completedHaikus.length, "completions");
      
      // Create an object to deduplicate haikus by ID for debugging
      const uniqueHaikus = new Map();
      
      // Create display data from the completed haikus and their corresponding original haiku data
      const solvedHaikusList: SolvedHaikuDisplay[] = completedHaikus
        .filter(completion => {
          if (!completion.originalHaiku) {
            console.warn(`No originalHaiku found for completion with haiku_id: ${completion.haiku_id}`);
            return false;
          }
          return true;
        })
        .map(completion => {
          const originalHaiku = completion.originalHaiku;
          
          if (!originalHaiku) {
            console.warn(`No haiku found for id: ${completion.haiku_id}`);
            return null;
          }

          // Log detailed information for debugging
          console.log(`--- DETAILED HAIKU INFO ---`);
          console.log(`Haiku ID: ${completion.haiku_id}`);
          console.log(`Title: ${originalHaiku.title}`);
          console.log(`Completion ID: ${completion.id}`);
          
          // Log the actual line arrangements
          console.log(`Line1 arrangement (${completion.line1_arrangement?.length || 0} words):`, 
            JSON.stringify(completion.line1_arrangement));
          console.log(`Line2 arrangement (${completion.line2_arrangement?.length || 0} words):`, 
            JSON.stringify(completion.line2_arrangement));
          console.log(`Line3 arrangement (${completion.line3_arrangement?.length || 0} words):`, 
            JSON.stringify(completion.line3_arrangement));
          
          // Log the full object for comparison
          console.log(`Full completion object:`, JSON.stringify(completion, null, 2));
          
          // Track unique haikus for debugging
          uniqueHaikus.set(completion.haiku_id, originalHaiku.title);

          // Make sure line1_arrangement, line2_arrangement, line3_arrangement are valid arrays
          const line1 = Array.isArray(completion.line1_arrangement) ? completion.line1_arrangement : [];
          const line2 = Array.isArray(completion.line2_arrangement) ? completion.line2_arrangement : [];
          const line3 = Array.isArray(completion.line3_arrangement) ? completion.line3_arrangement : [];

          return {
            id: completion.id,
            haiku_id: completion.haiku_id,
            title: originalHaiku.title || "Untitled Haiku",
            lines: [line1, line2, line3]
          };
        })
        .filter(Boolean) as SolvedHaikuDisplay[];
      
      console.log("Processed solved haikus for display:", solvedHaikusList.length);
      console.log("Unique haikus in completions:", [...uniqueHaikus.entries()]);
      
      // Log each processed haiku for verification
      solvedHaikusList.forEach((haiku, index) => {
        console.log(`Processed Haiku ${index + 1} (${haiku.haiku_id}):`, {
          id: haiku.id,
          title: haiku.title,
          line1: haiku.lines[0],
          line2: haiku.lines[1],
          line3: haiku.lines[2]
        });
      });
      
      setDisplayHaikus(solvedHaikusList);
      
      // Update the solved count
      setSolvedCount(solvedHaikusList.length);
    }
  }, [completedHaikus, isLoadingCompleted]);

  const handleResetAll = async () => {
    if (window.confirm("Are you sure you want to reset all your solved haikus? This will allow you to solve them again.")) {
      setIsResetting(true);
      console.log("Starting reset all process...");
      
      try {
        await resetAllMutation.mutateAsync();
        console.log("Reset completed, setting solvedCount to 0");
        
        // Clear the local state immediately
        setDisplayHaikus([]);
        setSolvedCount(0);
        
        // Add a small delay to ensure the UI updates before navigating
        setTimeout(() => {
          console.log("Redirecting to home after reset");
          navigate('/', { replace: true });
        }, 300);
      } catch (error) {
        console.error("Error resetting all haikus:", error);
        setIsResetting(false);
      }
    }
  };

  if (isLoadingCompleted || isResetting) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation solvedCount={solvedCount} />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navigation solvedCount={solvedCount} />
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="ml-4 text-2xl font-semibold">Your Solved Haikus</h1>
            </div>
            
            {displayHaikus.length > 0 && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleResetAll}
                disabled={isResetting}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset All Progress</span>
              </Button>
            )}
          </div>
          
          {displayHaikus.length > 0 ? (
            <ScrollArea className="flex-1 pb-20">
              <div className="space-y-6 max-w-xl mx-auto">
                {displayHaikus.map((haiku, index) => (
                  <Card 
                    key={`${haiku.id}-${index}`}
                    className="animate-fade-in border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-xl font-medium text-center text-primary-900">
                        {haiku.title}
                      </h2>
                      <div className="text-lg text-center space-y-2 text-gray-700">
                        {haiku.lines[0]?.length > 0 && (
                          <p>{haiku.lines[0].join(' ')}</p>
                        )}
                        {haiku.lines[1]?.length > 0 && (
                          <p>{haiku.lines[1].join(' ')}</p>
                        )}
                        {haiku.lines[2]?.length > 0 && (
                          <p>{haiku.lines[2].join(' ')}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <NoHaikuAvailable />
          )}
        </div>
      </div>
    </div>
  );
};

export default SolvedHaikus;
