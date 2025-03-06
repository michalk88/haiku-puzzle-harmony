
import { useRef, useState } from "react";
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

  const saveHaiku = async (skipRefetch: boolean = false) => {
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
        
        // Only refetch the completed haikus after saving if not skipped
        // This helps prevent premature updates to the solved count
        if (!skipRefetch) {
          console.log("Refetching completed haikus after save");
          await refetchCompletedHaikus();
        } else {
          console.log("Skipping refetch of completed haikus (will be done later)");
        }
        
        console.log("Haiku saved successfully");
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
    }
  };

  return {
    isSaving,
    updateCurrentHaikuRef,
    saveHaiku
  };
}
