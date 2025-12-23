import { ID, Query } from "appwrite";
import { tablesDB } from "@/lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";
import type {
  Transaction,
  TransactionPayload,
  TransactionFilters,
} from "@/types";

export const transactionsService = {
  async list(familyId: string, filters?: TransactionFilters) {
    const queries = [
      Query.equal("family_id", familyId),
      Query.orderDesc("date"),
      Query.orderDesc("$createdAt"),
      Query.limit(1000),
    ];

    if (filters) {
      if (filters.type && filters.type !== "all") {
        queries.push(Query.equal("type", filters.type));
      }
      if (filters.category_id && filters.category_id !== "all") {
        queries.push(Query.equal("category_id", filters.category_id));
      }
      if (filters.startDate) {
        queries.push(
          Query.greaterThanEqual("date", filters.startDate.toISOString()),
        );
      }
      if (filters.endDate) {
        queries.push(
          Query.lessThanEqual("date", filters.endDate.toISOString()),
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        queries.push(Query.equal("tags", filters.tags));
      }
    }

    const response = await tablesDB.listRows<Transaction>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.TRANSACTIONS,
      queries,
    });
    return response.rows;
  },

  async create(payload: TransactionPayload) {
    return await tablesDB.createRow<Transaction>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.TRANSACTIONS,
      rowId: ID.unique(),
      data: payload,
    });
  },

  async update(id: string, payload: Partial<TransactionPayload>) {
    return await tablesDB.updateRow<Transaction>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.TRANSACTIONS,
      rowId: id,
      data: payload,
    });
  },

  async delete(id: string) {
    return await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.TRANSACTIONS,
      rowId: id,
    });
  },
};
