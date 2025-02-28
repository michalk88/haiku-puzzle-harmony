
import { useState, useEffect } from 'react';

interface SessionHaiku {
  id: string;
  line1_arrangement: string[];
  line2_arrangement: string[];
  line3_arrangement: string[];
}

export const useHaikuSession = () => {
  const [sessionHaikus, setSessionHaikus] = useState<SessionHaiku[]>([]);
  const [solvedCount, setSolvedCount] = useState(() => {
    // Initialize from sessionStorage if available
    const savedCount = sessionStorage.getItem('haiku_solved_count');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });
  
  useEffect(() => {
    // Load saved haikus from session storage on mount
    const saved = sessionStorage.getItem('solved_haikus');
    if (saved) {
      setSessionHaikus(JSON.parse(saved));
    }
  }, []);

  // Update sessionStorage whenever solvedCount changes
  useEffect(() => {
    sessionStorage.setItem('haiku_solved_count', solvedCount.toString());
  }, [solvedCount]);

  const saveHaikuToSession = (haiku: SessionHaiku) => {
    const updatedHaikus = [...sessionHaikus.filter(h => h.id !== haiku.id), haiku];
    setSessionHaikus(updatedHaikus);
    sessionStorage.setItem('solved_haikus', JSON.stringify(updatedHaikus));
  };

  const removeHaikuFromSession = (haikuId: string) => {
    const updatedHaikus = sessionHaikus.filter(h => h.id !== haikuId);
    setSessionHaikus(updatedHaikus);
    sessionStorage.setItem('solved_haikus', JSON.stringify(updatedHaikus));
  };

  const getSessionHaiku = (haikuId: string) => {
    return sessionHaikus.find(h => h.id === haikuId);
  };

  return {
    sessionHaikus,
    saveHaikuToSession,
    removeHaikuFromSession,
    getSessionHaiku,
    solvedCount,
    setSolvedCount
  };
};
