
import React from 'react';
import Navigation from '@/components/Navigation';
import { useHaikuData } from '@/hooks/useHaikuData';
import LoadingState from '@/components/haiku/LoadingState';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SolvedHaikus = () => {
  const { completedHaikus, haikus, isLoadingHaikus, isLoadingCompleted } = useHaikuData();

  if (isLoadingHaikus || isLoadingCompleted) {
    return <LoadingState />;
  }

  const solvedCount = completedHaikus?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation solvedCount={solvedCount} />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </div>
        
        <div className="mt-8 pb-20 space-y-16">
          {completedHaikus?.map((completed) => {
            const haiku = haikus?.find(h => h.id === completed.haiku_id);
            if (!haiku) return null;
            
            return (
              <div key={completed.haiku_id} className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-medium text-center">{haiku.title}</h2>
                <div className="text-xl text-center space-y-3">
                  <p>{completed.line1_arrangement?.join(' ')}</p>
                  <p>{completed.line2_arrangement?.join(' ')}</p>
                  <p>{completed.line3_arrangement?.join(' ')}</p>
                </div>
              </div>
            );
          })}
          
          {completedHaikus?.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>You haven't solved any haikus yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolvedHaikus;
