
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

  useEffect(() => {
    if (completedHaikus) {
      const uniqueHaikuIds = new Set(completedHaikus.map(haiku => haiku.haiku_id));
      console.log("SolvedHaikus: Setting solved count to", uniqueHaikuIds.size);
      setSolvedCount(uniqueHaikuIds.size);
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

  // First, create a proper mapping of haiku IDs to their original content
  const haikuOriginalContent = {};
  if (haikus && haikus.length > 0) {
    haikus.forEach(haiku => {
      haikuOriginalContent[haiku.id] = {
        title: haiku.title,
        line1: haiku.line1_words,
        line2: haiku.line2_words,
        line3: haiku.line3_words
      };
    });
  }
  
  // Find unique haiku IDs from completed haikus (to avoid duplicates)
  const uniqueHaikuIds = new Set();
  const uniqueCompletions = [];
  
  // Sort completions by date (newest first) to get the latest completions
  const sortedCompletions = completedHaikus ? 
    [...completedHaikus].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) 
    : [];
  
  // Get the most recent completion for each unique haiku ID
  sortedCompletions.forEach(completion => {
    if (!uniqueHaikuIds.has(completion.haiku_id) && 
        ((completion.line1_arrangement && completion.line1_arrangement.length > 0) || 
         (completion.line2_arrangement && completion.line2_arrangement.length > 0) || 
         (completion.line3_arrangement && completion.line3_arrangement.length > 0))) {
      uniqueHaikuIds.add(completion.haiku_id);
      uniqueCompletions.push(completion);
    }
  });
  
  // Create display data with the correct title and content for each haiku
  const solvedHaikusDisplay = uniqueCompletions.map(completion => {
    const originalContent = haikuOriginalContent[completion.haiku_id] || {
      title: "Untitled Haiku",
      line1: [],
      line2: [],
      line3: []
    };
    
    return {
      id: completion.id,
      haiku_id: completion.haiku_id,
      title: originalContent.title,
      // Use the user's arrangement if available, otherwise fall back to original content
      displayLines: [
        completion.line1_arrangement && completion.line1_arrangement.length > 0 
          ? completion.line1_arrangement 
          : originalContent.line1,
        completion.line2_arrangement && completion.line2_arrangement.length > 0 
          ? completion.line2_arrangement 
          : originalContent.line2,
        completion.line3_arrangement && completion.line3_arrangement.length > 0 
          ? completion.line3_arrangement 
          : originalContent.line3
      ]
    };
  });

  if (solvedHaikusDisplay.length === 0 && !isLoadingCompleted) {
    toast({
      title: "No solved haikus found",
      description: "You haven't solved any haikus yet.",
      variant: "default"
    });
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navigation solvedCount={solvedCount} />
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-6 h-full flex flex-col">
          <div className="flex items-center mb-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="ml-4 text-2xl font-semibold">Your Solved Haikus</h1>
          </div>
          
          {solvedHaikusDisplay.length > 0 ? (
            <ScrollArea className="flex-1 pb-20">
              <div className="space-y-6 max-w-xl mx-auto">
                {solvedHaikusDisplay.map((haiku, index) => (
                  <Card 
                    key={`${haiku.id}-${index}`}
                    className="animate-fade-in border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-xl font-medium text-center text-primary-900">
                        {haiku.title}
                      </h2>
                      <div className="text-lg text-center space-y-2 text-gray-700 whitespace-nowrap">
                        {haiku.displayLines[0].length > 0 && (
                          <p>{haiku.displayLines[0].join(' ')}</p>
                        )}
                        {haiku.displayLines[1].length > 0 && (
                          <p>{haiku.displayLines[1].join(' ')}</p>
                        )}
                        {haiku.displayLines[2].length > 0 && (
                          <p>{haiku.displayLines[2].join(' ')}</p>
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
