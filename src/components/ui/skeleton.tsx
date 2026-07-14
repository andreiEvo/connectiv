import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

export function VideoCardSkeleton() {
  return (
    <div className="relative h-full w-full snap-item flex items-end">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="relative z-10 p-4 pb-8 w-full flex items-end justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 bg-surface-2" />
          <Skeleton className="h-3 w-48 bg-surface-2" />
          <Skeleton className="h-3 w-24 bg-surface-2" />
        </div>
        <div className="flex flex-col gap-4 items-center">
          <Skeleton className="h-10 w-10 rounded-full bg-surface-2" />
          <Skeleton className="h-10 w-10 rounded-full bg-surface-2" />
          <Skeleton className="h-10 w-10 rounded-full bg-surface-2" />
        </div>
      </div>
    </div>
  );
}
