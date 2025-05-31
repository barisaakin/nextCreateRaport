"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
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
import { Building2, ClipboardMinus, ClipboardPlus, Command, HousePlus, User, UserPlus } from "lucide-react"

const data = {
  user: {
    name: "Barış AKIN",
    email: "barisakin.35@hotmail.com",
  },
  company: [
    {
      name: "Company",
      url: "company",
      icon: Building2,
    },
  ],
  users: [{
    name: "Users",
    url: "users",
    icon: User,
  },
],
  reports: [{
    name: "Rapors",
    url: "reports",
    icon: ClipboardMinus,
  },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="text-lg truncate font-semibold">Ai-Thinks</span>
                  <span className="text-lg truncate text-xs">Formatier</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavDocuments items={data.company} title="Company" />
        <NavDocuments items={data.users} title="Users" />
        <NavDocuments items={data.reports} title="Rapors" />

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
