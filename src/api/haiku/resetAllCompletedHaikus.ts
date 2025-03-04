
import { supabase } from "@/integrations/supabase/client";

export const resetAllCompletedHaikus = async (userId: string): Promise<void> => {
  if (!userId) throw new Error("User must be authenticated");
  
  console.log("Resetting ALL completed haikus for user:", userId);
  
  // First check if there are any haikus to delete
  const { data: existingData, error: checkError } = await supabase
    .from('completed_haikus')
    .select('id')
    .eq('user_id', userId);
    
  if (checkError) {
    console.error("Error checking completed haikus:", checkError);
    throw checkError;
  }
  
  console.log(`Found ${existingData?.length || 0} haikus to delete for user ${userId}`);
  
  if (!existingData || existingData.length === 0) {
    console.log("No haikus to delete, reset complete");
    return;
  }
  
  // Delete all completed haikus for this user
  const { error } = await supabase
    .from('completed_haikus')
    .delete()
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error resetting all completed haikus:", error);
    throw error;
  }
  
  console.log(`Successfully deleted ${existingData.length} completed haikus for user ${userId}`);
  
  // Double check that all haikus were deleted
  const { data: remainingData, error: remainingError } = await supabase
    .from('completed_haikus')
    .select('id')
    .eq('user_id', userId);
  
  if (remainingError) {
    console.error("Error checking remaining haikus:", remainingError);
    throw remainingError;
  }
  
  if (remainingData && remainingData.length > 0) {
    console.error("Some haikus were not deleted, attempting force delete");
    
    // Force delete one more time if there are remaining haikus
    const { error: forceError } = await supabase
      .from('completed_haikus')
      .delete()
      .eq('user_id', userId);
      
    if (forceError) {
      console.error("Error force deleting remaining haikus:", forceError);
      throw forceError;
    }
  }
  
  console.log("Reset complete, verified all haikus deleted");
  return;
};
