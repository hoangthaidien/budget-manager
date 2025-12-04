export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

export const COLLECTIONS = {
  FAMILIES: import.meta.env.VITE_APPWRITE_COLLECTION_FAMILIES_ID,
  FAMILY_MEMBERS: import.meta.env.VITE_APPWRITE_COLLECTION_FAMILY_MEMBERS_ID,
  CATEGORIES: import.meta.env.VITE_APPWRITE_COLLECTION_CATEGORIES_ID,
  TRANSACTIONS: import.meta.env.VITE_APPWRITE_COLLECTION_TRANSACTIONS_ID,
  BUDGETS: import.meta.env.VITE_APPWRITE_COLLECTION_BUDGETS_ID,
  TAGS: import.meta.env.VITE_APPWRITE_COLLECTION_TAGS_ID,
} as const;

export const QUERY_KEYS = {
  FAMILIES: "families",
  FAMILY_MEMBERS: "family-members",
  CATEGORIES: "categories",
  TRANSACTIONS: "transactions",
  BUDGETS: "budgets",
  TAGS: "tags",
} as const;
