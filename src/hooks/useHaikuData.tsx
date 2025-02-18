
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHaikuData = () => {
  const queryClient = useQueryClient();

  const { data: haikus, isLoading: isLoadingHaikus } = useQuery({
    queryKey: ['haikus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('haikus')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: completedHaikus, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['completed_haikus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('completed_haikus')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const resetMutation = useMutation({
    mutationFn: async (haikuId: string) => {
      const { error } = await supabase
        .from('completed_haikus')
        .delete()
        .eq('haiku_id', haikuId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completed_haikus'] });
    }
  });

  return {
    haikus,
    completedHaikus,
    isLoadingHaikus,
    isLoadingCompleted,
    resetMutation
  };
};
