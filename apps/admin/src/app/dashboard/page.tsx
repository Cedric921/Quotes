"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/auth";
import { seedDatabase } from "@/lib/data";
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
  ArrowDownRight,
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

export default function DashboardPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string>("");
  const [stats, setStats] = useState<Stats>({ users: 0, topics: 0, quotes: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
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

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult("");

    try {
      const result = await seedDatabase(apiClient);
      if (result.success) {
        setSeedResult(
          "✅ Database seeded successfully! Check the Topics and Quotes pages.",
        );
        fetchStats(); // Refresh stats after seeding
      } else {
        setSeedResult("❌ Failed to seed database. Check console for errors.");
      }
    } catch (error) {
      setSeedResult("❌ Error during seeding. Check console for details.");
    } finally {
      setIsSeeding(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.users,
      icon: Users,
      description: "Registered users",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      title: "Topics",
      value: stats.topics,
      icon: BookOpen,
      description: "Quote categories",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
    },
    {
      title: "Quotes",
      value: stats.quotes,
      icon: FileText,
      description: "Inspirational quotes",
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
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's an overview of your content.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Admin Panel</span>
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
              Finances & Subscriptions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Revenue tracking and subscription analytics
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1.5 text-sm">
            Bientôt
          </Badge>
        </div>

        {/* Financial Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  Revenus Totaux
                </CardDescription>
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold blur-[2px] select-none">
                  $12,450
                </div>
                <p className="text-xs text-muted-foreground">Tous les temps</p>
              </div>
            </CardContent>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 rounded-full blur-2xl" />
          </Card>

          {/* Monthly Revenue Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  Revenus du Mois
                </CardDescription>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold blur-[2px] select-none">
                  $2,340
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs blur-[1px] select-none">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +12.5%
                  </Badge>
                  <span className="text-xs text-muted-foreground blur-[1px] select-none">
                    vs mois dernier
                  </span>
                </div>
              </div>
            </CardContent>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10 rounded-full blur-2xl" />
          </Card>

          {/* Premium Users Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  Utilisateurs Premium
                </CardDescription>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold blur-[2px] select-none">
                  156
                </div>
                <p className="text-xs text-muted-foreground blur-[1px] select-none">
                  68% du total
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
                  Utilisateurs Gratuits
                </CardDescription>
                <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-gray-500">
                  <UserX className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold blur-[2px] select-none">
                  73
                </div>
                <p className="text-xs text-muted-foreground blur-[1px] select-none">
                  32% du total
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Dernières Transactions</CardTitle>
                    <CardDescription>
                      Historique des paiements récents
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  Bientôt
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      user: "John Doe",
                      plan: "Premium",
                      amount: "$9.99",
                      date: "2024-01-15",
                      status: "success",
                    },
                    {
                      user: "Jane Smith",
                      plan: "Premium",
                      amount: "$9.99",
                      date: "2024-01-14",
                      status: "success",
                    },
                    {
                      user: "Bob Johnson",
                      plan: "Premium",
                      amount: "$9.99",
                      date: "2024-01-13",
                      status: "pending",
                    },
                    {
                      user: "Alice Brown",
                      plan: "Premium",
                      amount: "$9.99",
                      date: "2024-01-12",
                      status: "success",
                    },
                    {
                      user: "Charlie Wilson",
                      plan: "Premium",
                      amount: "$9.99",
                      date: "2024-01-11",
                      status: "failed",
                    },
                  ].map((transaction, index) => (
                    <TableRow key={index} className="blur-[1.5px] select-none">
                      <TableCell className="font-medium">
                        {transaction.user}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {transaction.amount}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {transaction.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            transaction.status === "success"
                              ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                              : transaction.status === "pending"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                          }
                        >
                          {transaction.status === "success"
                            ? "Réussi"
                            : transaction.status === "pending"
                              ? "En cours"
                              : "Échoué"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      Partenariat Stripe
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
                  <span className="text-sm font-medium">Statut</span>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    Bientôt
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-card border blur-[1.5px] select-none">
                  <span className="text-sm font-medium">API Key</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    sk_test_***********
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-card border blur-[1.5px] select-none">
                  <span className="text-sm font-medium">Webhook</span>
                  <Badge variant="secondary" className="text-xs">
                    Configuré
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-card border blur-[1.5px] select-none">
                  <span className="text-sm font-medium">Mode</span>
                  <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs">
                    Test
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Intégration de paiement sécurisée
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
                Welcome to Quotes Admin Panel
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Manage users, topics, and quotes from the sidebar navigation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a section from the sidebar to get started. You can manage
            users, organize topics, and curate inspirational quotes.
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
              <CardTitle>Database Seeding</CardTitle>
              <CardDescription>
                Populate the database with test data (users, topics, and quotes)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to seed the database with sample data for
            testing. This will create users, topics, and quotes.
          </p>
          <Button onClick={handleSeed} disabled={isSeeding} className="gap-2">
            <Database className="w-4 h-4" />
            {isSeeding ? "Seeding..." : "Seed Database"}
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
