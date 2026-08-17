"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon, Disc2Icon, BoxIcon, PointerIcon, User2Icon, MapPinIcon, UserCogIcon } from "lucide-react"

const data = {
  user: {
    name: "el project",
    email: "elproject.dev@gmail.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/home",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Promo",
      url: "/promo",
      icon: (
        <Disc2Icon
        />
      ),
    },
    {
      title: "Pilihan",
      url: "/pilihan",
      icon: (
        <ChartBarIcon
        />
      ),
    },
    {
      title: "Produk",
      url: "/produk",
      icon: (
        <BoxIcon
        />
      ),
    },
    {
      title: "Member",
      url: "/member",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      title: "Lokasi",
      url: "/lokasi",
      icon: (
        <MapPinIcon
        />
      ),
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: (
        <Settings2Icon
        />
      ),
    },
  ],
  documents: [
    {
      name: "Analytics",
      url: "/analytics",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Pelanggan",
      url: "/pelanggan",
      icon: (
        <UsersIcon
        />
      ),
    },

    {
      name: "Poin",
      url: "/poin",
      icon: (
        <PointerIcon
        />
      ),
    },
    {
      name: "Database",
      url: "/database",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "Staf",
      url: "/staf",
      icon: (
        <UserCogIcon
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState(data.user)
  const [isAdminOrStaff, setIsAdminOrStaff] = useState(false)

  const checkRole = async (email: string | undefined) => {
    if (!email) {
      setIsAdminOrStaff(false)
      return
    }
    
    if (email === "elproject.dev@gmail.com") {
      setIsAdminOrStaff(true)
      return
    }
    
    const { data: staffData } = await supabase
      .from('staf')
      .select('id')
      .eq('email', email)
      .maybeSingle()
      
    if (staffData) {
      setIsAdminOrStaff(true)
    } else {
      setIsAdminOrStaff(false)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserData({
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Pengguna",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
        })
        checkRole(session.user.email)
      }
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserData({
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Pengguna",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
        })
        checkRole(session.user.email)
      } else {
        setIsAdminOrStaff(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <span className="text-base font-semibold">Maga Swalayan</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {isAdminOrStaff && <NavDocuments items={data.documents} />}
        {isAdminOrStaff && <NavSecondary items={data.navSecondary} className="mt-auto" />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
