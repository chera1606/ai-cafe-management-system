export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-stone-200/70 ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[24px] bg-white border border-stone-200/80 p-5 space-y-4 shadow-sm">
      <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}
