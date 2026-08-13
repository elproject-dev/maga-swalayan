"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleUserRoundIcon, LogOutIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function SiteHeader() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Pengguna",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || "/boy.png",
        })
      }
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Pengguna",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || "/boy.png",
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Mobile: Profile avatar dropdown */}
        <div className="md:hidden -ml-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center outline-none">
              <Avatar className="size-8 rounded-full">
                <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                <AvatarFallback className="rounded-full text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56"
              side="bottom"
              align="start"
              sideOffset={8}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8">
                      <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                      <AvatarFallback className="rounded-full text-xs">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/account")} className="cursor-pointer">
                    <CircleUserRoundIcon />
                    Akun Saya
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOutIcon />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop: Sidebar trigger */}
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto hidden md:block"
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
