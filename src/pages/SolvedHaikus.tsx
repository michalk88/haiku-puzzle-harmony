
import React from 'react';
import Navigation from '@/components/Navigation';
import LoadingState from '@/components/haiku/LoadingState';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHaikuSession } from '@/hooks/useHaikuSession';

const SolvedHaikus = () => {
  const { sessionHaikus, solvedCount } = useHaikuSession();

  if (!sessionHaikus) {
    return <LoadingState />;
  }

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
          {sessionHaikus.length > 0 ? (
            sessionHaikus.map((haiku) => {
              return (
                <div key={haiku.id} className="space-y-8 animate-fade-in">
                  <h2 className="text-2xl font-medium text-center">Haiku #{haiku.id.substring(0, 8)}</h2>
                  <div className="text-xl text-center space-y-3">
                    <p>{haiku.line1_arrangement?.join(' ')}</p>
                    <p>{haiku.line2_arrangement?.join(' ')}</p>
                    <p>{haiku.line3_arrangement?.join(' ')}</p>
                  </div>
                </div>
              );
            })
          ) : (
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
