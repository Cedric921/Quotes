import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function UsersSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <div className="h-9 w-64 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Users Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            className="border-2 relative overflow-hidden animate-pulse"
          >
            {/* Decorative gradient skeleton */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-muted/50 rounded-bl-full" />

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Icon skeleton */}
                  <div className="w-12 h-12 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    {/* Email skeleton */}
                    <div className="h-5 w-40 bg-muted rounded" />
                    {/* ID skeleton */}
                    <div className="h-3 w-16 bg-muted rounded" />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Badges skeleton */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="h-6 w-20 bg-muted rounded-full" />
                <div className="h-6 w-24 bg-muted rounded-full" />
              </div>

              {/* Subscription info skeleton */}
              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>

              {/* View button skeleton */}
              <div className="h-9 w-full bg-muted rounded-lg mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

