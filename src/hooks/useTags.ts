import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsService } from "@/services/tags";
import { QUERY_KEYS } from "@/lib/constants";
import type { TagPayload } from "@/types";

export function useTags(familyId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.TAGS, familyId],
    queryFn: () => tagsService.list(familyId!),
    enabled: !!familyId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TagPayload) => tagsService.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TAGS, variables.family_id],
      });
    },
  });
}

export function useDeleteTag(familyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsService.delete(id),
    onSuccess: () => {
      if (familyId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.TAGS, familyId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.TAGS],
        });
      }
    },
  });
}
