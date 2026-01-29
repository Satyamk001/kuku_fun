import { Card, CardContent, CardHeader } from './card';

export function ThreadSkeleton() {
  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Category badge and metadata skeleton */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-5 w-20 animate-pulse rounded-full bg-secondary/70" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted/50" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted/50" />
            </div>

            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted/70" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {/* Excerpt skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted/50" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted/50" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ThreadListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ThreadSkeleton key={i} />
      ))}
    </div>
  );
}
