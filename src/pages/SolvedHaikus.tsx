
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
  const [displayHaikus, setDisplayHaikus] = useState<any[]>([]);
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

  // Process the haikus and completed haikus data to create proper display data
  useEffect(() => {
    if (haikus && completedHaikus && !isLoadingHaikus && !isLoadingCompleted) {
      console.log("Processing haikus for display:", haikus.length, "haikus and", completedHaikus.length, "completions");
      
      // Create a mapping of haiku IDs to their original content
      const haikuMap = new Map();
      haikus.forEach(haiku => {
        haikuMap.set(haiku.id, {
          title: haiku.title,
          line1: haiku.line1_words,
          line2: haiku.line2_words,
          line3: haiku.line3_words
        });
      });
      
      // Group completions by haiku_id and get the latest one for each
      const completionsMap = new Map();
      completedHaikus.forEach(completion => {
        const existingCompletion = completionsMap.get(completion.haiku_id);
        const completionDate = new Date(completion.created_at);
        
        if (!existingCompletion || completionDate > new Date(existingCompletion.created_at)) {
          completionsMap.set(completion.haiku_id, completion);
        }
      });
      
      // Create display data
      const solvedHaikusToDisplay = Array.from(completionsMap.entries()).map(([haikuId, completion]) => {
        const originalHaiku = haikuMap.get(haikuId);
        
        if (!originalHaiku) {
          console.warn(`No original haiku found for id: ${haikuId}`);
          return null;
        }

        return {
          id: completion.id,
          haiku_id: haikuId,
          title: originalHaiku.title,
          displayLines: [
            completion.line1_arrangement && completion.line1_arrangement.length > 0 
              ? completion.line1_arrangement 
              : originalHaiku.line1,
            completion.line2_arrangement && completion.line2_arrangement.length > 0 
              ? completion.line2_arrangement 
              : originalHaiku.line2,
            completion.line3_arrangement && completion.line3_arrangement.length > 0 
              ? completion.line3_arrangement 
              : originalHaiku.line3
          ]
        };
      }).filter(Boolean); // Remove null entries
      
      console.log("Processed solved haikus for display:", solvedHaikusToDisplay.length);
      setDisplayHaikus(solvedHaikusToDisplay);
      
      // Update the solved count
      const uniqueHaikuIds = new Set(completedHaikus.map(haiku => haiku.haiku_id));
      setSolvedCount(uniqueHaikuIds.size);
    }
  }, [haikus, completedHaikus, isLoadingHaikus, isLoadingCompleted]);

  if (isLoadingCompleted || isLoadingHaikus) {
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
          <div className="flex items-center mb-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="ml-4 text-2xl font-semibold">Your Solved Haikus</h1>
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
                      <div className="text-lg text-center space-y-2 text-gray-700 whitespace-nowrap">
                        {haiku.displayLines[0]?.length > 0 && (
                          <p>{haiku.displayLines[0].join(' ')}</p>
                        )}
                        {haiku.displayLines[1]?.length > 0 && (
                          <p>{haiku.displayLines[1].join(' ')}</p>
                        )}
                        {haiku.displayLines[2]?.length > 0 && (
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
