
import { supabase } from "@/integrations/supabase/client";
import { CompletedHaiku } from "@/types/haiku";

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
