import { useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useTags, useCreateTag } from "@/hooks/useTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon-picker";
import {
  Trash2,
  Plus,
  Calendar as CalendarIcon,
  DollarSign,
  Tag as TagIcon,
  Pencil,
  X,
  Search,
  Filter,
} from "lucide-react";
import type { Transaction, TransactionType, Category, Tag } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { getCategoryName as getLocalizedCategoryName } from "@/lib/i18n-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { NumericFormat } from "react-number-format";

interface FilterControlsProps {
  filterType: TransactionType | "all";
  setFilterType: (value: TransactionType | "all") => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  categories: Category[] | undefined;
  filterTags: string[];
  setFilterTags: (value: string[]) => void;
  tags: Tag[] | undefined;
  dateRange: DateRange | undefined;
  setDateRange: (value: DateRange | undefined) => void;
  fullWidth?: boolean;
}

function FilterControls({
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  categories,
  filterTags,
  setFilterTags,
  tags,
  dateRange,
  setDateRange,
  fullWidth = false,
}: FilterControlsProps) {
  const { t, i18n } = useTranslation();

  return (
    <>
      <Select
        value={filterType}
        onValueChange={(value) =>
          setFilterType(value as TransactionType | "all")
        }
      >
        <SelectTrigger className={cn(fullWidth ? "w-full" : "w-[180px]")}>
          <SelectValue placeholder={t("categories.typeLabel")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {t("common.allTypes", "All Types")}
          </SelectItem>
          <SelectItem value="income">{t("categories.income")}</SelectItem>
          <SelectItem value="expense">{t("categories.expense")}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterCategory} onValueChange={setFilterCategory}>
        <SelectTrigger className={cn(fullWidth ? "w-full" : "w-[200px]")}>
          <SelectValue placeholder={t("transactions.categoryLabel")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {t("common.allCategories", "All Categories")}
          </SelectItem>
          {categories?.map((cat) => (
            <SelectItem key={cat.$id} value={cat.$id}>
              {getLocalizedCategoryName(cat, i18n.resolvedLanguage || "en")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className={cn(fullWidth ? "w-full" : "w-[200px]")}>
        <MultiSelect
          options={
            tags?.map((tag) => ({
              label: tag.name,
              value: tag.$id,
            })) || []
          }
          selected={filterTags}
          onChange={setFilterTags}
          placeholder={t("transactions.filterTags", "Filter by tags")}
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              fullWidth ? "w-full" : "w-60",
              "justify-start text-left font-normal",
              !dateRange && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>{t("common.pickDateRange", "Pick a date range")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}

export default function TransactionsPage() {
  const { t, i18n } = useTranslation();
  const formatCurrency = useCurrencyFormatter();
  const { user } = useAuth();
  const { activeFamilyId, isOwnerOfActiveFamily } = useFamily();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: rawTransactions, isLoading: isLoadingTransactions } =
    useTransactions(activeFamilyId ?? undefined, {
      type: filterType,
      category_id: filterCategory,
      tags: filterTags,
      startDate: dateRange?.from,
      endDate: dateRange?.to,
    });

  const { data: categories } = useCategories(activeFamilyId ?? undefined);
  const { data: tags } = useTags(activeFamilyId ?? undefined);

  const currentLocale = i18n.language === "vi" ? vi : enUS;

  const transactions = rawTransactions?.filter((t) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    const category =
      typeof t.category_id === "object"
        ? t.category_id
        : categories?.find((c) => c.$id === t.category_id);
    const categoryName = category
      ? getLocalizedCategoryName(category, i18n.resolvedLanguage || "en")
      : "";

    return (
      t.description?.toLowerCase().includes(searchLower) ||
      categoryName.toLowerCase().includes(searchLower)
    );
  });

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction(activeFamilyId ?? undefined);
  const createTag = useCreateTag();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const isFormDisabled = !activeFamilyId;

  // Filter categories based on selected type
  const availableCategories = categories?.filter((c) => c.type === type) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.$id || !activeFamilyId || !amount || !categoryId || !date)
      return;

    try {
      if (editingId) {
        await updateTransaction.mutateAsync({
          id: editingId,
          payload: {
            amount: parseFloat(amount),
            type,
            category_id: categoryId,
            tags: selectedTags,
            date: date.toISOString(),
            description,
            family_id: activeFamilyId,
            created_by: user.$id,
          },
        });
      } else {
        await createTransaction.mutateAsync({
          amount: parseFloat(amount),
          type,
          category_id: categoryId,
          tags: selectedTags,
          date: date.toISOString(),
          description,
          family_id: activeFamilyId,
          created_by: user.$id,
        });
      }

      // Reset form
      setAmount("");
      setDescription("");
      setSelectedTags([]);
      setEditingId(null);
      if (editingId) {
        setDate(new Date());
        setCategoryId("");
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  };

  const handleCreateTag = async (name: string) => {
    if (!user?.$id || !activeFamilyId) return;
    try {
      const newTag = await createTag.mutateAsync({
        name,
        family_id: activeFamilyId,
        created_by: user.$id,
      });
      setSelectedTags([...selectedTags, newTag.$id]);
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setIsFormOpen(true);
    setEditingId(transaction.$id);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    const catId =
      typeof transaction.category_id === "object"
        ? transaction.category_id.$id
        : transaction.category_id;
    setCategoryId(catId);
    setDate(new Date(transaction.date));
    setDescription(transaction.description || "");
    const transactionTags =
      transaction.tags?.map((t) => (typeof t === "object" ? t.$id : t)) || [];
    setSelectedTags(transactionTags);
  };

  const handleCancel = () => {
    setEditingId(null);
    setAmount("");
    setCategoryId("");
    setDescription("");
    setDate(new Date());
    setSelectedTags([]);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      if (!activeFamilyId || !isOwnerOfActiveFamily) return;
      await deleteTransaction.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const getCategoryName = (catId: string | Category) => {
    const lang = i18n.resolvedLanguage || "en";
    // If catId is an object (expanded), return name
    if (catId && typeof catId === "object")
      return getLocalizedCategoryName(catId, lang);
    // If catId is string, find in categories list
    const cat = categories?.find((c) => c.$id === catId);
    return cat
      ? getLocalizedCategoryName(cat, lang)
      : t("common.unknownCategory");
  };

  if (isLoadingTransactions) {
    return <div className="p-8 text-center">{t("app.loading")}</div>;
  }

  if (!activeFamilyId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t(
          "transactions.familyRequiredMessage",
          "Select a family to manage shared transactions.",
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("transactions.title")}</h1>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t("transactions.addTitle")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t(
                "transactions.searchPlaceholder",
                "Search transactions...",
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden shrink-0"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[400px] overflow-y-auto"
            >
              <SheetHeader>
                <SheetTitle>{t("common.filters", "Filters")}</SheetTitle>
                <SheetDescription>
                  {t(
                    "transactions.filterDescription",
                    "Refine your transaction list.",
                  )}
                </SheetDescription>
              </SheetHeader>
              <div className="p-4 space-y-4 flex flex-col">
                <FilterControls
                  filterType={filterType}
                  setFilterType={setFilterType}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  categories={categories}
                  filterTags={filterTags}
                  setFilterTags={setFilterTags}
                  tags={tags}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  fullWidth
                />
                {(search ||
                  filterType !== "all" ||
                  filterCategory !== "all" ||
                  filterTags.length > 0 ||
                  dateRange) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setFilterType("all");
                      setFilterCategory("all");
                      setFilterTags([]);
                      setDateRange(undefined);
                    }}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />{" "}
                    {t("common.clearFilters", "Clear filters")}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Filters */}
          <div className="hidden md:flex gap-2 items-center">
            <FilterControls
              filterType={filterType}
              setFilterType={setFilterType}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={categories}
              filterTags={filterTags}
              setFilterTags={setFilterTags}
              tags={tags}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
            {(search ||
              filterType !== "all" ||
              filterCategory !== "all" ||
              filterTags.length > 0 ||
              dateRange) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setFilterType("all");
                  setFilterCategory("all");
                  setFilterTags([]);
                  setDateRange(undefined);
                }}
                size="icon"
                title={t("common.clearFilters", "Clear filters")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Sheet
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCancel();
          } else {
            setIsFormOpen(true);
          }
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Edit Transaction" : t("transactions.addTitle")}
            </SheetTitle>
            <SheetDescription>
              {editingId
                ? "Update the details of your transaction."
                : "Add a new transaction to your records."}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("categories.typeLabel")}</Label>
                <RadioGroup
                  value={type}
                  onValueChange={(value) => {
                    setType(value as TransactionType);
                    setCategoryId("");
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income" className="cursor-pointer">
                      {t("categories.income")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense" className="cursor-pointer">
                      {t("categories.expense")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t("transactions.amountLabel")}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <NumericFormat
                    customInput={Input}
                    id="amount"
                    thousandSeparator=","
                    decimalScale={2}
                    placeholder="0.00"
                    className="pl-8"
                    value={amount}
                    onValueChange={(values) => {
                      setAmount(values.value);
                    }}
                    disabled={isFormDisabled}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  {t("transactions.categoryLabel")}
                </Label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue
                      placeholder={t("transactions.selectCategory")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.$id} value={cat.$id}>
                        {getLocalizedCategoryName(
                          cat,
                          i18n.resolvedLanguage || "en",
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("transactions.noCategories", {
                      type:
                        type === "income"
                          ? t("categories.income")
                          : t("categories.expense"),
                    })}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <MultiSelect
                  options={
                    tags?.map((tag) => ({
                      label: tag.name,
                      value: tag.$id,
                    })) || []
                  }
                  selected={selectedTags}
                  onChange={setSelectedTags}
                  onCreate={handleCreateTag}
                  placeholder="Select or create tags..."
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="date">{t("transactions.dateLabel")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      {date ? (
                        format(date, "PPP", { locale: currentLocale })
                      ) : (
                        <span>{t("transactions.dateLabel")}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={currentLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("transactions.descriptionLabel")}
                </Label>
                <Input
                  id="description"
                  placeholder="e.g. Lunch with friends"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full",
                  type === "income"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700",
                )}
                disabled={
                  createTransaction.isPending || updateTransaction.isPending
                }
              >
                {createTransaction.isPending || updateTransaction.isPending ? (
                  t("transactions.submitting")
                ) : (
                  <>
                    {editingId ? (
                      <Pencil className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {editingId
                      ? "Update Transaction"
                      : t("transactions.submit")}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={handleCancel}
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid gap-8 grid-cols-1">
        {/* Transactions List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("transactions.recentTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t("transactions.empty")}
                  </p>
                ) : (
                  Object.entries(
                    transactions?.reduce(
                      (groups, transaction) => {
                        const date = new Date(transaction.date)
                          .toISOString()
                          .split("T")[0];
                        if (!groups[date]) {
                          groups[date] = [];
                        }
                        groups[date].push(transaction);
                        return groups;
                      },
                      {} as Record<string, typeof transactions>,
                    ) || {},
                  )
                    .sort(
                      (a, b) =>
                        new Date(b[0]).getTime() - new Date(a[0]).getTime(),
                    )
                    .map(([date, dayTransactions]) => {
                      const dailyTotal = dayTransactions.reduce(
                        (sum, t) =>
                          sum + (t.type === "income" ? t.amount : -t.amount),
                        0,
                      );

                      return (
                        <div key={date} className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground bg-muted/30 p-2 rounded-md sticky top-0 backdrop-blur-sm z-10 flex justify-between items-center">
                            <span>
                              {new Date(date).toLocaleDateString(
                                i18n.resolvedLanguage,
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                            <span
                              className={cn(
                                dailyTotal >= 0
                                  ? "text-green-600"
                                  : "text-red-600",
                              )}
                            >
                              {dailyTotal > 0 ? "+" : ""}
                              {formatCurrency(dailyTotal)}
                            </span>
                          </h3>
                          <div className="space-y-2">
                            {dayTransactions.map((transaction) => {
                              const categoryId =
                                typeof transaction.category_id === "object"
                                  ? transaction.category_id.$id
                                  : transaction.category_id;
                              const category = categories?.find(
                                (c) => c.$id === categoryId,
                              );
                              const iconName = category?.icon as
                                | IconName
                                | undefined;

                              return (
                                <div
                                  key={transaction.$id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-4"
                                >
                                  <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div
                                      className={cn(
                                        "p-2 rounded-full",
                                        transaction.type === "income"
                                          ? "bg-green-100 text-green-600 dark:bg-green-900/20"
                                          : "bg-red-100 text-red-600 dark:bg-red-900/20",
                                      )}
                                    >
                                      {iconName ? (
                                        <Icon
                                          name={iconName}
                                          className="h-5 w-5"
                                        />
                                      ) : transaction.type === "income" ? (
                                        <DollarSign className="h-5 w-5" />
                                      ) : (
                                        <TagIcon className="h-5 w-5" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {getCategoryName(
                                          transaction.category_id,
                                        )}
                                      </p>
                                      {transaction.description && (
                                        <p className="text-sm text-muted-foreground">
                                          {transaction.description}
                                        </p>
                                      )}
                                      {transaction.tags &&
                                        transaction.tags.length > 0 && (
                                          <div className="flex gap-1 mt-1 flex-wrap">
                                            {transaction.tags.map((tag) => {
                                              const tagName =
                                                typeof tag === "object"
                                                  ? tag.name
                                                  : tags?.find(
                                                      (t) => t.$id === tag,
                                                    )?.name || "Unknown";
                                              return (
                                                <Badge
                                                  key={
                                                    typeof tag === "object"
                                                      ? tag.$id
                                                      : tag
                                                  }
                                                  variant="secondary"
                                                  className="text-[10px] px-1 py-0 h-5"
                                                >
                                                  {tagName}
                                                </Badge>
                                              );
                                            })}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                    <span
                                      className={cn(
                                        "font-bold",
                                        transaction.type === "income"
                                          ? "text-green-600"
                                          : "text-red-600",
                                      )}
                                    >
                                      {transaction.type === "income"
                                        ? "+"
                                        : "-"}
                                      {formatCurrency(transaction.amount)}
                                    </span>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                        onClick={() => handleEdit(transaction)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      {isOwnerOfActiveFamily && (
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                              disabled={
                                                deleteTransaction.isPending
                                              }
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent
                                            className="w-auto p-4"
                                            align="end"
                                          >
                                            <div className="flex flex-col gap-4">
                                              <p className="text-sm font-medium">
                                                {t(
                                                  "transactions.deleteConfirm",
                                                )}
                                              </p>
                                              <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                  handleDelete(transaction.$id)
                                                }
                                                className="w-full"
                                                disabled={
                                                  deleteTransaction.isPending
                                                }
                                              >
                                                <Trash2 className="mr-2 h-4 w-4" />{" "}
                                                Delete
                                              </Button>
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
