import { ID, Query } from "appwrite";
import { tablesDB } from "@/lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";
import type { Tag, TagPayload } from "@/types";

export const tagsService = {
  async list(userId: string) {
    const response = await tablesDB.listRows<Tag>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.TAGS,
      queries: [
        Query.equal("user_id", userId),
        Query.orderAsc("name"),
      ],
    });
    return response.rows;
  },

  async create(payload: TagPayload) {
    return await tablesDB.createRow<Tag>({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.TAGS,
      rowId: ID.unique(),
      data: payload,
    });
  },

  async delete(id: string) {
    return await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.TAGS,
      rowId: id,
    });
  },
};
