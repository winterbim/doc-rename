'use client';

export function ViewerSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-6">
      <div className="h-4 w-2/3 animate-pulse rounded bg-paper-2" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-paper-2" />
      <div className="mt-6 h-48 w-full animate-pulse rounded bg-paper-2" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-paper-2" />
      <div className="h-4 w-2/5 animate-pulse rounded bg-paper-2" />
    </div>
  );
}
