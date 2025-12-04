import type { PropsWithChildren } from "react";
import { useFamily } from "@/contexts/FamilyContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, Users } from "lucide-react";

export function FamilyGuard({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const { isLoading, families, activeFamilyId } = useFamily();

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm">
          {t("families.loading", "Loading family context…")}
        </p>
      </div>
    );
  }
  console.log("families", families);
  if (families.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <Users className="h-10 w-10 text-muted-foreground" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            {t("families.requiredTitle", "Create a family to get started")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(
              "families.requiredDescription",
              "Families let you share budgets, transactions, and categories with people you trust.",
            )}
          </p>
        </div>
        <Button asChild>
          <Link to="/settings/family">
            {t("families.createAction", "Create a Family")}
          </Link>
        </Button>
      </div>
    );
  }

  if (!activeFamilyId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <Users className="h-10 w-10 text-muted-foreground" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            {t("families.selectTitle", "Select a family")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(
              "families.selectDescription",
              "Choose which family you want to work with before continuing.",
            )}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/settings/family">
            {t("families.manageAction", "Manage families")}
          </Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export default FamilyGuard;
