import type { Models } from "appwrite";

export type TransactionType = "income" | "expense";
export type BudgetPeriod = "monthly" | "weekly" | "yearly";

export interface Category extends Models.Row {
  name: string;
  type: TransactionType;
  icon?: string;
  user_id: string;
}

export interface Tag extends Models.Row {
  name: string;
  user_id: string;
}

export interface Transaction extends Models.Row {
  amount: number;
  type: TransactionType;
  category_id: string | Category; // Can be ID (string) or expanded Category object
  tags?: string[] | Tag[];
  date: string; // ISO 8601 datetime string
  description?: string;
  user_id: string;
}

export interface Budget extends Models.Row {
  category_id: string | Category;
  amount: number;
  period: BudgetPeriod;
  user_id: string;
}

// Payload types for creating/updating
export type CategoryPayload = {
  name: string;
  type: TransactionType;
  icon?: string;
  user_id: string;
};

export type TransactionPayload = {
  amount: number;
  type: TransactionType;
  category_id: string;
  tags?: string[];
  date: string;
  description?: string;
  user_id: string;
};

export type BudgetPayload = {
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  user_id: string;
};

export type TagPayload = {
  name: string;
  user_id: string;
};
