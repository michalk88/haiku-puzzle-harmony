
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
  
  // Fetch completed haikus with a join to get original haiku data in one query
  const { data, error } = await supabase
    .from('completed_haikus')
    .select(`
      *,
      originalHaiku:haikus(*)
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error fetching completed haikus:", error);
    throw error;
  }
  
  console.log("Fetched completed haikus with join:", data?.length);
  
  // Process the data to match the expected format
  const processedData = data?.map(item => {
    return {
      ...item,
      originalHaiku: item.originalHaiku
    };
  }) || [];
  
  console.log("Processed completed haikus data:", processedData.length);
  return processedData as CompletedHaiku[];
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

  // Validate lines to make sure we have content
  const hasContent = 
    (haiku.line1_arrangement && haiku.line1_arrangement.length > 0) ||
    (haiku.line2_arrangement && haiku.line2_arrangement.length > 0) ||
    (haiku.line3_arrangement && haiku.line3_arrangement.length > 0);
  
  if (!hasContent) {
    throw new Error("Cannot save empty haiku solution");
  }
  
  console.log("Saving completed haiku:", haiku);
  console.log("User ID:", userId);
  console.log("Line arrangements:", {
    line1: haiku.line1_arrangement,
    line2: haiku.line2_arrangement,
    line3: haiku.line3_arrangement
  });
  
  const { data, error } = await supabase
    .from('completed_haikus')
    .upsert({
      user_id: userId,
      haiku_id: haiku.haiku_id,
      line1_arrangement: haiku.line1_arrangement,
      line2_arrangement: haiku.line2_arrangement,
      line3_arrangement: haiku.line3_arrangement
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error saving completed haiku:", error);
    throw error;
  }
  
  return data;
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
