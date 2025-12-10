import { type FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import {
  useCreateFamily,
  useAddFamilyMember,
  useRemoveFamilyMember,
  useFamilyMembers,
} from "@/hooks/useFamilies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, Trash2, UserPlus, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function FamilySettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    families,
    activeFamily,
    activeFamilyId,
    setActiveFamilyId,
    isOwnerOfActiveFamily,
    refreshFamilies,
  } = useFamily();

  const { data: members = [], isLoading: isLoadingMembers } = useFamilyMembers(
    activeFamilyId ?? undefined,
  );

  const createFamily = useCreateFamily();
  const addMember = useAddFamilyMember();
  const removeMember = useRemoveFamilyMember(activeFamilyId ?? undefined);

  const [familyName, setFamilyName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [memberId, setMemberId] = useState("");
  const [isCreateFamilyOpen, setIsCreateFamilyOpen] = useState(false);

  const currentOwnerId = useMemo(
    () => activeFamily?.owner_id ?? null,
    [activeFamily],
  );

  if (!user) {
    return null;
  }

  const handleCreateFamily = async (event: FormEvent) => {
    event.preventDefault();
    if (!familyName.trim()) return;

    await createFamily.mutateAsync({
      name: familyName.trim(),
      currency,
      owner_id: user.$id,
    });

    setFamilyName("");
    setIsCreateFamilyOpen(false);
    await refreshFamilies();
  };

  const handleAddMember = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeFamilyId || !memberId.trim()) return;

    await addMember.mutateAsync({
      family_id: activeFamilyId,
      user_id: memberId.trim(),
    });

    setMemberId("");
  };

  const handleRemoveMember = async (memberIdToRemove: string) => {
    await removeMember.mutateAsync({
      memberId: memberIdToRemove,
      userId: memberIdToRemove,
    });
  };

  const isMemberListEmpty = !isLoadingMembers && members.length === 0;
  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {t("families.settingsTitle", "Family settings")}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {t(
              "families.settingsDescription",
              "Create families to share budgets, categories, and transactions. Manage which members can collaborate with you.",
            )}
          </p>
        </div>
        <Button onClick={() => setIsCreateFamilyOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("families.createTitle", "Create a new family")}
        </Button>
      </header>

      <Sheet open={isCreateFamilyOpen} onOpenChange={setIsCreateFamilyOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {t("families.createTitle", "Create a new family")}
            </SheetTitle>
            <SheetDescription>
              {t(
                "families.createDescription",
                "Add a new family workspace to manage finances together.",
              )}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 py-6">
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="family-name">
                  {t("families.nameLabel", "Family name")}
                </Label>
                <Input
                  id="family-name"
                  placeholder={t(
                    "families.namePlaceholder",
                    "e.g. Nguyen household",
                  )}
                  value={familyName}
                  onChange={(event) => setFamilyName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family-currency">
                  {t("families.currencyLabel", "Default currency (ISO code)")}
                </Label>
                <Input
                  id="family-currency"
                  value={currency}
                  onChange={(event) =>
                    setCurrency(event.target.value.toUpperCase())
                  }
                  maxLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createFamily.isPending}
              >
                {createFamily.isPending
                  ? t("families.creating", "Creating…")
                  : t("families.createAction", "Create family")}
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>
                {t("families.currentTitle", "Your families")}
              </CardTitle>
              <Badge variant="secondary">{families.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t(
                "families.currentSubtitle",
                "Select the family you want to manage below.",
              )}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {families.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("families.none", "You haven’t created any families yet.")}
              </p>
            ) : (
              <div className="space-y-3">
                {families.map((family) => {
                  const isSelected = family.$id === activeFamilyId;
                  return (
                    <button
                      key={family.$id}
                      type="button"
                      onClick={() => setActiveFamilyId(family.$id)}
                      className={cn(
                        "w-full rounded-lg border p-4 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{family.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("families.currencyLabel", "Default currency")}:{" "}
                            {family.currency ?? "—"}
                          </p>
                        </div>
                        {family.owner_id === user.$id && (
                          <Badge className="gap-1" variant="secondary">
                            <Crown className="h-3 w-3" />
                            {t("families.ownerBadge", "Owner")}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="h-px w-full bg-border" />

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>
              {t("families.membersTitle", "Family members")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {activeFamily
                ? t(
                    "families.membersSubtitle",
                    "Invite members using their user ID. Members inherit edit access for transactions, budgets, and categories.",
                  )
                : t(
                    "families.selectFamilyPrompt",
                    "Select a family to manage members.",
                  )}
            </p>
          </div>
          {activeFamily && (
            <Badge variant="outline">
              {t("families.activeLabel", "Managing")} {activeFamily.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {activeFamily && (
            <form
              onSubmit={handleAddMember}
              className="space-y-3 rounded-lg border p-4"
            >
              <div className="space-y-2">
                <Label htmlFor="member-id">
                  {t("families.memberIdLabel", "Appwrite user ID to invite")}
                </Label>
                <Input
                  id="member-id"
                  placeholder={t(
                    "families.memberIdPlaceholder",
                    "e.g. 64a0c9d1e8b1",
                  )}
                  value={memberId}
                  onChange={(event) => setMemberId(event.target.value)}
                  disabled={!isOwnerOfActiveFamily}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={!isOwnerOfActiveFamily || addMember.isPending}
                className="w-full sm:w-auto"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {addMember.isPending
                  ? t("families.inviting", "Inviting…")
                  : t("families.inviteAction", "Invite member")}
              </Button>
              {!isOwnerOfActiveFamily && (
                <p className="text-xs text-muted-foreground">
                  {t(
                    "families.onlyOwnerCanInvite",
                    "Only the family owner can invite or remove members.",
                  )}
                </p>
              )}
            </form>
          )}

          {activeFamily ? (
            <div className="space-y-3">
              {isLoadingMembers ? (
                <p className="text-sm text-muted-foreground">
                  {t("families.loadingMembers", "Loading members…")}
                </p>
              ) : isMemberListEmpty ? (
                <p className="text-sm text-muted-foreground">
                  {t(
                    "families.noMembers",
                    "No members found for this family yet.",
                  )}
                </p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {members.map((member) => {
                    const isOwner = member.user_id === currentOwnerId;
                    return (
                      <div
                        key={member.$id}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm sm:flex-nowrap"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{member.user_id}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("families.joinedLabel", "Joined")}:{" "}
                            {new Date(member.$createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOwner && (
                            <Badge variant="secondary" className="gap-1">
                              <Crown className="h-3 w-3" />
                              {t("families.ownerBadge", "Owner")}
                            </Badge>
                          )}
                          {!isOwner && isOwnerOfActiveFamily && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive/80"
                              onClick={() => handleRemoveMember(member.$id)}
                              disabled={removeMember.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t(
                "families.selectFamilyPrompt",
                "Select a family to manage members.",
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
