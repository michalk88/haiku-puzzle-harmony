
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
      // Ensure we have a valid haiku_id before fetching
      if (!completedHaiku.haiku_id) {
        console.error("Missing haiku_id in completed haiku:", completedHaiku);
        return null;
      }
      
      console.log(`Fetching original haiku for haiku_id: ${completedHaiku.haiku_id}`);
      
      const { data: originalHaiku, error: originalError } = await supabase
        .from('haikus')
        .select('*')
        .eq('id', completedHaiku.haiku_id)
        .single();
      
      if (originalError) {
        console.error(`Error fetching original haiku ${completedHaiku.haiku_id}:`, originalError);
        return null;
      }
      
      if (!originalHaiku) {
        console.error(`No original haiku found for haiku_id: ${completedHaiku.haiku_id}`);
        return null;
      }
      
      // Log detailed info for debugging
      console.log(`Retrieved haiku: ${originalHaiku.title}`);
      
      return {
        ...completedHaiku,
        originalHaiku
      };
    })
  );
  
  // Filter out any null entries and ensure valid data
  const validCompletedHaikus = completedWithOriginals
    .filter(Boolean)
    .filter(item => item?.originalHaiku) as CompletedHaiku[];
  
  console.log("Processed completed haikus:", validCompletedHaikus.length);
  
  return validCompletedHaikus;
};
