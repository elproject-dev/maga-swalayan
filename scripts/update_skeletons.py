import sys
import glob

# Files to update
files_to_update = ['app/page.tsx', 'app/promo/page.tsx', 'app/pilihan/page.tsx', 'app/produk/page.tsx']

old_loader_block = """    if (!isMounted) {
      return (
        <div className="flex flex-1 items-center justify-center min-h-[70vh] w-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )
    }"""

new_loader_block = """    if (!isMounted) {
      return (
        <div className="flex flex-1 flex-col py-4 md:py-6 px-4 lg:px-6 w-full">
          <SkeletonGrid count={10} />
        </div>
      )
    }"""

old_page_loader = """  if (!isMounted) {
    return (
      <div className="flex items-center justify-center w-full min-h-[300px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }"""

new_page_loader = """  if (!isMounted) {
    return (
      <div className="flex flex-col w-full min-h-[300px] mt-4">
        <SkeletonGrid count={5} />
      </div>
    );
  }"""

for file_path in files_to_update:
    with open(file_path, 'r') as f:
        text = f.read()

    import_stmt = 'import { SkeletonGrid } from "@/components/skeleton-grid"\n'
    if 'import { SkeletonGrid }' not in text:
        text = text.replace('import { Loader2 } from "lucide-react"', 'import { Loader2 } from "lucide-react"\n' + import_stmt)
    
    if file_path == 'app/page.tsx':
        text = text.replace(old_page_loader, new_page_loader)
    else:
        text = text.replace(old_loader_block, new_loader_block)
        
    with open(file_path, 'w') as f:
        f.write(text)

print("Updated loaders to SkeletonGrid")
