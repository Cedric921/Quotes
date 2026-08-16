"use client";

import { useLocale } from "@/contexts/LocaleContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  User as UserIcon,
  Crown,
  Calendar,
  Mail,
  ChevronRight,
} from "lucide-react";
import { UsersSkeleton } from "@/components/skeletons/UsersSkeleton";
import { useUsers } from "@/api/hooks";

export default function UsersPage() {
  const { t } = useLocale();
  const { data: users = [], isLoading, error } = useUsers();

  if (isLoading) {
    return <UsersSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
        {error instanceof Error ? error.message : "Failed to fetch users"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t.users.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.users.description}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {users.length} {users.length === 1 ? t.users.user : t.users.title}
        </Badge>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Link key={user.id} href={`/dashboard/users/${user.id}`}>
            <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg ${
                        user.isAdmin
                          ? "bg-gradient-to-br from-amber-500 to-orange-500"
                          : "bg-gradient-to-br from-blue-500 to-cyan-500"
                      }`}
                    >
                      {user.isAdmin ? (
                        <Crown className="w-5 h-5 text-white" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {user.email.split("@")[0]}
                      </CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {user.isAdmin && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      {t.users.admin}
                    </Badge>
                  )}
                  <Badge
                    variant={user.isSubscribed ? "default" : "secondary"}
                    className={
                      user.isSubscribed
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                        : ""
                    }
                  >
                    {user.isSubscribed ? t.users.premium : t.users.free}
                  </Badge>
                </div>

                {user.subscriptionEndDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Expires:{" "}
                      {new Date(user.subscriptionEndDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UserIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.users.noUsers}</h3>
          <p className="text-sm text-muted-foreground">
            {t.users.usersWillAppear}
          </p>
        </div>
      )}
    </div>
  );
}
