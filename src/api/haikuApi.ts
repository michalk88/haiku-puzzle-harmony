
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
  
  // First, get the completed haikus information
  const { data: completedData, error: completedError } = await supabase
    .from('completed_haikus')
    .select('*')
    .eq('user_id', userId);
  
  if (completedError) {
    console.error("Error fetching completed haikus:", completedError);
    throw completedError;
  }
  
  // Then, for each completed haiku, fetch the original haiku data
  if (completedData && completedData.length > 0) {
    const haikuIds = completedData.map(ch => ch.haiku_id);
    
    const { data: haikuData, error: haikuError } = await supabase
      .from('haikus')
      .select('*')
      .in('id', haikuIds);
    
    if (haikuError) {
      console.error("Error fetching haiku details:", haikuError);
      throw haikuError;
    }
    
    // Merge the data together - store original haiku as "originalHaiku" property
    const mergedData = completedData.map(completed => {
      const originalHaiku = haikuData?.find(h => h.id === completed.haiku_id);
      return {
        ...completed,
        originalHaiku: originalHaiku
      };
    });
    
    console.log("Fetched and merged completed haikus:", mergedData.length);
    return mergedData as CompletedHaiku[];
  }
  
  return completedData || [];
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
