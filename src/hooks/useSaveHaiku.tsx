
import { useState } from "react";
import { useToast } from "./use-toast";
import { Haiku } from "@/types/haiku";

// Global set to track which haikus have been saved in the current session
const savedHaikusSet = new Set<string>();

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
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  console.log("useSaveHaiku - savedHaikusSet contents:", Array.from(savedHaikusSet));
  
  // Check if the current haiku is already saved in our tracking set
  const isCurrentHaikuSaved = currentHaiku ? savedHaikusSet.has(currentHaiku.id) : false;
  
  const saveHaiku = async () => {
    // Only save if:
    // 1. Haiku is solved
    // 2. We have a current haiku
    // 3. We haven't already saved this haiku in this session
    // 4. We're not already in the process of saving
    console.log(`=== SAVE HAIKU CHECKS ===`);
    console.log(`isSolved: ${isSolved}`);
    console.log(`currentHaiku: ${currentHaiku?.id}`);
    console.log(`isCurrentHaikuSaved: ${isCurrentHaikuSaved}`);
    console.log(`isSaving: ${isSaving}`);
    console.log(`savedHaikusSet contains:`, Array.from(savedHaikusSet));
    
    if (isSolved && currentHaiku && !isCurrentHaikuSaved && !isSaving) {
      try {
        setIsSaving(true);
        console.log(`========== ATTEMPTING TO SAVE HAIKU ==========`);
        console.log(`Haiku ID: ${currentHaiku.id}, Title: ${currentHaiku.title}`);
        
        // Add to our tracking set BEFORE saving to prevent concurrent save attempts
        savedHaikusSet.add(currentHaiku.id);
        console.log(`Added haiku ${currentHaiku.id} to savedHaikusSet`);
        console.log(`savedHaikusSet now contains:`, Array.from(savedHaikusSet));
        
        // Save only the haiku_id to Supabase
        await saveCompletedHaiku.mutateAsync({
          haiku_id: currentHaiku.id
        });
        
        // Immediately refetch completed haikus to update counts
        console.log("Refetching completed haikus after save");
        await refetchCompletedHaikus();
        
        // Call onSaveComplete callback to update counts immediately
        if (onSaveComplete) {
          console.log("Calling onSaveComplete callback to update counts");
          onSaveComplete();
        }
        
      } catch (error) {
        console.error("Error saving haiku:", error);
        // Remove from tracking set if saving failed
        if (currentHaiku) {
          savedHaikusSet.delete(currentHaiku.id);
          console.log(`Removed haiku ${currentHaiku.id} from savedHaikusSet due to error`);
          console.log(`savedHaikusSet now contains:`, Array.from(savedHaikusSet));
        }
        
        toast({
          title: "Error saving haiku",
          description: "There was an error saving your solution. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    } else if (isCurrentHaikuSaved) {
      console.log(`Skipping save - already saved haiku ID: ${currentHaiku?.id} (in savedHaikusSet)`);
    } else {
      console.log(`Save conditions not met: solved=${isSolved}, haiku=${!!currentHaiku}, alreadySaved=${isCurrentHaikuSaved}, saving=${isSaving}`);
    }
  };

  // When the component mounts or a new haiku loads, if it's already completed,
  // add it to our tracking set
  const markCurrentHaikuAsSaved = (haikuId: string) => {
    if (!savedHaikusSet.has(haikuId)) {
      console.log(`Marking haiku ${haikuId} as already saved`);
      savedHaikusSet.add(haikuId);
      console.log(`savedHaikusSet now contains:`, Array.from(savedHaikusSet));
    }
  };

  return {
    isSaving,
    isCurrentHaikuSaved,
    savedHaikusSet,
    markCurrentHaikuAsSaved,
    saveHaiku
  };
}
