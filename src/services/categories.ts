import { ID, Query } from "appwrite";
import { tablesDB } from "@/lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";
import type { Category, CategoryPayload } from "@/types";

export const categoriesService = {
  async list(familyId: string) {
    const response = await tablesDB.listRows<Category>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.CATEGORIES,
      queries: [
        Query.equal("family_id", familyId),
        Query.orderAsc("name"),
        Query.limit(1000),
      ],
    });
    return response.rows;
  },

  async create(payload: CategoryPayload) {
    return await tablesDB.createRow<Category>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.CATEGORIES,
      rowId: ID.unique(),
      data: payload,
    });
  },

  async update(id: string, payload: Partial<CategoryPayload>) {
    return await tablesDB.updateRow<Category>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.CATEGORIES,
      rowId: id,
      data: payload,
    });
  },

  async delete(id: string) {
    return await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.CATEGORIES,
      rowId: id,
    });
  },
};
