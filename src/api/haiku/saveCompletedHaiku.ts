
import { supabase } from "@/integrations/supabase/client";

export const saveCompletedHaiku = async (
  userId: string, 
  haiku: {
    haiku_id: string;
    line1_arrangement: string[];
    line2_arrangement: string[];
    line3_arrangement: string[];
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
  
  // Log the exact line arrangements we're about to save
  console.log("Line1 arrangement:", JSON.stringify(haiku.line1_arrangement));
  console.log("Line2 arrangement:", JSON.stringify(haiku.line2_arrangement));
  console.log("Line3 arrangement:", JSON.stringify(haiku.line3_arrangement));

  // Ensure the line arrangements are proper arrays
  const line1_arrangement = Array.isArray(haiku.line1_arrangement) ? haiku.line1_arrangement : [];
  const line2_arrangement = Array.isArray(haiku.line2_arrangement) ? haiku.line2_arrangement : [];
  const line3_arrangement = Array.isArray(haiku.line3_arrangement) ? haiku.line3_arrangement : [];
  
  // Validate lines to make sure we have content
  const hasContent = 
    line1_arrangement.length > 0 ||
    line2_arrangement.length > 0 ||
    line3_arrangement.length > 0;
  
  if (!hasContent) {
    throw new Error("Cannot save empty haiku solution");
  }
  
  // Create the data object to be saved
  const dataToSave = {
    user_id: userId,
    haiku_id: haiku.haiku_id,
    line1_arrangement,
    line2_arrangement,
    line3_arrangement
  };
  
  console.log("Data being saved to Supabase:", JSON.stringify(dataToSave, null, 2));
  
  // First check if this haiku already exists for this user
  const { data: existingData, error: existingError } = await supabase
    .from('completed_haikus')
    .select('id')
    .eq('user_id', userId)
    .eq('haiku_id', haiku.haiku_id);
  
  if (existingError) {
    console.error("Error checking for existing completed haiku:", existingError);
    throw existingError;
  }
  
  let result;
  
  if (existingData && existingData.length > 0) {
    // Update existing record
    const existingId = existingData[0].id;
    console.log(`Updating existing completed haiku with ID: ${existingId}`);
    
    const { data, error } = await supabase
      .from('completed_haikus')
      .update(dataToSave)
      .eq('id', existingId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating completed haiku:", error);
      throw error;
    }
    
    console.log("Successfully updated completed haiku:", data);
    result = data;
  } else {
    // Insert new record
    console.log("Inserting new completed haiku");
    
    const { data, error } = await supabase
      .from('completed_haikus')
      .insert(dataToSave)
      .select()
      .single();
      
    if (error) {
      console.error("Error inserting completed haiku:", error);
      throw error;
    }
    
    console.log("Successfully inserted completed haiku:", data);
    result = data;
  }
  
  console.log("========== SAVE COMPLETED ==========");
  return result;
};
