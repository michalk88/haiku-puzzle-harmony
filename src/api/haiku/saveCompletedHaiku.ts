
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
  
  // Create the data object to be saved
  const dataToSave = {
    user_id: userId,
    haiku_id: haiku.haiku_id
  };
  
  console.log("Data being saved to Supabase:", JSON.stringify(dataToSave, null, 2));
  
  // The table has a unique constraint on (user_id, haiku_id),
  // so this will either insert a new record or do nothing if it already exists
  const { data, error } = await supabase
    .from('completed_haikus')
    .upsert(dataToSave, { onConflict: 'user_id,haiku_id' })
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
