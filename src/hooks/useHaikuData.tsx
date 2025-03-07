
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchHaikus, 
  fetchCompletedHaikus, 
  saveCompletedHaiku as saveHaiku, 
  resetCompletedHaiku, 
  resetAllCompletedHaikus 
} from "@/api";
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
    enabled: !!user,
    staleTime: 30000 // Consider data stale after 30 seconds
  });

  const saveCompletedHaiku = useMutation({
    mutationFn: async (haiku: {
      haiku_id: string;
      line1_arrangement?: string[];
      line2_arrangement?: string[];
      line3_arrangement?: string[];
    }) => {
      if (!user) {
        throw new Error("User must be authenticated");
      }
      return saveHaiku(user.id, haiku);
    },
    onSuccess: (data) => {
      console.log("Successfully saved haiku - invalidating queries:", data);
      
      // Immediately update the query cache with the new completion
      // This helps ensure the UI reflects the completion right away
      queryClient.setQueryData(
        ['completed_haikus', user?.id], 
        (oldData: CompletedHaiku[] = []) => {
          // Check if this completion already exists in the cache
          const hasSameCompletion = oldData.some(ch => ch.haiku_id === data.haiku_id);
          if (hasSameCompletion) {
            console.log("Completion already in cache, not updating");
            return oldData;
          }
          
          // Add new completion to the cache
          console.log("Adding new completion to cache");
          return [...oldData, data];
        }
      );
      
      // Also invalidate the queries to trigger a background refetch
      queryClient.invalidateQueries({ queryKey: ['completed_haikus', user?.id] });
      
      // Force a refetch to get the latest data after a short delay
      setTimeout(() => {
        refetchCompletedHaikus();
      }, 100);
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
      queryClient.refetchQueries({ queryKey: ['haikus'] });
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
      console.log("Starting resetAllCompletedHaikus for user:", user.id);
      await resetAllCompletedHaikus(user.id);
      return true; // Ensure we return something for the mutation
    },
    onSuccess: () => {
      console.log("RESET ALL - Clearing and invalidating ALL queries");
      
      // First, set empty data for completed haikus explicitly
      queryClient.setQueryData(['completed_haikus', user?.id], []);
      
      // Remove all queries from cache to ensure fresh data
      queryClient.removeQueries({ queryKey: ['completed_haikus'] });
      
      // Force invalidate all queries to trigger refetches
      queryClient.invalidateQueries();
      
      // Force refetch haikus data
      setTimeout(() => {
        console.log("Force refetching all data after reset");
        refetchHaikus();
        refetchCompletedHaikus();
      }, 100);
      
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
