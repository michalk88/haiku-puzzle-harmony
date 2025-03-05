
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import LoadingState from '@/components/haiku/LoadingState';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHaikuData } from '@/hooks/useHaikuData';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import NoHaikuAvailable from '@/components/haiku/NoHaikusAvailable';

interface SolvedHaikuDisplay {
  id: string;
  title: string;
  lines: string[][];
}

const SolvedHaikus = () => {
  const { completedHaikus, isLoadingCompleted } = useHaikuData();
  const [solvedCount, setSolvedCount] = useState(0);
  const [displayHaikus, setDisplayHaikus] = useState<SolvedHaikuDisplay[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      console.log("SolvedHaikus: Forcing refetch of completed haikus");
    }
  }, [user]);

  useEffect(() => {
    if (!user && !isLoadingCompleted) {
      navigate('/auth');
    }
  }, [user, isLoadingCompleted, navigate]);

  // Process the completed haikus data to create proper display data
  useEffect(() => {
    if (completedHaikus && !isLoadingCompleted) {
      console.log("Processing haikus for display:", completedHaikus.length, "completions");
      
      // Create display data from the completed haikus and their corresponding original haiku data
      const solvedHaikusList: SolvedHaikuDisplay[] = completedHaikus
        .filter(completion => completion.originalHaiku) // Make sure we have the original haiku data
        .map(completion => {
          const haiku = completion.originalHaiku;
          
          if (!haiku) {
            console.warn(`No haiku found for id: ${completion.haiku_id}`);
            return null;
          }

          // For each line, use the user's arrangement if available, otherwise use the original words
          const line1 = completion.line1_arrangement && completion.line1_arrangement.length > 0 
            ? completion.line1_arrangement 
            : haiku.line1_words;
            
          const line2 = completion.line2_arrangement && completion.line2_arrangement.length > 0 
            ? completion.line2_arrangement 
            : haiku.line2_words;
            
          const line3 = completion.line3_arrangement && completion.line3_arrangement.length > 0 
            ? completion.line3_arrangement 
            : haiku.line3_words;

          return {
            id: completion.id,
            title: haiku.title || "Untitled Haiku",
            lines: [line1, line2, line3]
          };
        })
        .filter(Boolean);
      
      console.log("Processed solved haikus for display:", solvedHaikusList.length);
      setDisplayHaikus(solvedHaikusList);
      
      // Update the solved count
      setSolvedCount(completedHaikus.length);
    }
  }, [completedHaikus, isLoadingCompleted]);

  if (isLoadingCompleted) {
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
