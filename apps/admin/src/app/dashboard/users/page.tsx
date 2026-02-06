"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionEndDate: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get<User[]>("/users");
        setUsers(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users Management</h1>
      
      <div className="grid gap-4">
        {users.map((user) => (
          <Link key={user.id} href={`/dashboard/users/${user.id}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>{user.email}</CardTitle>
                <CardDescription>
                  {user.isAdmin ? "Admin" : "User"} • 
                  {user.isSubscribed ? " Subscribed" : " Free"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {user.subscriptionEndDate && (
                    <p>Subscription ends: {new Date(user.subscriptionEndDate).toLocaleDateString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
