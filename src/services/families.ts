import { ID, Query } from "appwrite";
import { tablesDB } from "@/lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";
import type {
  Family,
  FamilyMember,
  FamilyMemberPayload,
  FamilyPayload,
} from "@/types";

type HydratedMembership = FamilyMember & { family: Family };

const normalizeFamilyId = (family: string | Family) =>
  typeof family === "string" ? family : family.$id;

const indexFamilies = (families: Family[]) =>
  new Map(families.map((family) => [family.$id, family] as const));

export const familiesService = {
  // ---------------------------------------------------------------------------
  // Families
  // ---------------------------------------------------------------------------
  async listOwned(userId: string) {
    const response = await tablesDB.listRows<Family>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILIES,
      queries: [Query.equal("owner_id", userId), Query.orderAsc("name")],
    });

    return response.rows;
  },

  async listMemberships(userId: string) {
    const response = await tablesDB.listRows<FamilyMember>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILY_MEMBERS,
      queries: [Query.equal("user_id", userId)],
    });

    return response.rows;
  },

  async listMembershipsWithFamilies(userId: string) {
    const memberships = await this.listMemberships(userId);

    if (memberships.length === 0) {
      return [] as HydratedMembership[];
    }

    const familyIds = [
      ...new Set(
        memberships.map((membership) =>
          normalizeFamilyId(membership.family_id),
        ),
      ),
    ];

    const familiesResponse = await tablesDB.listRows<Family>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILIES,
      queries: [Query.equal("$id", familyIds)],
    });

    const familyMap = indexFamilies(familiesResponse.rows);

    return memberships.reduce<HydratedMembership[]>((acc, membership) => {
      const family = familyMap.get(normalizeFamilyId(membership.family_id));
      if (family) {
        acc.push({
          ...membership,
          family,
        });
      }
      return acc;
    }, []);
  },

  async listAccessible(userId: string) {
    const [ownedFamilies, membershipsWithFamily] = await Promise.all([
      this.listOwned(userId),
      this.listMembershipsWithFamilies(userId),
    ]);

    const ownedIds = new Set(ownedFamilies.map((family) => family.$id));
    const additionalFamilies = membershipsWithFamily
      .map((membership) => membership.family)
      .filter((family) => !ownedIds.has(family.$id));

    return [...ownedFamilies, ...additionalFamilies];
  },

  async get(familyId: string) {
    return tablesDB.getRow<Family>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILIES,
      rowId: familyId,
    });
  },

  async create(payload: FamilyPayload) {
    return tablesDB.createRow<Family>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILIES,
      rowId: ID.unique(),
      data: payload,
    });
  },

  async createWithOwner(payload: FamilyPayload) {
    const family = await this.create(payload);

    await tablesDB.createRow<FamilyMember>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILY_MEMBERS,
      rowId: ID.unique(),
      data: {
        family_id: family.$id,
        user_id: payload.owner_id,
        role: "owner",
      },
    });

    return family;
  },

  async update(familyId: string, payload: Partial<FamilyPayload>) {
    return tablesDB.updateRow<Family>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILIES,
      rowId: familyId,
      data: payload,
    });
  },

  async delete(familyId: string) {
    await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILIES,
      rowId: familyId,
    });
  },

  // ---------------------------------------------------------------------------
  // Ownership & membership helpers
  // ---------------------------------------------------------------------------
  async getMembership(
    userId: string,
    familyId: string,
    { hydrateFamily = false } = {},
  ) {
    const response = await tablesDB.listRows<FamilyMember>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILY_MEMBERS,
      queries: [
        Query.equal("user_id", userId),
        Query.equal("family_id", familyId),
      ],
    });

    const membership = response.rows.at(0) ?? null;

    if (!membership || !hydrateFamily) {
      return membership;
    }

    const family = await this.get(familyId);
    return {
      ...membership,
      family,
    } as HydratedMembership;
  },

  async ensureMember(userId: string, familyId: string) {
    const [family, membership] = await Promise.all([
      this.get(familyId),
      this.getMembership(userId, familyId),
    ]);

    const isOwner = family.owner_id === userId;

    if (!isOwner && !membership) {
      throw new Error("User is not part of this family.");
    }

    return {
      family,
      membership,
      isOwner,
    };
  },

  async ensureOwner(userId: string, familyId: string) {
    const family = await this.get(familyId);

    if (family.owner_id !== userId) {
      throw new Error("Only the family creator can perform this action.");
    }

    return family;
  },

  isOwner(userId: string, family: Family | string) {
    if (typeof family === "string") {
      return false;
    }
    return family.owner_id === userId;
  },

  // ---------------------------------------------------------------------------
  // Family members
  // ---------------------------------------------------------------------------
  async listMembers(familyId: string) {
    const response = await tablesDB.listRows<FamilyMember>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILY_MEMBERS,
      queries: [Query.equal("family_id", familyId)],
    });

    return response.rows;
  },

  async addMember(payload: FamilyMemberPayload) {
    return tablesDB.createRow<FamilyMember>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILY_MEMBERS,
      rowId: ID.unique(),
      data: {
        ...payload,
        role: payload.role ?? "member",
      },
    });
  },

  async updateMember(
    memberId: string,
    payload: Partial<Omit<FamilyMemberPayload, "family_id" | "user_id">>,
  ) {
    return tablesDB.updateRow<FamilyMember>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILY_MEMBERS,
      rowId: memberId,
      data: payload,
    });
  },

  async removeMember(memberId: string) {
    await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.FAMILY_MEMBERS,
      rowId: memberId,
    });
  },
};
