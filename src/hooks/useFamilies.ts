import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { familiesService } from "@/services/families";
import { QUERY_KEYS } from "@/lib/constants";
import type { FamilyMemberPayload, FamilyPayload, Family } from "@/types";

const familyKey = (scope: string, ...parts: Array<string | undefined>) => [
  QUERY_KEYS.FAMILIES,
  scope,
  ...parts,
];

const membersKey = (familyId: string | undefined) => [
  QUERY_KEYS.FAMILY_MEMBERS,
  familyId,
];

type RemoveMemberInput = {
  memberId: string;
  userId?: string;
};

const invalidateFamilyListsForUser = (
  queryClient: QueryClient,
  userId?: string,
) => {
  if (!userId) return;
  queryClient.invalidateQueries({ queryKey: familyKey("owned", userId) });
  queryClient.invalidateQueries({ queryKey: familyKey("accessible", userId) });
};

const invalidateMembershipForUser = (
  queryClient: QueryClient,
  userId?: string,
  familyId?: string,
) => {
  if (!userId || !familyId) return;
  queryClient.invalidateQueries({
    queryKey: familyKey("membership", userId, familyId),
  });
};

export function useOwnedFamilies(userId: string | undefined) {
  return useQuery({
    queryKey: familyKey("owned", userId),
    queryFn: () => familiesService.listOwned(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAccessibleFamilies(userId: string | undefined) {
  return useQuery({
    queryKey: familyKey("accessible", userId),
    queryFn: () => familiesService.listAccessible(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMembershipsWithFamilies(userId: string | undefined) {
  return useQuery({
    queryKey: familyKey("memberships-with-family", userId),
    queryFn: () => familiesService.listMembershipsWithFamilies(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFamilyMembership(
  userId: string | undefined,
  familyId: string | undefined,
) {
  return useQuery({
    queryKey: familyKey("membership", userId, familyId),
    queryFn: () =>
      familiesService.getMembership(userId!, familyId!, {
        hydrateFamily: true,
      }),
    enabled: Boolean(userId && familyId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFamilyMembers(familyId: string | undefined) {
  return useQuery({
    queryKey: membersKey(familyId),
    queryFn: () => familiesService.listMembers(familyId!),
    enabled: Boolean(familyId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FamilyPayload) =>
      familiesService.createWithOwner(payload),
    onSuccess: (_data, variables) => {
      invalidateFamilyListsForUser(queryClient, variables.owner_id);
    },
  });
}

export function useUpdateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<FamilyPayload>;
    }) => familiesService.update(id, payload),
    onSuccess: (updatedFamily: Family) => {
      invalidateFamilyListsForUser(queryClient, updatedFamily.owner_id);
      invalidateMembershipForUser(
        queryClient,
        updatedFamily.owner_id,
        updatedFamily.$id,
      );
    },
  });
}

export function useDeleteFamily(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (familyId: string) => familiesService.delete(familyId),
    onSuccess: () => {
      if (ownerId) {
        invalidateFamilyListsForUser(queryClient, ownerId);
      } else {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAMILIES] });
      }
    },
  });
}

export function useAddFamilyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FamilyMemberPayload) =>
      familiesService.addMember(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: membersKey(variables.family_id),
      });
      invalidateFamilyListsForUser(queryClient, variables.user_id);
      invalidateMembershipForUser(
        queryClient,
        variables.user_id,
        variables.family_id,
      );
    },
  });
}

export function useUpdateFamilyMember(familyId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<FamilyMemberPayload, "family_id" | "user_id">>;
    }) => familiesService.updateMember(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(familyId) });
    },
  });
}

export function useRemoveFamilyMember(familyId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, RemoveMemberInput>({
    mutationFn: ({ memberId }) => familiesService.removeMember(memberId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: membersKey(familyId) });
      invalidateFamilyListsForUser(queryClient, variables.userId);
      invalidateMembershipForUser(queryClient, variables.userId, familyId);
    },
  });
}
