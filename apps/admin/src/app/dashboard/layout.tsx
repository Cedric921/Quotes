"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, logout } from "@/lib/auth";
import { useLocale } from "@/contexts/LocaleContext";
import {
  LogOut,
  Users,
  FileText,
  BookOpen,
  LayoutDashboard,
  Sparkles,
  AlertTriangle,
  Settings,
  CreditCard,
  Image,
  Type,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    const toastId = toast.loading(t.auth.signingOut);

    try {
      logout();
      toast.success(t.auth.signedOut, { id: toastId });
      setLogoutDialogOpen(false);
      router.push("/login");
    } catch (error) {
      toast.error(t.auth.signOutFailed, { id: toastId });
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t.nav.dashboard },
    { href: "/dashboard/users", icon: Users, label: t.nav.users },
    { href: "/dashboard/topics", icon: BookOpen, label: t.nav.topics },
    { href: "/dashboard/quotes", icon: FileText, label: t.nav.quotes },
    {
      href: "/dashboard/themes",
      icon: Image,
      label: t.nav.themes || "Thèmes",
    },
    {
      href: "/dashboard/fonts",
      icon: Type,
      label: t.nav.fonts || "Polices",
    },
    {
      href: "/dashboard/subscriptions",
      icon: Settings,
      label: t.nav.subscriptions || "Subscriptions",
    },
    {
      href: "/dashboard/payments",
      icon: CreditCard,
      label: t.nav.payments || "Payments",
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card/95 backdrop-blur-sm border-r border-border/50 flex flex-col shadow-lg">
        {/* Logo Section */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t.app.name}
              </h1>
              <p className="text-xs text-muted-foreground">{t.app.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive && "text-primary-foreground",
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme, Language & Logout */}
        <div className="p-4 border-t border-border/50 space-y-3">
          {/* Theme & Language Toggle */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground">
              Settings
            </span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full justify-start hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all group"
            onClick={handleLogoutClick}
          >
            <LogOut className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            {t.auth.logout}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-8">{children}</div>
      </main>

      {/* Toast Notifications */}
      <Toaster />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="border-2 border-destructive/20">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <AlertDialogTitle className="text-xl">
                {t.auth.signOut}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              {t.auth.logoutConfirm} {t.auth.logoutDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t.auth.signOut}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
