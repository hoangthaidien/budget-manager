export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

export const COLLECTIONS = {
  CATEGORIES: import.meta.env.VITE_APPWRITE_COLLECTION_CATEGORIES_ID,
  TRANSACTIONS: import.meta.env.VITE_APPWRITE_COLLECTION_TRANSACTIONS_ID,
  BUDGETS: import.meta.env.VITE_APPWRITE_COLLECTION_BUDGETS_ID,
  TAGS: import.meta.env.VITE_APPWRITE_COLLECTION_TAGS_ID,
} as const;

export const QUERY_KEYS = {
  CATEGORIES: "categories",
  TRANSACTIONS: "transactions",
  BUDGETS: "budgets",
  TAGS: "tags",
} as const;
