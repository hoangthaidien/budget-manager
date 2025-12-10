import type { Models } from "appwrite";

export type TransactionType = "income" | "expense";
export type BudgetPeriod = "monthly" | "weekly" | "yearly";

export type FamilyRole = "owner" | "member";

export interface Family extends Models.Row {
  name: string;
  currency?: string;
  owner_id: string;
}

export interface FamilyMember extends Models.Row {
  family_id: string | Family;
  user_id: string;
  role: FamilyRole;
}

export interface Category extends Models.Row {
  name: string;
  type: TransactionType;
  icon?: string;
  family_id: string | Family;
  created_by: string;
}

export interface Tag extends Models.Row {
  name: string;
  family_id: string | Family;
  created_by: string;
}

export interface Transaction extends Models.Row {
  amount: number;
  type: TransactionType;
  category_id: string | Category; // Can be ID (string) or expanded Category object
  tags?: string[] | Tag[];
  date: string; // ISO 8601 datetime string
  description?: string;
  family_id: string | Family;
  created_by: string;
}

export interface Budget extends Models.Row {
  category_id: string | Category;
  amount: number;
  period: BudgetPeriod;
  family_id: string | Family;
  created_by: string;
}

// Payload types for creating/updating
export type CategoryPayload = {
  name: string;
  type: TransactionType;
  icon?: string;
  family_id: string;
  created_by: string;
};

export type TransactionPayload = {
  amount: number;
  type: TransactionType;
  category_id: string;
  tags?: string[];
  date: string;
  description?: string;
  family_id: string;
  created_by: string;
};

export type BudgetPayload = {
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  family_id: string;
  created_by: string;
};

export type TagPayload = {
  name: string;
  family_id: string;
  created_by: string;
};

export type FamilyPayload = {
  name: string;
  owner_id: string;
  currency?: string;
};

export type FamilyMemberPayload = {
  family_id: string;
  user_id: string;
  role?: FamilyRole;
};

export interface TransactionFilters {
  search?: string;
  type?: TransactionType | "all";
  category_id?: string | "all";
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
}
