
import { useEffect, useState } from "react";
import { useHaikuData } from "./useHaikuData";
import { Haiku, CompletedHaiku } from "@/types/haiku";

export interface HaikuNavigationProps {
  onSolvedCountChange?: (count: number) => void;
}

export function useHaikuNavigation({ onSolvedCountChange }: HaikuNavigationProps = {}) {
  const [availableHaikus, setAvailableHaikus] = useState<Haiku[]>([]);
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
      
      // Use a Set for faster lookups and unique IDs
      const completedIds = new Set(completedHaikus.map(ch => ch.haiku_id));
      console.log("Completed IDs:", Array.from(completedIds));
      
      const available = haikus.filter(haiku => !completedIds.has(haiku.id));
      console.log("Available haikus after filtering:", available.length);
      
      setAvailableHaikus(available);

      // If current haiku is completed, move to next available one
      if (currentHaikuIndex >= 0 && haikus[currentHaikuIndex] && completedIds.has(haikus[currentHaikuIndex].id)) {
        goToNextUnsolved();
      }
    }
  }, [haikus, completedHaikus]);

  // Sync the solvedCount with the parent component
  useEffect(() => {
    if (onSolvedCountChange && completedHaikus) {
      // Count unique haiku_ids to avoid duplicates
      const uniqueHaikuIds = new Set(completedHaikus.map(ch => ch.haiku_id));
      console.log("Updating solved count to:", uniqueHaikuIds.size);
      onSolvedCountChange(uniqueHaikuIds.size);
    }
  }, [completedHaikus, onSolvedCountChange]);

  // Find the next unsolved haiku
  const goToNextUnsolved = () => {
    if (!haikus || !completedHaikus) return;
    
    const completedIds = new Set(completedHaikus.map(ch => ch.haiku_id));
    console.log("Going to next unsolved. Current index:", currentHaikuIndex);
    console.log("Available haikus:", availableHaikus.length);
    
    // Start from the current index + 1
    let nextIndex = currentHaikuIndex + 1;
    let foundUnsolved = false;
    
    // Look through all haikus starting from the next index
    for (let i = 0; i < haikus.length; i++) {
      const checkIndex = (nextIndex + i) % haikus.length;
      if (!completedIds.has(haikus[checkIndex].id)) {
        console.log("Found next unsolved at index:", checkIndex);
        setCurrentHaikuIndex(checkIndex);
        foundUnsolved = true;
        break;
      }
    }
    
    if (!foundUnsolved) {
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
