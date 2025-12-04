import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  LayoutDashboard,
  Tags,
  LogOut,
  ArrowRightLeft,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    {
      href: "/transactions",
      label: t("nav.transactions"),
      icon: ArrowRightLeft,
    },
    { href: "/budgets", label: t("nav.budgets"), icon: PieChart },
    { href: "/categories", label: t("nav.categories"), icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent"
            >
              {t("app.name")}
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="hidden sm:inline-block text-sm text-muted-foreground">
              {user?.name}
            </span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              title={t("app.logout")}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
