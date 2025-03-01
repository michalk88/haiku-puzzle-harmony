
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import LoadingState from '@/components/haiku/LoadingState';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHaikuData } from '@/hooks/useHaikuData';
import { useAuth } from '@/context/AuthContext';

const SolvedHaikus = () => {
  const { completedHaikus, isLoadingCompleted } = useHaikuData();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !isLoadingCompleted) {
      navigate('/auth');
    }
  }, [user, isLoadingCompleted, navigate]);

  if (isLoadingCompleted) {
    return <LoadingState />;
  }

  // Filter out haikus with empty arrangement arrays
  const validHaikus = completedHaikus?.filter(
    haiku => 
      (haiku.line1_arrangement && haiku.line1_arrangement.length > 0) || 
      (haiku.line2_arrangement && haiku.line2_arrangement.length > 0) || 
      (haiku.line3_arrangement && haiku.line3_arrangement.length > 0)
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation solvedCount={validHaikus.length} />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="ml-4 text-2xl font-semibold">Your Solved Haikus</h1>
        </div>
        
        <div className="mt-8 pb-20 space-y-16">
          {validHaikus.length > 0 ? (
            validHaikus.map((haiku, index) => (
              <div 
                key={haiku.id} 
                className="space-y-8 animate-fade-in border border-gray-200 rounded-xl p-8 shadow-sm"
              >
                <h2 className="text-2xl font-medium text-center">
                  Haiku #{index + 1}
                </h2>
                <div className="text-xl text-center space-y-3">
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
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>You haven't solved any haikus yet.</p>
              <Link 
                to="/" 
                className="mt-4 inline-block text-emerald-500 hover:text-emerald-600 font-medium"
              >
                Go back to solve your first haiku!
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolvedHaikus;
