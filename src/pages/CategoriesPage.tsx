import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ArrowUpCircle, ArrowDownCircle, X } from "lucide-react";
import type { TransactionType } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { createLocalizedString, getCategoryName } from "@/lib/i18n-utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconPicker, Icon, type IconName } from "@/components/ui/icon-picker";

export default function CategoriesPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { activeFamilyId, isOwnerOfActiveFamily } = useFamily();
  const { data: categories, isLoading } = useCategories(
    activeFamilyId ?? undefined,
  );
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory(activeFamilyId ?? undefined);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [nameEn, setNameEn] = useState("");
  const [nameVi, setNameVi] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconName | undefined>(
    undefined,
  );
  const [newCategoryType, setNewCategoryType] =
    useState<TransactionType>("expense");
  const isFormDisabled = !activeFamilyId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.$id || !activeFamilyId || !nameEn.trim()) return;

    try {
      const localizedName = createLocalizedString({
        en: nameEn,
        vi: nameVi || nameEn,
      });

      await createCategory.mutateAsync({
        name: localizedName,
        type: newCategoryType,
        family_id: activeFamilyId,
        created_by: user.$id,
        icon: selectedIcon || "circle",
      });
      setNameEn("");
      setNameVi("");
      setSelectedIcon(undefined);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!isOwnerOfActiveFamily) return;
      await deleteCategory.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">{t("app.loading")}</div>;
  }

  if (!activeFamilyId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t(
          "categories.familyRequiredMessage",
          "Select or create a family to manage categories.",
        )}
      </div>
    );
  }

  const incomeCategories = categories?.filter((c) => c.type === "income") || [];
  const expenseCategories =
    categories?.filter((c) => c.type === "expense") || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("categories.title")}</h1>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t("categories.addTitle")}
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid gap-8",
          isFormOpen ? "md:grid-cols-[350px_1fr]" : "grid-cols-1",
        )}
      >
        {/* Create Category Form */}
        {isFormOpen && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>{t("categories.addTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nameEn">
                    {t("categories.nameLabel")} (EN)
                  </Label>
                  <Input
                    id="nameEn"
                    placeholder="e.g. Groceries"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    disabled={isFormDisabled}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameVi">
                    {t("categories.nameLabel")} (VI)
                  </Label>
                  <Input
                    id="nameVi"
                    placeholder="e.g. Ăn uống"
                    value={nameVi}
                    onChange={(e) => setNameVi(e.target.value)}
                    disabled={isFormDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("categories.iconLabel", "Icon")}</Label>
                  <div className="flex">
                    <IconPicker
                      value={selectedIcon}
                      onValueChange={setSelectedIcon}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("categories.typeLabel")}</Label>
                  <RadioGroup
                    value={newCategoryType}
                    onValueChange={(value) =>
                      setNewCategoryType(value as TransactionType)
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="income"
                        id="income"
                        disabled={isFormDisabled}
                      />
                      <Label htmlFor="income" className="cursor-pointer">
                        {t("categories.income")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="expense"
                        id="expense"
                        disabled={isFormDisabled}
                      />
                      <Label htmlFor="expense" className="cursor-pointer">
                        {t("categories.expense")}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createCategory.isPending || isFormDisabled}
                >
                  {createCategory.isPending ? (
                    t("categories.submitting")
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> {t("categories.submit")}
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
                {isFormDisabled && (
                  <p className="text-xs text-muted-foreground text-center">
                    {t(
                      "categories.familyRequiredHint",
                      "You must select a family before adding categories.",
                    )}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <div className="space-y-6">
          {/* Income Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-green-600">
              <ArrowUpCircle className="h-5 w-5" /> {t("categories.income")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {incomeCategories.length === 0 ? (
                <p className="text-muted-foreground text-sm col-span-full">
                  {t("categories.emptyIncome")}
                </p>
              ) : (
                incomeCategories.map((category) => (
                  <Card key={category.$id} className="overflow-hidden">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {category.icon && (
                          <div className="p-2 bg-muted rounded-md">
                            <Icon
                              name={category.icon as IconName}
                              className="h-4 w-4"
                            />
                          </div>
                        )}
                        <span className="font-medium">
                          {getCategoryName(
                            category,
                            i18n.resolvedLanguage || "en",
                          )}
                        </span>
                      </div>
                      {isOwnerOfActiveFamily && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/90"
                              disabled={deleteCategory.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4" align="end">
                            <div className="flex flex-col gap-4">
                              <p className="text-sm font-medium">
                                {t("categories.deleteConfirm")}
                              </p>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(category.$id)}
                                className="w-full"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Expense Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-red-600">
              <ArrowDownCircle className="h-5 w-5" /> {t("categories.expense")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {expenseCategories.length === 0 ? (
                <p className="text-muted-foreground text-sm col-span-full">
                  {t("categories.emptyExpense")}
                </p>
              ) : (
                expenseCategories.map((category) => (
                  <Card key={category.$id} className="overflow-hidden">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {category.icon && (
                          <div className="p-2 bg-muted rounded-md">
                            <Icon
                              name={category.icon as IconName}
                              className="h-4 w-4"
                            />
                          </div>
                        )}
                        <span className="font-medium">
                          {getCategoryName(
                            category,
                            i18n.resolvedLanguage || "en",
                          )}
                        </span>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                            disabled={deleteCategory.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="end">
                          <div className="flex flex-col gap-4">
                            <p className="text-sm font-medium">
                              {t("categories.deleteConfirm")}
                            </p>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(category.$id)}
                              className="w-full"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
