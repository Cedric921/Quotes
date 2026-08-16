"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function UserDetailSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-muted rounded-lg" />
          <div>
            <div className="h-8 w-48 bg-muted rounded-lg mb-2" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>
        <div className="h-10 w-28 bg-muted rounded-lg" />
      </div>

      {/* User Identity Card Skeleton */}
      <Card className="border-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-muted/30 rounded-bl-full" />
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 w-20 bg-muted rounded-full" />
                <div className="h-6 w-16 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg" />
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-2 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-muted/30 rounded-full blur-2xl" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="w-10 h-10 bg-muted rounded-lg" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-9 w-28 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment History Skeleton */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription History Skeleton */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

