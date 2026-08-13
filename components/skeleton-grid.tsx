import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="rounded-xl w-full aspect-[4/5]" />
        ))}
      </div>
    </div>
  )
}
