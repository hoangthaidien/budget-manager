import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetsService } from "@/services/budgets";
import { QUERY_KEYS } from "@/lib/constants";
import type { BudgetPayload } from "@/types";

export function useBudgets(familyId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.BUDGETS, familyId],
    queryFn: () => budgetsService.list(familyId!),
    enabled: !!familyId,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetPayload) => budgetsService.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGETS, variables.family_id],
      });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<BudgetPayload>;
    }) => budgetsService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGETS, data.family_id],
      });
    },
  });
}

export function useDeleteBudget(familyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetsService.delete(id),
    onSuccess: () => {
      if (familyId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.BUDGETS, familyId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.BUDGETS],
        });
      }
    },
  });
}
