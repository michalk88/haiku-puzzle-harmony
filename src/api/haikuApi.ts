import { supabase } from "@/integrations/supabase/client";
import { Haiku, CompletedHaiku } from "@/types/haiku";

export const fetchHaikus = async (): Promise<Haiku[]> => {
  console.log("Fetching haikus");
  const { data, error } = await supabase
    .from('haikus')
    .select('*');
  
  if (error) {
    console.error("Error fetching haikus:", error);
    throw error;
  }
  console.log("Fetched haikus:", data?.length);
  return data || [];
};

export const fetchCompletedHaikus = async (userId: string): Promise<CompletedHaiku[]> => {
  if (!userId) {
    console.log("No user, not fetching completed haikus");
    return [];
  }
  
  console.log("Fetching completed haikus for user:", userId);
  
  // Fetch completed haikus
  const { data, error } = await supabase
    .from('completed_haikus')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error fetching completed haikus:", error);
    throw error;
  }
  
  console.log("Fetched completed haikus:", data?.length);
  
  // If no completed haikus, return empty array
  if (!data || data.length === 0) {
    return [];
  }
  
  // For each completed haiku, fetch the original haiku data
  const completedWithOriginals = await Promise.all(
    data.map(async (completedHaiku) => {
      const { data: originalHaiku, error: originalError } = await supabase
        .from('haikus')
        .select('*')
        .eq('id', completedHaiku.haiku_id)
        .single();
      
      if (originalError) {
        console.error(`Error fetching original haiku ${completedHaiku.haiku_id}:`, originalError);
        return {
          ...completedHaiku,
          originalHaiku: null
        };
      }
      
      // Log each completed haiku with its original data for debugging
      console.log(`Fetched original data for haiku_id ${completedHaiku.haiku_id}:`, originalHaiku?.title);
      console.log(`Completed haiku line arrangements:`, {
        line1: completedHaiku.line1_arrangement,
        line2: completedHaiku.line2_arrangement,
        line3: completedHaiku.line3_arrangement
      });
      
      return {
        ...completedHaiku,
        originalHaiku
      };
    })
  );
  
  console.log("Processed completed haikus with original data:", completedWithOriginals.length);
  return completedWithOriginals as CompletedHaiku[];
};

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

export const resetCompletedHaiku = async (userId: string, haikuId: string): Promise<void> => {
  if (!userId) throw new Error("User must be authenticated");
  
  console.log("Resetting completed haiku:", haikuId);
  const { error } = await supabase
    .from('completed_haikus')
    .delete()
    .eq('haiku_id', haikuId)
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error resetting completed haiku:", error);
    throw error;
  }
  
  console.log("Successfully reset completed haiku");
};

export const resetAllCompletedHaikus = async (userId: string): Promise<void> => {
  if (!userId) throw new Error("User must be authenticated");
  
  console.log("Resetting ALL completed haikus for user:", userId);
  const { error } = await supabase
    .from('completed_haikus')
    .delete()
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error resetting all completed haikus:", error);
    throw error;
  }
  
  console.log("Successfully reset all completed haikus for user");
};
