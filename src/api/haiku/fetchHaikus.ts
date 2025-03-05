
import { supabase } from "@/integrations/supabase/client";
import { Haiku } from "@/types/haiku";

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
