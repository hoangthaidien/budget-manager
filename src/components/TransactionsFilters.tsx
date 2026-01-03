import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { Calendar as CalendarIcon, Filter, Search, X } from "lucide-react";

import type { Category, Tag, TransactionType } from "@/types";
import { cn } from "@/lib/utils";
import { getCategoryName as getLocalizedCategoryName } from "@/lib/i18n-utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { MultiSelect } from "@/components/ui/multi-select";

type RequiredDateRange = { from: Date; to: Date };

interface FilterControlsProps {
  filterType: TransactionType | "all";
  setFilterType: (value: TransactionType | "all") => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  categories: Category[] | undefined;
  filterTags: string[];
  setFilterTags: (value: string[]) => void;
  tags: Tag[] | undefined;
  dateRange: RequiredDateRange;
  setDateRange: (value: RequiredDateRange) => void;
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
          <SelectItem value="all">{t("common.allTypes", "All Types")}</SelectItem>
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
            selected={dateRange as DateRange}
            onSelect={(range) => {
              if (!range?.from) return;
              setDateRange({
                from: range.from,
                to: range.to ?? range.from,
              });
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}

export interface TransactionsFiltersProps {
  search: string;
  setSearch: (value: string) => void;

  filterType: TransactionType | "all";
  setFilterType: (value: TransactionType | "all") => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterTags: string[];
  setFilterTags: (value: string[]) => void;
  dateRange: RequiredDateRange;
  setDateRange: (value: RequiredDateRange) => void;

  categories: Category[] | undefined;
  tags: Tag[] | undefined;

  onApply: () => void;
  onClear: () => void;
}

export function TransactionsFilters({
  search,
  setSearch,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  filterTags,
  setFilterTags,
  dateRange,
  setDateRange,
  categories,
  tags,
  onApply,
  onClear,
}: TransactionsFiltersProps) {
  const { t } = useTranslation();

  const hasAnyDraftFilter =
    Boolean(search) ||
    filterType !== "all" ||
    filterCategory !== "all" ||
    filterTags.length > 0;

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search Row */}
      <div className="flex gap-2 items-center">
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

        <Button onClick={onApply} className="shrink-0">
          <Search className="mr-2 h-4 w-4" />
          {t("common.search", "Search")}
        </Button>

        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden shrink-0">
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

              <Button onClick={onApply} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                {t("common.search", "Search")}
              </Button>

              {hasAnyDraftFilter && (
                <Button variant="outline" onClick={onClear} className="w-full">
                  <X className="mr-2 h-4 w-4" />{" "}
                  {t("common.clearFilters", "Clear filters")}
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters Row (wraps) */}
      <div className="hidden md:flex flex-wrap gap-2 items-center justify-end">
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
        {hasAnyDraftFilter && (
          <Button
            variant="ghost"
            onClick={onClear}
            size="icon"
            title={t("common.clearFilters", "Clear filters")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
