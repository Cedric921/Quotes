import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function QuotesSkeleton() {
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

      {/* Quotes Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="border-2 relative overflow-hidden animate-pulse"
          >
            {/* Decorative elements skeleton */}
            <div className="absolute top-0 left-0 w-1 h-full bg-muted" />
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-muted/30 rounded-full blur-2xl" />

            <CardHeader className="pb-3 relative">
              <div className="flex items-start gap-4">
                {/* Icon skeleton */}
                <div className="w-14 h-14 rounded-2xl bg-muted" />
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Title skeleton */}
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  {/* Author skeleton */}
                  <div className="h-4 w-1/2 bg-muted rounded" />
                  {/* Badges skeleton */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="h-5 w-20 bg-muted rounded-full" />
                    <div className="h-5 w-24 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Quote text skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>

              {/* Action buttons skeleton */}
              <div className="flex gap-2 pt-4 border-t">
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

