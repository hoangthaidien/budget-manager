import { ID, Query } from "appwrite";
import { tablesDB } from "@/lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";
import type { Budget, BudgetPayload } from "@/types";

export const budgetsService = {
  async list(userId: string) {
    const response = await tablesDB.listRows<Budget>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.BUDGETS,
      queries: [
        Query.equal("user_id", [userId, "test-user-123"]),
        Query.orderDesc("$createdAt"),
      ],
    });
    return response.rows;
  },

  async create(payload: BudgetPayload) {
    return await tablesDB.createRow<Budget>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.BUDGETS,
      rowId: ID.unique(),
      data: payload,
    });
  },

  async update(id: string, payload: Partial<BudgetPayload>) {
    return await tablesDB.updateRow<Budget>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.BUDGETS,
      rowId: id,
      data: payload,
    });
  },

  async delete(id: string) {
    return await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.BUDGETS,
      rowId: id,
    });
  },
};
