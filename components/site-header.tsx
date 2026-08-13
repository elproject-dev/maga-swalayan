import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="flex flex-1 items-center justify-end">
          <div className="h-9 w-32 md:w-40 overflow-hidden flex items-center justify-center bg-transparent">
            <img 
              src="https://placehold.co/400x100/transparent/1e293b?text=Maga+Swalayan" 
              alt="Maga Swalayan Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>
    </header>
  )
}
