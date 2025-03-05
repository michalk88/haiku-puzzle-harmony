
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchHaikus, 
  fetchCompletedHaikus, 
  saveCompletedHaiku as saveHaiku, 
  resetCompletedHaiku, 
  resetAllCompletedHaikus 
} from "@/api/haikuApi";
import { Haiku, CompletedHaiku } from "@/types/haiku";

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
    queryFn: fetchHaikus
  });

  const { 
    data: completedHaikus = [], // Set default value of empty array
    isLoading: isLoadingCompleted,
    refetch: refetchCompletedHaikus
  } = useQuery({
    queryKey: ['completed_haikus', user?.id],
    queryFn: () => fetchCompletedHaikus(user?.id || ''),
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
      return saveHaiku(user.id, haiku);
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
      return resetCompletedHaiku(user.id, haikuId);
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

  const resetAllMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User must be authenticated");
      return resetAllCompletedHaikus(user.id);
    },
    onSuccess: () => {
      console.log("Invalidating all queries after reset all");
      queryClient.invalidateQueries({ queryKey: ['completed_haikus', user?.id] });
      toast({
        title: "All progress reset",
        description: "All your solved haikus have been reset successfully.",
      });
    },
    onError: (error) => {
      console.error("Error in resetAllMutation:", error);
      toast({
        title: "Error resetting progress",
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
    resetAllMutation,
    refetchHaikus,
    refetchCompletedHaikus
  };
};
