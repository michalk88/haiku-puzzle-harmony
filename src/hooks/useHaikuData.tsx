
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useHaikuData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
    queryKey: ['completed_haikus', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('completed_haikus')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const saveCompletedHaiku = useMutation({
    mutationFn: async (haiku: {
      haiku_id: string;
      line1_arrangement: string[];
      line2_arrangement: string[];
      line3_arrangement: string[];
    }) => {
      if (!user) throw new Error("User must be authenticated");
      
      const { data, error } = await supabase
        .from('completed_haikus')
        .upsert({
          user_id: user.id,
          haiku_id: haiku.haiku_id,
          line1_arrangement: haiku.line1_arrangement,
          line2_arrangement: haiku.line2_arrangement,
          line3_arrangement: haiku.line3_arrangement
        }, { onConflict: 'user_id, haiku_id' })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completed_haikus', user?.id] });
    }
  });

  const resetMutation = useMutation({
    mutationFn: async (haikuId: string) => {
      if (!user) throw new Error("User must be authenticated");
      
      const { error } = await supabase
        .from('completed_haikus')
        .delete()
        .eq('haiku_id', haikuId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completed_haikus', user?.id] });
    }
  });

  return {
    haikus,
    completedHaikus,
    isLoadingHaikus,
    isLoadingCompleted,
    saveCompletedHaiku,
    resetMutation
  };
};
