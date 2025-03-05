
import { supabase } from "@/integrations/supabase/client";

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
