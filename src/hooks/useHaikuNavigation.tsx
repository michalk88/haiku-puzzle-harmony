
import { useEffect, useState } from "react";
import { useHaikuData } from "./useHaikuData";

export interface HaikuNavigationProps {
  onSolvedCountChange?: (count: number) => void;
}

export function useHaikuNavigation({ onSolvedCountChange }: HaikuNavigationProps = {}) {
  const [availableHaikus, setAvailableHaikus] = useState<any[]>([]);
  const [currentHaikuIndex, setCurrentHaikuIndex] = useState(0);

  const {
    haikus,
    completedHaikus,
    saveCompletedHaiku,
    isLoadingHaikus,
    isLoadingCompleted,
    refetchCompletedHaikus
  } = useHaikuData();

  // Filter out completed haikus to get available ones
  useEffect(() => {
    if (haikus && completedHaikus) {
      console.log("Filtering available haikus...");
      console.log("All haikus:", haikus.length);
      console.log("Completed haikus:", completedHaikus.length);
      
      const completedIds = new Set(completedHaikus.map(ch => ch.haiku_id));
      console.log("Completed IDs:", Array.from(completedIds));
      
      const available = haikus.filter(haiku => !completedIds.has(haiku.id));
      console.log("Available haikus after filtering:", available.length);
      
      setAvailableHaikus(available);
    }
  }, [haikus, completedHaikus]);

  // Sync the solvedCount with the parent component
  useEffect(() => {
    if (onSolvedCountChange && completedHaikus) {
      console.log("Updating solved count to:", completedHaikus.length);
      onSolvedCountChange(completedHaikus.length);
    }
  }, [completedHaikus, onSolvedCountChange]);

  // Find the next unsolved haiku
  const goToNextUnsolved = () => {
    if (!haikus || !completedHaikus) return;
    
    const completedIds = new Set(completedHaikus.map(ch => ch.haiku_id));
    console.log("Going to next unsolved. Current index:", currentHaikuIndex);
    console.log("Available haikus:", availableHaikus.length);
    
    // Find the next unsolved haiku index
    let foundUnsolved = false;
    
    // Try to find an unsolved haiku
    for (let i = 0; i < haikus.length; i++) {
      if (!completedIds.has(haikus[i].id)) {
        console.log("Found next unsolved at index:", i);
        setCurrentHaikuIndex(i);
        foundUnsolved = true;
        break;
      }
    }
    
    if (!foundUnsolved) {
      // All haikus are solved, show a message or redirect
      console.log("All haikus are solved");
      // We'll stay on the current page but display the NoHaikusAvailable component
    }
  };

  // Get current haiku information
  const currentHaiku = haikus?.[currentHaikuIndex] || null;
  const isCompleted = currentHaiku && completedHaikus?.some(ch => ch.haiku_id === currentHaiku.id);
  const completedHaiku = currentHaiku && completedHaikus?.find(ch => ch.haiku_id === currentHaiku.id);

  return {
    haikus,
    currentHaiku,
    currentHaikuIndex,
    availableHaikus,
    isCompleted,
    completedHaiku,
    isLoadingHaikus,
    isLoadingCompleted,
    completedHaikus,
    saveCompletedHaiku,
    refetchCompletedHaikus,
    setCurrentHaikuIndex,
    goToNextUnsolved
  };
}
