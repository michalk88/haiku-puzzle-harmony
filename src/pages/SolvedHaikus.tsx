
import React from 'react';
import Navigation from '@/components/Navigation';
import LoadingState from '@/components/haiku/LoadingState';
import SolvedHaikuHeader from '@/components/haiku/SolvedHaikuHeader';
import SolvedHaikusList from '@/components/haiku/SolvedHaikusList';
import { useSolvedHaikus } from '@/hooks/useSolvedHaikus';

const SolvedHaikus = () => {
  const {
    displayHaikus,
    isResetting,
    isLoadingCompleted,
    solvedCount,
    handleResetAll
  } = useSolvedHaikus();
  
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
          <SolvedHaikuHeader 
            hasHaikus={displayHaikus.length > 0}
            isResetting={isResetting}
            onResetAll={handleResetAll}
          />
          
          <SolvedHaikusList displayHaikus={displayHaikus} />
        </div>
      </div>
    </div>
  );
};

export default SolvedHaikus;
