
import React from 'react';
import Navigation from '@/components/Navigation';
import { useHaikuData } from '@/hooks/useHaikuData';
import LoadingState from '@/components/haiku/LoadingState';

const SolvedHaikus = () => {
  const { completedHaikus, haikus, isLoadingHaikus, isLoadingCompleted } = useHaikuData();

  if (isLoadingHaikus || isLoadingCompleted) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-8 space-y-12">
        {completedHaikus?.map((completed) => {
          const haiku = haikus?.find(h => h.id === completed.haiku_id);
          if (!haiku) return null;
          
          return (
            <div key={completed.haiku_id} className="space-y-4">
              <h2 className="text-2xl font-medium text-center">{haiku.title}</h2>
              <div className="text-lg text-center space-y-2">
                <p>{completed.line1_arrangement.join(' ')}</p>
                <p>{completed.line2_arrangement.join(' ')}</p>
                <p>{completed.line3_arrangement.join(' ')}</p>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default SolvedHaikus;
