
import { useState, useRef } from "react";
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
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const savedHaikusRef = useRef<Set<string>>(new Set());

  // Check if the current haiku is already saved in our tracking ref
  const isCurrentHaikuSaved = currentHaiku ? savedHaikusRef.current.has(currentHaiku.id) : false;
  
  const saveHaiku = async () => {
    console.log(`=== SAVE HAIKU CHECKS ===`);
    console.log(`isSolved: ${isSolved}`);
    console.log(`currentHaiku: ${currentHaiku?.id}`);
    console.log(`isCurrentHaikuSaved: ${isCurrentHaikuSaved}`);
    console.log(`isSaving: ${isSaving}`);
    console.log(`savedHaikusRef contains:`, Array.from(savedHaikusRef.current));
    
    if (!currentHaiku) {
      console.log("No current haiku to save");
      return;
    }
    
    // Only save if haiku is solved and not already saved
    if (isSolved && currentHaiku && !isCurrentHaikuSaved && !isSaving) {
      try {
        setIsSaving(true);
        console.log(`========== ATTEMPTING TO SAVE HAIKU ==========`);
        console.log(`Haiku ID: ${currentHaiku.id}, Title: ${currentHaiku.title}`);
        
        // Add to tracking ref BEFORE saving to prevent concurrent save attempts
        savedHaikusRef.current.add(currentHaiku.id);
        console.log(`Added haiku ${currentHaiku.id} to savedHaikusRef`);
        console.log(`savedHaikusRef now contains:`, Array.from(savedHaikusRef.current));
        
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
          savedHaikusRef.current.delete(currentHaiku.id);
          console.log(`Removed haiku ${currentHaiku.id} from savedHaikusRef due to error`);
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
      console.log(`Skipping save - already saved haiku ID: ${currentHaiku.id} (in savedHaikusRef)`);
    } else {
      console.log(`Save conditions not met: solved=${isSolved}, alreadySaved=${isCurrentHaikuSaved}, saving=${isSaving}`);
    }
  };

  // When the component mounts or a new haiku loads, if it's already completed,
  // add it to our tracking set
  const markCurrentHaikuAsSaved = (haikuId: string) => {
    if (!savedHaikusRef.current.has(haikuId)) {
      console.log(`Marking haiku ${haikuId} as already saved`);
      savedHaikusRef.current.add(haikuId);
      console.log(`savedHaikusRef now contains:`, Array.from(savedHaikusRef.current));
    }
  };

  return {
    isSaving,
    isCurrentHaikuSaved,
    markCurrentHaikuAsSaved,
    saveHaiku
  };
}
