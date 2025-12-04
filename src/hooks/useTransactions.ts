import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsService } from "@/services/transactions";
import { QUERY_KEYS } from "@/lib/constants";
import type { TransactionPayload } from "@/types";

export function useTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, userId],
    queryFn: () => transactionsService.list(userId!),
    enabled: !!userId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransactionPayload) =>
      transactionsService.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TRANSACTIONS, variables.user_id],
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
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TRANSACTIONS, data.user_id],
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TRANSACTIONS],
      });
    },
  });
}
