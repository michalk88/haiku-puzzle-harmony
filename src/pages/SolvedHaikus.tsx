
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import LoadingState from '@/components/haiku/LoadingState';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHaikuData } from '@/hooks/useHaikuData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

const SolvedHaikus = () => {
  const { completedHaikus, haikus, isLoadingCompleted, isLoadingHaikus, refetchCompletedHaikus } = useHaikuData();
  const [solvedCount, setSolvedCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Force refetch when component mounts
  useEffect(() => {
    if (user) {
      console.log("SolvedHaikus: Forcing refetch of completed haikus");
      refetchCompletedHaikus();
    }
  }, [user, refetchCompletedHaikus]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !isLoadingCompleted) {
      navigate('/auth');
    }
  }, [user, isLoadingCompleted, navigate]);

  // Update the solved count for the navigation
  useEffect(() => {
    if (completedHaikus) {
      console.log("SolvedHaikus: Setting solved count to", completedHaikus.length);
      setSolvedCount(completedHaikus.length);
    }
  }, [completedHaikus]);

  if (isLoadingCompleted || isLoadingHaikus) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation solvedCount={solvedCount} />
        <LoadingState />
      </div>
    );
  }

  console.log("SolvedHaikus: Completed haikus raw data:", completedHaikus);

  // Filter out haikus with empty arrangement arrays
  const validHaikus = completedHaikus?.filter(
    haiku => 
      (haiku.line1_arrangement && haiku.line1_arrangement.length > 0) || 
      (haiku.line2_arrangement && haiku.line2_arrangement.length > 0) || 
      (haiku.line3_arrangement && haiku.line3_arrangement.length > 0)
  ) || [];

  console.log("SolvedHaikus: Valid haikus count:", validHaikus.length);
  console.log("SolvedHaikus: Valid haikus data:", validHaikus);

  // Add titles to haikus
  const haikuWithTitles = validHaikus.map(haiku => {
    const matchingHaiku = haikus?.find(h => h.id === haiku.haiku_id);
    return {
      ...haiku,
      title: matchingHaiku?.title || "Untitled Haiku"
    };
  });

  if (validHaikus.length === 0 && !isLoadingCompleted) {
    toast({
      title: "No solved haikus found",
      description: "You haven't solved any haikus yet.",
      variant: "default"
    });
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navigation solvedCount={validHaikus.length} />
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-6 h-full flex flex-col">
          <div className="flex items-center mb-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="ml-4 text-2xl font-semibold">Your Solved Haikus</h1>
          </div>
          
          {haikuWithTitles.length > 0 ? (
            <ScrollArea className="flex-1 pb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-lg mx-auto">
                {haikuWithTitles.map((haiku, index) => (
                  <Card 
                    key={haiku.id} 
                    className="animate-fade-in border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-xl font-medium text-center text-primary-900">
                        {haiku.title}
                      </h2>
                      <div className="text-lg text-center space-y-2 text-gray-700">
                        {haiku.line1_arrangement && haiku.line1_arrangement.length > 0 && (
                          <p>{haiku.line1_arrangement.join(' ')}</p>
                        )}
                        {haiku.line2_arrangement && haiku.line2_arrangement.length > 0 && (
                          <p>{haiku.line2_arrangement.join(' ')}</p>
                        )}
                        {haiku.line3_arrangement && haiku.line3_arrangement.length > 0 && (
                          <p>{haiku.line3_arrangement.join(' ')}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-10 text-gray-500">
                <p>You haven't solved any haikus yet.</p>
                <Link 
                  to="/" 
                  className="mt-4 inline-block text-emerald-500 hover:text-emerald-600 font-medium"
                >
                  Go back to solve your first haiku!
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolvedHaikus;
