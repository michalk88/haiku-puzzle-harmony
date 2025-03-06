
import { supabase } from "@/integrations/supabase/client";

export const saveCompletedHaiku = async (
  userId: string, 
  haiku: {
    haiku_id: string;
  }
): Promise<any> => {
  if (!userId) {
    throw new Error("User must be authenticated");
  }

  console.log("========== SAVING COMPLETED HAIKU ==========");
  console.log("User ID:", userId);
  console.log("Haiku ID:", haiku.haiku_id);
  
  // Validate that we have the haiku_id
  if (!haiku.haiku_id) {
    throw new Error("Missing haiku_id");
  }
  
  // First, check if this haiku is already completed by this user
  const { data: existingCompletion, error: checkError } = await supabase
    .from('completed_haikus')
    .select('id')
    .eq('user_id', userId)
    .eq('haiku_id', haiku.haiku_id)
    .maybeSingle();
    
  if (checkError) {
    console.error("Error checking for existing completion:", checkError);
    throw checkError;
  }
  
  // If it's already completed, return the existing record
  if (existingCompletion) {
    console.log("Haiku already completed, returning existing record:", existingCompletion);
    return existingCompletion;
  }
  
  // Create the data object to be saved
  const dataToSave = {
    user_id: userId,
    haiku_id: haiku.haiku_id
  };
  
  console.log("Data being saved to Supabase:", JSON.stringify(dataToSave, null, 2));
  
  // Insert new record
  const { data, error } = await supabase
    .from('completed_haikus')
    .insert(dataToSave)
    .select()
    .single();
    
  if (error) {
    console.error("Error saving completed haiku:", error);
    throw error;
  }
  
  console.log("Successfully saved completed haiku:", data);
  console.log("========== SAVE COMPLETED ==========");
  return data;
};
