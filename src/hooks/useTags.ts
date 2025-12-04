import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsService } from "@/services/tags";
import { QUERY_KEYS } from "@/lib/constants";
import type { TagPayload } from "@/types";

export function useTags(userId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.TAGS, userId],
    queryFn: () => tagsService.list(userId!),
    enabled: !!userId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TagPayload) => tagsService.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TAGS, variables.user_id],
      });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TAGS],
      });
    },
  });
}
