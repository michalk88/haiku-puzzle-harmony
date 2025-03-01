
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
      try {
        const parsed = JSON.parse(saved);
        console.log("Loaded haikus from session:", parsed);
        setSessionHaikus(parsed);
      } catch (e) {
        console.error("Error parsing solved_haikus from sessionStorage:", e);
        sessionStorage.removeItem('solved_haikus');
      }
    }
  }, []);

  // Update sessionStorage whenever solvedCount changes
  useEffect(() => {
    sessionStorage.setItem('haiku_solved_count', solvedCount.toString());
  }, [solvedCount]);

  // Update sessionStorage whenever sessionHaikus changes
  useEffect(() => {
    if (sessionHaikus.length > 0) {
      console.log("Saving haikus to session storage:", sessionHaikus);
      sessionStorage.setItem('solved_haikus', JSON.stringify(sessionHaikus));
    }
  }, [sessionHaikus]);

  const saveHaikuToSession = (haiku: SessionHaiku) => {
    console.log("Saving haiku to session:", haiku);
    // Only save if the haiku has content in at least one line
    if (
      haiku.line1_arrangement?.length > 0 || 
      haiku.line2_arrangement?.length > 0 || 
      haiku.line3_arrangement?.length > 0
    ) {
      const updatedHaikus = [...sessionHaikus.filter(h => h.id !== haiku.id), haiku];
      setSessionHaikus(updatedHaikus);
    }
  };

  const removeHaikuFromSession = (haikuId: string) => {
    const updatedHaikus = sessionHaikus.filter(h => h.id !== haikuId);
    setSessionHaikus(updatedHaikus);
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
