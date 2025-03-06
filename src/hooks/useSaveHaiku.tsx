
import { useRef, useState } from "react";
import { useToast } from "./use-toast";
import { Haiku } from "@/types/haiku";

interface SaveHaikuProps {
  currentHaiku: Haiku | null;
  isSolved: boolean;
  saveCompletedHaiku: any;
  refetchCompletedHaikus: () => Promise<any>;
  onSaveComplete?: () => void;
}

export function useSaveHaiku({
  currentHaiku,
  isSolved,
  saveCompletedHaiku,
  refetchCompletedHaikus,
  onSaveComplete
}: SaveHaikuProps) {
  const didSaveCurrentHaiku = useRef(false);
  const saveAttemptsRef = useRef(0);
  const currentHaikuIdRef = useRef<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const updateCurrentHaikuRef = (haikuId: string | null) => {
    // Only reset save status if we're truly moving to a different haiku
    if (haikuId !== currentHaikuIdRef.current) {
      console.log(`Moving to a new haiku: ${haikuId} (was: ${currentHaikuIdRef.current})`);
      // Reset all the tracking variables
      didSaveCurrentHaiku.current = false;
      saveAttemptsRef.current = 0;
      currentHaikuIdRef.current = haikuId;
      console.log(`Save state reset for new haiku: didSaveCurrentHaiku=${didSaveCurrentHaiku.current}`);
    } else {
      console.log(`Same haiku detected: ${haikuId}, didSaveCurrentHaiku=${didSaveCurrentHaiku.current}`);
    }
  };

  const saveHaiku = async () => {
    // Only save if:
    // 1. Haiku is solved
    // 2. We have a current haiku
    // 3. We haven't already saved this haiku
    // 4. We're not already in the process of saving
    console.log(`=== SAVE HAIKU CHECKS ===`);
    console.log(`isSolved: ${isSolved}`);
    console.log(`currentHaiku: ${currentHaiku?.id}`);
    console.log(`didSaveCurrentHaiku.current: ${didSaveCurrentHaiku.current}`);
    console.log(`isSaving: ${isSaving}`);
    
    if (isSolved && currentHaiku && !didSaveCurrentHaiku.current && !isSaving) {
      try {
        setIsSaving(true);
        console.log(`========== ATTEMPTING TO SAVE HAIKU ==========`);
        console.log(`Haiku ID: ${currentHaiku.id}, Title: ${currentHaiku.title}`);
        
        // Increment save attempts
        saveAttemptsRef.current += 1;
        console.log(`Save attempt #${saveAttemptsRef.current}`);
        
        // Set the flag BEFORE saving to prevent concurrent save attempts
        didSaveCurrentHaiku.current = true;
        console.log(`didSaveCurrentHaiku flag set to: ${didSaveCurrentHaiku.current}`);
        
        // Save only the haiku_id to Supabase
        await saveCompletedHaiku.mutateAsync({
          haiku_id: currentHaiku.id
        });
        
        // Call onSaveComplete callback to update counts immediately
        if (onSaveComplete) {
          console.log("Calling onSaveComplete callback to update counts");
          onSaveComplete();
        }
        
      } catch (error) {
        console.error("Error saving haiku:", error);
        // Reset the flag if saving failed
        didSaveCurrentHaiku.current = false;
        console.log(`Save failed, didSaveCurrentHaiku reset to: ${didSaveCurrentHaiku.current}`);
        toast({
          title: "Error saving haiku",
          description: "There was an error saving your solution. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    } else if (didSaveCurrentHaiku.current) {
      console.log(`Skipping save - already saved haiku ID: ${currentHaiku?.id}`);
    } else {
      console.log(`Save conditions not met: solved=${isSolved}, haiku=${!!currentHaiku}, alreadySaved=${didSaveCurrentHaiku.current}, saving=${isSaving}`);
    }
  };

  return {
    isSaving,
    didSaveCurrentHaiku: didSaveCurrentHaiku.current,
    updateCurrentHaikuRef,
    saveHaiku
  };
}
