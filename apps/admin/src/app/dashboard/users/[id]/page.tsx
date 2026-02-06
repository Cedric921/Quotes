"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionEndDate: string | null;
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get<User>(`/users/${userId}`);
        setUser(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch user");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (isLoading) {
    return <div>Loading user details...</div>;
  }

  if (error || !user) {
    return <div className="text-destructive">{error || "User not found"}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Details</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>User information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Role:</span> {user.isAdmin ? "Admin" : "User"}
            </div>
            <div>
              <span className="font-medium">User ID:</span> {user.id}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Subscription information and payment history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Status:</span>{" "}
              <span className={user.isSubscribed ? "text-green-600" : "text-muted-foreground"}>
                {user.isSubscribed ? "Active" : "Inactive"}
              </span>
            </div>
            {user.subscriptionEndDate && (
              <div>
                <span className="font-medium">End Date:</span>{" "}
                {new Date(user.subscriptionEndDate).toLocaleDateString()}
              </div>
            )}
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Payment history feature coming soon...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
