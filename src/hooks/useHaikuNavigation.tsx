
import { useEffect, useState, useRef, useCallback } from "react";
import { useHaikuData } from "./useHaikuData";
import { Haiku, CompletedHaiku } from "@/types/haiku";

export interface HaikuNavigationProps {
  onSolvedCountChange?: (count: number) => void;
}

export function useHaikuNavigation({ onSolvedCountChange }: HaikuNavigationProps = {}) {
  const [availableHaikus, setAvailableHaikus] = useState<Haiku[]>([]);
  const [currentHaikuIndex, setCurrentHaikuIndex] = useState(0);
  const navigationInProgressRef = useRef(false);
  const lastReportedCountRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadCompleteRef = useRef(false);
  const pendingNavigationRef = useRef(false);

  const {
    haikus,
    completedHaikus = [], // Provide default value
    saveCompletedHaiku,
    isLoadingHaikus,
    isLoadingCompleted,
    refetchCompletedHaikus
  } = useHaikuData();

  // Set initial load flag once data is available
  useEffect(() => {
    if (haikus && completedHaikus && !isLoadingHaikus && !isLoadingCompleted && !initialLoadCompleteRef.current) {
      console.log("Initial haiku data load complete");
      initialLoadCompleteRef.current = true;
    }
  }, [haikus, completedHaikus, isLoadingHaikus, isLoadingCompleted]);

  // Filter out completed haikus to get available ones - with debounce protection
  useEffect(() => {
    if (haikus && completedHaikus && !navigationInProgressRef.current && !pendingNavigationRef.current) {
      console.log("Filtering available haikus...");
      console.log("All haikus:", haikus.length);
      console.log("Completed haikus:", completedHaikus.length);
      
      // Use a Set for faster lookups and unique IDs
      const completedIds = new Set(completedHaikus.map(ch => ch.haiku_id));
      console.log("Completed IDs:", Array.from(completedIds));
      
      const available = haikus.filter(haiku => !completedIds.has(haiku.id));
      console.log("Available haikus after filtering:", available.length);
      
      setAvailableHaikus(available);
      
      // Only update the solved count if initial load is complete AND we're not navigating
      // This prevents premature updates during initial load and navigation
      if (initialLoadCompleteRef.current) {
        // Clear any existing debounce timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        // Debounce the solved count update to prevent rapid fluctuations
        // Longer timeout - 1000ms - to ensure we don't update too early
        debounceTimerRef.current = setTimeout(() => {
          // Sync the solvedCount with the parent component, but only if we're not navigating
          if (onSolvedCountChange && !pendingNavigationRef.current) {
            const count = completedIds.size;
            console.log("Updating solved count to:", count);
            onSolvedCountChange(count);
            lastReportedCountRef.current = count;
          }
        }, 1000);
      }
    }
    
    // Cleanup the timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [haikus, completedHaikus, onSolvedCountChange]);

  // Find the next unsolved haiku - but ONLY when explicitly requested
  const goToNextUnsolved = useCallback(() => {
    if (!haikus || !completedHaikus || navigationInProgressRef.current) return;
    
    console.log("EXPLICIT navigation to next unsolved requested");
    
    // Set flags to prevent multiple navigations and premature count updates
    navigationInProgressRef.current = true;
    pendingNavigationRef.current = true;
    
    // CRITICAL: Force a refetch of completed haikus before navigating to ensure we have the latest data
    refetchCompletedHaikus().then(() => {
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
      
      // Clear navigation flags after a delay to allow state to settle
      setTimeout(() => {
        navigationInProgressRef.current = false;
        // Wait a bit longer to clear the pending navigation flag
        // This prevents premature count updates
        setTimeout(() => {
          pendingNavigationRef.current = false;
        }, 800);
      }, 300);
    });
  }, [haikus, completedHaikus, currentHaikuIndex, availableHaikus.length, refetchCompletedHaikus]);

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
