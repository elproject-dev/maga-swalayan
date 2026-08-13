import sys

with open('app/settings/page.tsx', 'r') as f:
    text = f.read()

import_stmt = 'import { Skeleton } from "@/components/ui/skeleton"\n'
if 'import { Skeleton }' not in text:
    text = text.replace('import { Button } from "@/components/ui/button"', 'import { Button } from "@/components/ui/button"\n' + import_stmt)

old_loader = """    if (!isMounted) {


      return (
        <div className="flex flex-1 items-center justify-center min-h-[70vh] w-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )
    }"""

new_loader = """    if (!isMounted) {
      return (
        <div className="@container/main flex flex-1 flex-col gap-6 py-4 md:py-8 px-4 lg:px-8 w-full">
          <div className="flex flex-col">
            <Skeleton className="h-8 w-64 mb-1" />
          </div>
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <Skeleton className="h-[120px] w-full rounded-xl" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="rounded-md border p-0">
                <div className="border-b px-4 py-3">
                  <Skeleton className="h-6 w-full" />
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }"""

text = text.replace(old_loader, new_loader)

with open('app/settings/page.tsx', 'w') as f:
    f.write(text)

print("Settings loader replaced with Skeleton")
