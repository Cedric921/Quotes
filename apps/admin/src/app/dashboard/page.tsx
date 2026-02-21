"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/auth";
import { seedDatabase } from "@/lib/data";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  FileText,
  Database,
  TrendingUp,
  Sparkles,
  DollarSign,
  CreditCard,
  UserCheck,
  UserX,
  Receipt,
  ArrowUpRight,
  Calendar,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Stats {
  users: number;
  topics: number;
  quotes: number;
}

interface SubscriptionStats {
  totalRevenue: number;
  monthlyRevenue: number;
  premiumUsers: number;
  freeUsers: number;
  totalUsers: number;
  premiumPercentage: number;
  revenueGrowth: number;
  recentTransactions: Array<{
    id: string;
    userName: string;
    userEmail: string;
    planName: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const { t } = useLocale();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string>("");
  const [stats, setStats] = useState<Stats>({ users: 0, topics: 0, quotes: 0 });
  const [subscriptionStats, setSubscriptionStats] =
    useState<SubscriptionStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingSubStats, setIsLoadingSubStats] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchSubscriptionStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, topicsRes, quotesRes] = await Promise.all([
        apiClient.get("/users"),
        apiClient.get("/topics"),
        apiClient.get("/quotes"),
      ]);
      setStats({
        users: usersRes.data.length,
        topics: topicsRes.data.length,
        quotes: quotesRes.data.length,
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchSubscriptionStats = async () => {
    try {
      const res = await apiClient.get("/subscriptions/stats");
      setSubscriptionStats(res.data);
    } catch (error) {
      console.error("Failed to fetch subscription stats", error);
    } finally {
      setIsLoadingSubStats(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult("");

    try {
      const result = await seedDatabase(apiClient);
      if (result.success) {
        setSeedResult(t.dashboard.seedSuccess);
        fetchStats(); // Refresh stats after seeding
      } else {
        setSeedResult(t.dashboard.seedError);
      }
    } catch (error) {
      setSeedResult(t.dashboard.seedErrorDetails);
    } finally {
      setIsSeeding(false);
    }
  };

  const statCards = [
    {
      title: t.dashboard.totalUsers,
      value: stats.users,
      icon: Users,
      description: t.dashboard.registeredUsers,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      title: t.nav.topics,
      value: stats.topics,
      icon: BookOpen,
      description: t.dashboard.quoteCategories,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
    },
    {
      title: t.nav.quotes,
      value: stats.quotes,
      icon: FileText,
      description: t.dashboard.inspirationalQuotes,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/10 to-red-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t.dashboard.title}
          </h1>
          <p className="text-muted-foreground mt-2">{t.dashboard.welcome}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {t.dashboard.adminPanel}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br ${stat.bgGradient}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm font-medium">
                    {stat.title}
                  </CardDescription>
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {isLoadingStats ? (
                      <div className="h-9 w-16 bg-muted animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.description}
                  </p>
                </div>
              </CardContent>
              {/* Decorative gradient */}
              <div
                className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl`}
              />
            </Card>
          );
        })}
      </div>

      {/* Financial Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t.dashboard.financesTitle}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t.dashboard.financesDescription}
            </p>
          </div>
        </div>

        {/* Financial Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  {t.dashboard.stats.totalRevenue}
                </CardDescription>
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold">
                  {isLoadingSubStats ? (
                    <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                  ) : (
                    `€${subscriptionStats?.totalRevenue.toFixed(2) ?? "0.00"}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.dashboard.stats.allTime}
                </p>
              </div>
            </CardContent>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 rounded-full blur-2xl" />
          </Card>

          {/* Monthly Revenue Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  {t.dashboard.stats.monthlyRevenue}
                </CardDescription>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {isLoadingSubStats ? (
                    <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                  ) : (
                    `€${subscriptionStats?.monthlyRevenue.toFixed(2) ?? "0.00"}`
                  )}
                </div>
                {!isLoadingSubStats && (
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${
                        (subscriptionStats?.revenueGrowth ?? 0) >= 0
                          ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                      } text-xs`}
                    >
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {(subscriptionStats?.revenueGrowth ?? 0) >= 0 ? "+" : ""}
                      {subscriptionStats?.revenueGrowth ?? 0}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t.dashboard.stats.vsLastMonth}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10 rounded-full blur-2xl" />
          </Card>

          {/* Premium Users Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  {t.dashboard.stats.premiumUsers}
                </CardDescription>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold">
                  {isLoadingSubStats ? (
                    <div className="h-9 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    (subscriptionStats?.premiumUsers ?? 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscriptionStats?.premiumPercentage ?? 0}%{" "}
                  {t.dashboard.stats.ofTotal}
                </p>
              </div>
            </CardContent>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 rounded-full blur-2xl" />
          </Card>

          {/* Free Users Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-500/10 to-gray-500/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  {t.dashboard.stats.freeUsers}
                </CardDescription>
                <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-gray-500">
                  <UserX className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold">
                  {isLoadingSubStats ? (
                    <div className="h-9 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    (subscriptionStats?.freeUsers ?? 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscriptionStats
                    ? 100 - subscriptionStats.premiumPercentage
                    : 0}
                  % {t.dashboard.stats.ofTotal}
                </p>
              </div>
            </CardContent>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-slate-500 to-gray-500 opacity-10 rounded-full blur-2xl" />
          </Card>
        </div>

        {/* Recent Transactions & Stripe Partnership */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions Table */}
          <Card className="lg:col-span-2 border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>{t.dashboard.transactions.title}</CardTitle>
                  <CardDescription>
                    {t.dashboard.transactions.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSubStats ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-muted animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : subscriptionStats?.recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t.dashboard.transactions.noTransactions ||
                    "Aucune transaction"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.dashboard.transactions.user}</TableHead>
                      <TableHead>{t.dashboard.transactions.plan}</TableHead>
                      <TableHead>{t.dashboard.transactions.amount}</TableHead>
                      <TableHead>{t.dashboard.transactions.date}</TableHead>
                      <TableHead>{t.dashboard.transactions.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionStats?.recentTransactions.map(
                      (transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.userName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {transaction.planName}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            €{transaction.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                transaction.status === "SUCCEEDED"
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                                  : transaction.status === "PENDING"
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                              }
                            >
                              {transaction.status === "SUCCEEDED"
                                ? t.dashboard.transactions.success
                                : transaction.status === "PENDING"
                                  ? t.dashboard.transactions.pending
                                  : t.dashboard.transactions.failed}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Stripe Partnership Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-indigo-500/5 to-purple-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {t.dashboard.stripe.title}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
                  <span className="text-sm font-medium">
                    {t.dashboard.stripe.status}
                  </span>
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                    {t.dashboard.stripe.connected || "Connecté"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
                  <span className="text-sm font-medium">
                    {t.dashboard.stripe.apiKey}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    sk_****_***********
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
                  <span className="text-sm font-medium">
                    {t.dashboard.stripe.webhook}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {t.dashboard.stripe.webhookConfigured}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
                  <span className="text-sm font-medium">
                    {t.dashboard.stripe.mode}
                  </span>
                  <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs">
                    {t.dashboard.stripe.test}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  {t.dashboard.stripe.securePayment}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="border-2 bg-gradient-to-br from-card to-muted/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {t.dashboard.welcomeTitle}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {t.dashboard.welcomeDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t.dashboard.welcomeText}
          </p>
        </CardContent>
      </Card>

      {/* Database Seeding Card */}
      <Card className="border-2 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Database className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <CardTitle>{t.dashboard.seedingTitle}</CardTitle>
              <CardDescription>
                {t.dashboard.seedingDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t.dashboard.seedingText}
          </p>
          <Button onClick={handleSeed} disabled={isSeeding} className="gap-2">
            <Database className="w-4 h-4" />
            {isSeeding ? t.dashboard.seeding : t.dashboard.seedDatabase}
          </Button>
          {seedResult && (
            <div
              className={`mt-4 p-4 rounded-lg border-2 ${
                seedResult.includes("✅")
                  ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
              }`}
            >
              <p className="text-sm font-medium">{seedResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
