"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CirclePlusIcon, MailIcon } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function NavMain({
  items,
  isAdminOrStaff = false,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
  isAdminOrStaff?: boolean
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {isAdminOrStaff && (
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Broadcase"
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                render={<Link href="/broadcast" />}
              >
                <CirclePlusIcon />
                <span>Broadcase</span>
              </SidebarMenuButton>

              <div className="group-data-[collapsible=icon]:opacity-0">
                <ModeToggle />
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} render={<Link href={item.url} />}>
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
