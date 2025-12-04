import { ID, Query } from "appwrite";
import { tablesDB } from "@/lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";
import type { Transaction, TransactionPayload } from "@/types";

export const transactionsService = {
  async list(userId: string) {
    const response = await tablesDB.listRows<Transaction>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.TRANSACTIONS,
      queries: [
        Query.equal("user_id", [userId, "test-user-123"]),
        Query.orderDesc("date"),
        Query.orderDesc("$createdAt"),
      ],
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
