
import { useState, useEffect } from 'react';

// This hook will manage the session state for solved haikus
export const useHaikuSession = () => {
  const [solvedCount, setSolvedCount] = useState<number>(() => {
    // Initialize from localStorage if available
    const savedCount = localStorage.getItem('haiku_solved_count');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });

  // Update localStorage whenever solvedCount changes
  useEffect(() => {
    localStorage.setItem('haiku_solved_count', solvedCount.toString());
  }, [solvedCount]);

  return {
    solvedCount,
    setSolvedCount
  };
};
