
import { useRef } from "react";
import { useToast } from "./use-toast";
import { Haiku } from "@/types/haiku";

interface SaveHaikuProps {
  currentHaiku: Haiku | null;
  isSolved: boolean;
  saveCompletedHaiku: any;
  refetchCompletedHaikus: () => Promise<any>;
}

export function useSaveHaiku({
  currentHaiku,
  isSolved,
  saveCompletedHaiku,
  refetchCompletedHaikus
}: SaveHaikuProps) {
  const didSaveCurrentHaiku = useRef(false);
  const saveAttemptsRef = useRef(0);
  const currentHaikuIdRef = useRef<string | null>(null);
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
    if (isSolved && currentHaiku && !didSaveCurrentHaiku.current) {
      try {
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
        
        toast({
          title: "Haiku saved!",
          description: "Your solution has been saved.",
        });
        
        // Only refetch the completed haikus after saving, but don't trigger navigation
        await refetchCompletedHaikus();
        
        console.log("Haiku saved successfully");
      } catch (error) {
        console.error("Error saving haiku:", error);
        didSaveCurrentHaiku.current = false;
        toast({
          title: "Error saving haiku",
          description: "There was an error saving your solution. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return {
    updateCurrentHaikuRef,
    saveHaiku
  };
}
