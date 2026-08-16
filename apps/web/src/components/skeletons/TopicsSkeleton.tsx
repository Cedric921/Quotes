import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TopicsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <div className="h-9 w-64 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Topics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            className="border-2 relative overflow-hidden animate-pulse"
          >
            {/* Decorative gradient skeleton */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-muted/50 rounded-full blur-2xl" />

            <CardHeader className="relative">
              <div className="flex items-start gap-3 mb-4">
                {/* Icon skeleton */}
                <div className="w-12 h-12 rounded-xl bg-muted" />
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Name skeleton */}
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  {/* ID skeleton */}
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>

              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Stats skeleton */}
              <div className="flex items-center gap-2 pt-3 border-t">
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>

              {/* Action buttons skeleton */}
              <div className="flex gap-2">
                <div className="h-9 flex-1 bg-muted rounded-lg" />
                <div className="h-9 flex-1 bg-muted rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

