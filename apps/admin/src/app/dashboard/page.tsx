"use client";

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
  TrendingUp,
  Sparkles,
  DollarSign,
  CreditCard,
  UserCheck,
  UserX,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Cloud,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
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
import {
  useDashboardStats,
  useSubscriptionStats,
  useHealthStatus,
} from "@/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { statsKeys } from "@/api/hooks/useStats";

export default function DashboardPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();

  // React Query hooks
  const {
    data: stats = { users: 0, topics: 0, quotes: 0 },
    isLoading: isLoadingStats,
  } = useDashboardStats();
  const { data: subscriptionStats, isLoading: isLoadingSubStats } =
    useSubscriptionStats();
  const { data: healthStatus, isLoading: isLoadingHealth } = useHealthStatus();

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
                    `€${(subscriptionStats?.totalRevenue ?? 0).toFixed(2)}`
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
                    `€${(subscriptionStats?.monthlyRevenue ?? 0).toFixed(2)}`
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
                      {(subscriptionStats?.revenueGrowth ?? 0) >= 0 ? (
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                      )}
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
              ) : !subscriptionStats ||
                subscriptionStats.recentTransactions?.length === 0 ? (
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
                    {subscriptionStats?.recentTransactions?.map(
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
                            €{(Number(transaction?.amount) || 0).toFixed(2)}
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

          {/* Stripe Partnership Card - Dynamic */}
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
                {/* Refresh button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    queryClient.invalidateQueries({
                      queryKey: statsKeys.health(),
                    });
                  }}
                  disabled={isLoadingHealth}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoadingHealth ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingHealth ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Connection Status */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
                    <span className="text-sm font-medium">
                      {t.dashboard.stripe.status}
                    </span>
                    <Badge
                      className={
                        healthStatus?.services.stripe.status === "connected"
                          ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                          : healthStatus?.services.stripe.status ===
                              "not_configured"
                            ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                            : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                      }
                    >
                      {healthStatus?.services.stripe.status === "connected"
                        ? t.dashboard.stripe.connected
                        : healthStatus?.services.stripe.status ===
                            "not_configured"
                          ? t.dashboard.stripe.notConfigured || "Non configuré"
                          : t.dashboard.stripe.disconnected || "Déconnecté"}
                    </Badge>
                  </div>

                  {/* API Key Status */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
                    <span className="text-sm font-medium">
                      {t.dashboard.stripe.apiKey}
                    </span>
                    {healthStatus?.services.stripe.apiKeyConfigured ? (
                      <span className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {healthStatus.services.stripe.mode === "live"
                          ? "sk_live_****"
                          : "sk_test_****"}
                      </span>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs text-yellow-600"
                      >
                        {t.dashboard.stripe.notConfigured || "Non configuré"}
                      </Badge>
                    )}
                  </div>

                  {/* Webhook Status */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
                    <span className="text-sm font-medium">
                      {t.dashboard.stripe.webhook}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        healthStatus?.services.stripe.webhookConfigured
                          ? "bg-green-500/10 text-green-700"
                          : "bg-yellow-500/10 text-yellow-700"
                      }`}
                    >
                      {healthStatus?.services.stripe.webhookConfigured
                        ? t.dashboard.stripe.webhookConfigured
                        : t.dashboard.stripe.webhookNotConfigured ||
                          "Non configuré"}
                    </Badge>
                  </div>

                  {/* Mode */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
                    <span className="text-sm font-medium">
                      {t.dashboard.stripe.mode}
                    </span>
                    <Badge
                      className={`text-xs ${
                        healthStatus?.services.stripe.mode === "live"
                          ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {healthStatus?.services.stripe.mode === "live"
                        ? t.dashboard.stripe.live || "Production"
                        : t.dashboard.stripe.test}
                    </Badge>
                  </div>

                  {/* Latency (if connected) */}
                  {healthStatus?.services.stripe.latency && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
                      <span className="text-sm font-medium">
                        {t.dashboard.stripe.latency || "Latence"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {healthStatus.services.stripe.latency}ms
                      </span>
                    </div>
                  )}
                </div>
              )}

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

      {/* Services Status Card */}
      <Card className="border-2 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Server className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle>
                  {t.dashboard.services?.title || "État des Services"}
                </CardTitle>
                <CardDescription>
                  {t.dashboard.services?.description ||
                    "Vérifiez la connectivité de vos services"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Global Status Badge */}
              {healthStatus && (
                <Badge
                  className={`${
                    healthStatus.status === "healthy"
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                      : healthStatus.status === "degraded"
                        ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                        : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                  }`}
                >
                  {healthStatus.status === "healthy"
                    ? t.dashboard.services?.healthy || "Opérationnel"
                    : healthStatus.status === "degraded"
                      ? t.dashboard.services?.degraded || "Dégradé"
                      : t.dashboard.services?.unhealthy || "Hors service"}
                </Badge>
              )}
              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries({
                    queryKey: statsKeys.health(),
                  });
                }}
                disabled={isLoadingHealth}
                className="h-8 w-8 p-0"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoadingHealth ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHealth ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Database Status */}
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      healthStatus?.services.database.status === "connected"
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    <Database
                      className={`w-5 h-5 ${
                        healthStatus?.services.database.status === "connected"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {t.dashboard.services?.database || "Base de données"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {healthStatus?.services.database.type === "postgres"
                        ? healthStatus?.services.database.provider ===
                          "supabase"
                          ? "Supabase (PostgreSQL)"
                          : "PostgreSQL"
                        : "SQLite"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {healthStatus?.services.database.status === "connected" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        healthStatus?.services.database.status === "connected"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {healthStatus?.services.database.status === "connected"
                        ? t.dashboard.services?.connected || "Connecté"
                        : t.dashboard.services?.disconnected || "Déconnecté"}
                    </span>
                  </div>
                  {healthStatus?.services.database.latency && (
                    <span className="text-xs text-muted-foreground">
                      {healthStatus.services.database.latency}ms
                    </span>
                  )}
                </div>
              </div>

              {/* Stripe Status */}
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      healthStatus?.services.stripe.status === "connected"
                        ? "bg-green-500/10"
                        : healthStatus?.services.stripe.status ===
                            "not_configured"
                          ? "bg-yellow-500/10"
                          : "bg-red-500/10"
                    }`}
                  >
                    <CreditCard
                      className={`w-5 h-5 ${
                        healthStatus?.services.stripe.status === "connected"
                          ? "text-green-500"
                          : healthStatus?.services.stripe.status ===
                              "not_configured"
                            ? "text-yellow-500"
                            : "text-red-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Stripe</p>
                    <p className="text-xs text-muted-foreground">
                      {healthStatus?.services.stripe.mode === "live"
                        ? "Production"
                        : "Test"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {healthStatus?.services.stripe.status === "connected" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : healthStatus?.services.stripe.status ===
                      "not_configured" ? (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        healthStatus?.services.stripe.status === "connected"
                          ? "text-green-600"
                          : healthStatus?.services.stripe.status ===
                              "not_configured"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {healthStatus?.services.stripe.status === "connected"
                        ? t.dashboard.services?.connected || "Connecté"
                        : healthStatus?.services.stripe.status ===
                            "not_configured"
                          ? t.dashboard.services?.notConfigured ||
                            "Non configuré"
                          : t.dashboard.services?.disconnected || "Déconnecté"}
                    </span>
                  </div>
                  {healthStatus?.services.stripe.latency && (
                    <span className="text-xs text-muted-foreground">
                      {healthStatus.services.stripe.latency}ms
                    </span>
                  )}
                </div>
              </div>

              {/* Cloudinary Status */}
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      healthStatus?.services.cloudinary.status === "connected"
                        ? "bg-green-500/10"
                        : healthStatus?.services.cloudinary.status ===
                            "not_configured"
                          ? "bg-yellow-500/10"
                          : "bg-red-500/10"
                    }`}
                  >
                    <Cloud
                      className={`w-5 h-5 ${
                        healthStatus?.services.cloudinary.status === "connected"
                          ? "text-green-500"
                          : healthStatus?.services.cloudinary.status ===
                              "not_configured"
                            ? "text-yellow-500"
                            : "text-red-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {t.dashboard.services?.cloudinary || "Cloudinary"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Media Storage
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {healthStatus?.services.cloudinary.status ===
                    "connected" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : healthStatus?.services.cloudinary.status ===
                      "not_configured" ? (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        healthStatus?.services.cloudinary.status === "connected"
                          ? "text-green-600"
                          : healthStatus?.services.cloudinary.status ===
                              "not_configured"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {healthStatus?.services.cloudinary.status === "connected"
                        ? t.dashboard.services?.connected || "Connecté"
                        : healthStatus?.services.cloudinary.status ===
                            "not_configured"
                          ? t.dashboard.services?.notConfigured ||
                            "Non configuré"
                          : t.dashboard.services?.disconnected || "Déconnecté"}
                    </span>
                  </div>
                  {healthStatus?.services.cloudinary.latency && (
                    <span className="text-xs text-muted-foreground">
                      {healthStatus.services.cloudinary.latency}ms
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
