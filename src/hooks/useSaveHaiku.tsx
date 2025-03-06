
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
    if (haikuId !== currentHaikuIdRef.current) {
      console.log(`Moving to a new haiku: ${haikuId} (was: ${currentHaikuIdRef.current})`);
      didSaveCurrentHaiku.current = false;
      saveAttemptsRef.current = 0;
      currentHaikuIdRef.current = haikuId;
    }
  };

  const saveHaiku = async () => {
    // Only save if:
    // 1. Haiku is solved
    // 2. We have a current haiku
    // 3. We haven't already saved this haiku
    // 4. We're not already in the process of saving
    if (isSolved && currentHaiku && !didSaveCurrentHaiku.current && !isSaving) {
      try {
        setIsSaving(true);
        console.log(`========== ATTEMPTING TO SAVE HAIKU ==========`);
        console.log(`Haiku ID: ${currentHaiku.id}, Title: ${currentHaiku.title}`);
        
        // Increment save attempts
        saveAttemptsRef.current += 1;
        console.log(`Save attempt #${saveAttemptsRef.current}`);
        
        // Mark as saved to avoid duplicate saves
        didSaveCurrentHaiku.current = true;
        
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
        didSaveCurrentHaiku.current = false;
        toast({
          title: "Error saving haiku",
          description: "There was an error saving your solution. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    } else if (didSaveCurrentHaiku.current) {
      console.log("Skipping save - already saved this haiku");
    }
  };

  return {
    isSaving,
    updateCurrentHaikuRef,
    saveHaiku
  };
}
