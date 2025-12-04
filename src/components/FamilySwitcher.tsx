import { useFamily } from "@/contexts/FamilyContext";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Settings, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function FamilySwitcher() {
  const { t } = useTranslation();
  const {
    families,
    activeFamilyId,
    setActiveFamilyId,
    isOwnerOfActiveFamily,
    isLoading,
  } = useFamily();

  if (isLoading && families.length === 0) {
    return <div className="h-9 w-full animate-pulse rounded-md bg-muted/60" />;
  }

  if (families.length === 0) {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-full justify-start"
      >
        <Link to="/settings/family">
          <Plus className="mr-2 h-4 w-4" />
          {t("families.createAction", "Create a Family")}
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={activeFamilyId ?? undefined}
        onValueChange={setActiveFamilyId}
      >
        <SelectTrigger className="h-9 flex-1">
          <div className="flex items-center gap-2 truncate">
            <SelectValue
              placeholder={t("families.selectPlaceholder", "Select family")}
            />
            {isOwnerOfActiveFamily && (
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {families.map((family) => (
            <SelectItem key={family.$id} value={family.$id}>
              {family.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        title={t("families.manageShort", "Manage Family")}
      >
        <Link to="/settings/family">
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Link>
      </Button>
    </div>
  );
}

export default FamilySwitcher;
