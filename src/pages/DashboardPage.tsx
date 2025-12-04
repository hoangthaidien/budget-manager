import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { vi, enUS } from "date-fns/locale";

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const formatCurrency = useCurrencyFormatter();
  const { user } = useAuth();
  const { data: transactions, isLoading } = useTransactions(user?.$id);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const currentLocale = i18n.resolvedLanguage === "vi" ? vi : enUS;

  const calculateTotals = () => {
    if (!transactions) return { balance: 0, income: 0, expense: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let income = 0;
    let expense = 0;
    let totalBalance = 0;

    transactions.forEach((t) => {
      const amount = t.amount;
      const tDate = new Date(t.date);

      // Total Balance (all time)
      if (t.type === "income") {
        totalBalance += amount;
      } else {
        totalBalance -= amount;
      }

      // Monthly stats
      if (
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      ) {
        if (t.type === "income") {
          income += amount;
        } else {
          expense += amount;
        }
      }
    });

    return { balance: totalBalance, income, expense };
  };

  const { balance, income, expense } = calculateTotals();

  if (isLoading) {
    return <div className="p-8 text-center">{t("app.loading")}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.totalBalance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.monthlyIncome")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(income)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.monthlyExpenses")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(expense)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.welcomeTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("dashboard.welcomeMessage")}
          </p>
        </CardContent>
      </Card>

      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border shadow-sm"
        captionLayout="dropdown"
        locale={currentLocale}
      />
    </div>
  );
}
