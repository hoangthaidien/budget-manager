import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories";
import { QUERY_KEYS } from "@/lib/constants";
import type { CategoryPayload } from "@/types";

export function useCategories(familyId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, familyId],
    queryFn: () => categoriesService.list(familyId!),
    enabled: !!familyId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryPayload) => categoriesService.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CATEGORIES, variables.family_id],
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CategoryPayload>;
    }) => categoriesService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CATEGORIES, data.family_id],
      });
    },
  });
}

export function useDeleteCategory(familyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      if (familyId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.CATEGORIES, familyId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.CATEGORIES],
        });
      }
    },
  });
}
