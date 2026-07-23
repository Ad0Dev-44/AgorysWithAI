import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({
  rows = 5,
}: TableSkeletonProps) {

  return (
    <div className="space-y-2">

      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-8 w-full"
        />
      ))}

    </div>
  );
}