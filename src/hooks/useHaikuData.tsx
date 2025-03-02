import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useHaikuData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const { 
    data: haikus, 
    isLoading: isLoadingHaikus,
    refetch: refetchHaikus
  } = useQuery({
    queryKey: ['haikus'],
    queryFn: async () => {
      console.log("Fetching haikus");
      const { data, error } = await supabase
        .from('haikus')
        .select('*');
      
      if (error) {
        console.error("Error fetching haikus:", error);
        throw error;
      }
      console.log("Fetched haikus:", data?.length);
      return data;
    }
  });

  const { 
    data: completedHaikus, 
    isLoading: isLoadingCompleted,
    refetch: refetchCompletedHaikus
  } = useQuery({
    queryKey: ['completed_haikus', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("No user, not fetching completed haikus");
        return [];
      }
      
      console.log("Fetching completed haikus for user:", user.id);
      const { data, error } = await supabase
        .from('completed_haikus')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching completed haikus:", error);
        throw error;
      }
      console.log("Fetched completed haikus:", data?.length);
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
      if (!user) {
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
      console.log("User ID:", user.id);
      
      const { data, error } = await supabase
        .from('completed_haikus')
        .upsert({
          user_id: user.id,
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
    },
    onSuccess: () => {
      console.log("Successfully saved haiku, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['completed_haikus', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['haikus'] });
      toast({
        title: "Haiku saved!",
        description: "Your solution has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Error in saveCompletedHaiku mutation:", error);
      toast({
        title: "Error saving haiku",
        description: "There was an error saving your solution. Please try again.",
        variant: "destructive"
      });
    }
  });

  const resetMutation = useMutation({
    mutationFn: async (haikuId: string) => {
      if (!user) throw new Error("User must be authenticated");
      
      console.log("Resetting completed haiku:", haikuId);
      const { error } = await supabase
        .from('completed_haikus')
        .delete()
        .eq('haiku_id', haikuId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error resetting completed haiku:", error);
        throw error;
      }
      
      console.log("Successfully reset completed haiku");
    },
    onSuccess: () => {
      console.log("Invalidating completed_haikus query after reset");
      queryClient.invalidateQueries({ queryKey: ['completed_haikus', user?.id] });
    },
    onError: (error) => {
      console.error("Error in resetMutation:", error);
      toast({
        title: "Error resetting haiku",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  return {
    haikus,
    completedHaikus,
    isLoadingHaikus,
    isLoadingCompleted,
    saveCompletedHaiku,
    resetMutation,
    refetchHaikus,
    refetchCompletedHaikus
  };
};
