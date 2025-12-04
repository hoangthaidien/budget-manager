import type { Category } from "@/types";

/**
 * Utility to handle localized content storage and retrieval.
 *
 * Strategy:
 * We will store localized strings in a JSON string format within the database field.
 * Example: '{"en": "Food", "vi": "Ăn uống"}'
 *
 * If the field is not a valid JSON object (legacy data), we treat it as the default language (en)
 * or return it as is.
 */

export type LocalizedString = string; // Stored as JSON string in DB

export const parseLocalizedString = (
  value: string | undefined | null,
  lang: string,
  fallbackLang = "en",
): string => {
  if (!value) return "";

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      return (
        parsed[lang] || parsed[fallbackLang] || Object.values(parsed)[0] || ""
      );
    }
  } catch {
    // Not a JSON string, return as is (legacy support)
    return value;
  }

  return value;
};

export const createLocalizedString = (
  values: Record<string, string>,
): LocalizedString => {
  return JSON.stringify(values);
};

/**
 * Helper to get category name in current language
 */
export const getCategoryName = (category: Category, lang: string): string => {
  return parseLocalizedString(category.name, lang);
};
