import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetsService } from "@/services/budgets";
import { QUERY_KEYS } from "@/lib/constants";
import type { BudgetPayload } from "@/types";

export function useBudgets(userId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.BUDGETS, userId],
    queryFn: () => budgetsService.list(userId!),
    enabled: !!userId,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetPayload) => budgetsService.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGETS, variables.user_id],
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
        queryKey: [QUERY_KEYS.BUDGETS, data.user_id],
      });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGETS],
      });
    },
  });
}
