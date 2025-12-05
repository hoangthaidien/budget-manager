import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import {
  useBudgets,
  useCreateBudget,
  useDeleteBudget,
} from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon-picker";
import { Trash2, Plus, AlertCircle, X } from "lucide-react";
import type { BudgetPeriod, Category, Budget } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { getCategoryName as getLocalizedCategoryName } from "@/lib/i18n-utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function BudgetsPage() {
  const { t, i18n } = useTranslation();
  const formatCurrency = useCurrencyFormatter();
  const { user } = useAuth();
  const { activeFamilyId, isOwnerOfActiveFamily } = useFamily();
  const { data: budgets, isLoading: isLoadingBudgets } = useBudgets(
    activeFamilyId ?? undefined,
  );
  const { data: categories } = useCategories(activeFamilyId ?? undefined);
  const { data: transactions } = useTransactions(activeFamilyId ?? undefined);

  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget(activeFamilyId ?? undefined);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const isFormDisabled = !activeFamilyId || !user?.$id;

  // Filter for expense categories mostly, but let's show all for flexibility
  const availableCategories = categories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.$id || !activeFamilyId || !amount || !categoryId) return;

    try {
      await createBudget.mutateAsync({
        amount: parseFloat(amount),
        category_id: categoryId,
        period,
        family_id: activeFamilyId,
        created_by: user.$id,
      });
      setAmount("");
      setCategoryId("");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to create budget:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!isOwnerOfActiveFamily) return;
      await deleteBudget.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  const getCategoryName = (catId: string | Category) => {
    const lang = i18n.resolvedLanguage || "en";
    if (typeof catId === "object") return getLocalizedCategoryName(catId, lang);
    const cat = categories?.find((c) => c.$id === catId);
    return cat
      ? getLocalizedCategoryName(cat, lang)
      : t("common.unknownCategory");
  };

  const calculateProgress = (budget: Budget) => {
    if (!transactions) return { spent: 0, percentage: 0 };

    const categoryId =
      typeof budget.category_id === "object"
        ? budget.category_id.$id
        : budget.category_id;

    // Filter transactions for this category and current period (assuming monthly for now)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spent = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        const tCatId =
          typeof t.category_id === "object" ? t.category_id.$id : t.category_id;

        return (
          tCatId === categoryId &&
          t.type === "expense" &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = Math.min((spent / budget.amount) * 100, 100);
    return { spent, percentage };
  };

  if (isLoadingBudgets) {
    return <div className="p-8 text-center">{t("app.loading")}</div>;
  }

  if (!activeFamilyId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t(
          "budgets.familyRequiredMessage",
          "Select a family to manage shared budgets.",
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("budgets.title")}</h1>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t("budgets.setBudgetTitle")}
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid gap-8",
          isFormOpen ? "lg:grid-cols-[350px_1fr]" : "grid-cols-1",
        )}
      >
        {/* Create Budget Form */}
        {isFormOpen && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>{t("budgets.setBudgetTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    {t("transactions.categoryLabel")}
                  </Label>
                  <select
                    id="category"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={isFormDisabled}
                    required
                  >
                    <option value="" disabled>
                      {t("transactions.selectCategory")}
                    </option>
                    {availableCategories.map((cat) => (
                      <option key={cat.$id} value={cat.$id}>
                        {getLocalizedCategoryName(
                          cat,
                          i18n.resolvedLanguage || "en",
                        )}{" "}
                        ({t(`categories.${cat.type}`)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {t("budgets.limitAmountLabel")}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isFormDisabled}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">{t("budgets.periodLabel")}</Label>
                  <select
                    id="period"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
                    disabled={isFormDisabled}
                  >
                    <option value="monthly">
                      {t("budgets.periods.monthly")}
                    </option>
                    <option value="weekly">
                      {t("budgets.periods.weekly")}
                    </option>
                    <option value="yearly">
                      {t("budgets.periods.yearly")}
                    </option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createBudget.isPending || isFormDisabled}
                >
                  {createBudget.isPending ? (
                    t("budgets.submitting")
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> {t("budgets.submit")}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setIsFormOpen(false)}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </form>
              {isFormDisabled && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {t(
                    "budgets.familyRequiredHint",
                    "You must select a family before creating budgets.",
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Budgets List */}
        <div className="space-y-6">
          {budgets?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {t("budgets.empty")}
              </CardContent>
            </Card>
          ) : (
            budgets?.map((budget) => {
              const { spent, percentage } = calculateProgress(budget);
              const isOverBudget = spent > budget.amount;

              const catId =
                typeof budget.category_id === "object"
                  ? budget.category_id.$id
                  : budget.category_id;
              const category = categories?.find((c) => c.$id === catId);
              const iconName = category?.icon as IconName | undefined;

              return (
                <Card key={budget.$id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {iconName && (
                            <Icon name={iconName} className="h-5 w-5" />
                          )}
                          {getCategoryName(budget.category_id)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {t(`budgets.periods.${budget.period}`)}
                        </p>
                      </div>
                      {isOwnerOfActiveFamily && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              disabled={deleteBudget.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4" align="end">
                            <div className="flex flex-col gap-4">
                              <p className="text-sm font-medium">
                                {t("budgets.deleteConfirm")}
                              </p>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(budget.$id)}
                                className="w-full"
                                disabled={deleteBudget.isPending}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span
                          className={cn(
                            isOverBudget
                              ? "text-red-600 font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatCurrency(spent)} {t("budgets.spent")}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(budget.amount)} {t("budgets.limit")}
                        </span>
                      </div>

                      {/* Custom Progress Bar */}
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-500 ease-in-out",
                            isOverBudget
                              ? "bg-red-600"
                              : percentage > 80
                                ? "bg-yellow-500"
                                : "bg-green-600",
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-muted-foreground">
                          {percentage.toFixed(0)}% {t("budgets.used")}
                        </span>
                        {isOverBudget && (
                          <span className="flex items-center text-red-600 font-medium">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {t("budgets.overBudget")}{" "}
                            {formatCurrency(spent - budget.amount)}
                          </span>
                        )}
                        {!isOverBudget && (
                          <span className="text-green-600">
                            {formatCurrency(budget.amount - spent)}{" "}
                            {t("budgets.remaining")}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
