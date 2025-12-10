import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsService } from "@/services/transactions";
import { QUERY_KEYS } from "@/lib/constants";
import type { TransactionPayload, TransactionFilters } from "@/types";

export function useTransactions(
  familyId: string | undefined,
  filters?: TransactionFilters,
) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, familyId, filters],
    queryFn: () => transactionsService.list(familyId!, filters),
    enabled: !!familyId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransactionPayload) =>
      transactionsService.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TRANSACTIONS, variables.family_id],
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<TransactionPayload>;
    }) => transactionsService.update(id, payload),
    onSuccess: (data) => {
      const familyId =
        typeof data.family_id === "object"
          ? data.family_id.$id
          : data.family_id;
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TRANSACTIONS, familyId],
      });
    },
  });
}

export function useDeleteTransaction(familyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      if (familyId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.TRANSACTIONS, familyId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.TRANSACTIONS],
        });
      }
    },
  });
}
