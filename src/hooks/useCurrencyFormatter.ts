import { useTranslation } from "react-i18next";

export function useCurrencyFormatter() {
  const { i18n } = useTranslation();

  const formatCurrency = (amount: number) => {
    const locale = i18n.resolvedLanguage === "vi" ? "vi-VN" : "en-US";
    const currency = i18n.resolvedLanguage === "vi" ? "VND" : "USD";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return formatCurrency;
}
