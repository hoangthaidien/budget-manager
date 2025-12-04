/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useOwnedFamilies,
  useMembershipsWithFamilies,
} from "@/hooks/useFamilies";
import type { Family, FamilyMember } from "@/types";

type HydratedMembership = FamilyMember & { family: Family };

interface FamilyContextValue {
  userId: string | null;
  families: Family[];
  memberships: HydratedMembership[];
  activeFamilyId: string | null;
  activeFamily: Family | null;
  setActiveFamilyId: (familyId: string | null) => void;
  isOwnerOfActiveFamily: boolean;
  refreshFamilies: () => Promise<void>;
  isLoading: boolean;
}

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined);
const STORAGE_KEY_PREFIX = "budget-manager:active-family";

const buildStorageKey = (userId: string | null) =>
  `${STORAGE_KEY_PREFIX}:${userId ?? "anonymous"}`;

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.$id ?? null;

  const ownedFamiliesQuery = useOwnedFamilies(userId ?? undefined);
  const membershipsQuery = useMembershipsWithFamilies(userId ?? undefined);

  const {
    data: ownedFamilies = [],
    isLoading: isLoadingOwnedFamilies,
    isFetching: isFetchingOwnedFamilies,
    refetch: refetchOwnedFamilies,
  } = ownedFamiliesQuery;

  const {
    data: membershipsWithFamily = [],
    isLoading: isLoadingMemberships,
    isFetching: isFetchingMemberships,
    refetch: refetchMemberships,
  } = membershipsQuery;

  const accessibleFamilies = useMemo(() => {
    const ownedIds = new Set(ownedFamilies.map((f) => f.$id));
    const memberFamilies = membershipsWithFamily
      .map((m) => m.family)
      .filter((f) => !ownedIds.has(f.$id));

    return [...ownedFamilies, ...memberFamilies];
  }, [ownedFamilies, membershipsWithFamily]);

  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(null);

  // Hydrate active family preference from localStorage when the user changes
  useEffect(() => {
    if (!userId) {
      setActiveFamilyId(null);
      return;
    }

    if (typeof window === "undefined" || !window.localStorage) {
      setActiveFamilyId(null);
      return;
    }

    try {
      const storedId = window.localStorage.getItem(buildStorageKey(userId));
      if (storedId) {
        setActiveFamilyId(storedId);
      } else {
        setActiveFamilyId(null);
      }
    } catch {
      setActiveFamilyId(null);
    }
  }, [userId]);

  // Ensure the currently selected family is valid. Fallback to the first available.
  useEffect(() => {
    if (!accessibleFamilies.length) {
      return;
    }

    const currentFamilyExists = accessibleFamilies.some(
      (family) => family.$id === activeFamilyId,
    );

    if (!currentFamilyExists) {
      setActiveFamilyId(accessibleFamilies[0].$id);
    }
  }, [accessibleFamilies, activeFamilyId]);

  const handleSetActiveFamilyId = useCallback(
    (familyId: string | null) => {
      setActiveFamilyId(familyId);

      if (!userId) return;
      if (typeof window === "undefined" || !window.localStorage) return;

      try {
        if (familyId) {
          window.localStorage.setItem(buildStorageKey(userId), familyId);
        } else {
          window.localStorage.removeItem(buildStorageKey(userId));
        }
      } catch {
        // Ignore storage errors (e.g., private mode)
      }
    },
    [userId],
  );

  const activeFamily =
    accessibleFamilies.find((family) => family.$id === activeFamilyId) ?? null;

  const isOwnerOfActiveFamily = Boolean(
    activeFamily && activeFamily.owner_id === userId,
  );

  const refreshFamilies = useCallback(async () => {
    await Promise.all([refetchOwnedFamilies(), refetchMemberships()]);
  }, [refetchOwnedFamilies, refetchMemberships]);

  const value: FamilyContextValue = useMemo(
    () => ({
      userId,
      families: accessibleFamilies,
      memberships: membershipsWithFamily,
      activeFamilyId,
      activeFamily,
      setActiveFamilyId: handleSetActiveFamilyId,
      isOwnerOfActiveFamily,
      refreshFamilies,
      isLoading:
        isLoadingOwnedFamilies ||
        isFetchingOwnedFamilies ||
        isLoadingMemberships ||
        isFetchingMemberships,
    }),
    [
      userId,
      accessibleFamilies,
      membershipsWithFamily,
      activeFamilyId,
      activeFamily,
      handleSetActiveFamilyId,
      isOwnerOfActiveFamily,
      refreshFamilies,
      isLoadingOwnedFamilies,
      isFetchingOwnedFamilies,
      isLoadingMemberships,
      isFetchingMemberships,
    ],
  );

  return (
    <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error("useFamily must be used within a FamilyProvider");
  }
  return context;
}
