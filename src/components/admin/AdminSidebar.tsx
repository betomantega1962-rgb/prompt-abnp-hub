import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  PlayCircle,
  FileText,
  Gift,
  Webhook,
  MessageSquare,
  BarChart3,
  Settings,
  GraduationCap,
  Shield
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: BarChart3,
    exact: true
  },
  {
    title: "Gestão de Usuários",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Cursos Gratuitos",
    url: "/admin/courses",
    icon: PlayCircle,
  },
  {
    title: "Artigos do Blog",
    url: "/admin/articles",
    icon: FileText,
  },
  {
    title: "Ofertas Hotmart",
    url: "/admin/offers",
    icon: Gift,
  },
  {
    title: "Webhooks",
    url: "/admin/webhooks",
    icon: Webhook,
  },
  {
    title: "Comunicação",
    url: "/admin/communication",
    icon: MessageSquare,
  },
  {
    title: "Configurações",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string, exact = false) => {
    const active = isActive(path, exact);
    return active
      ? "bg-primary text-primary-foreground font-medium shadow-sm"
      : "hover:bg-card-hover transition-smooth";
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
        {/* Logo Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-foreground">ABNP</h2>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Painel Administrativo
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClass(item.url, item.exact)}
                    >
                      <item.icon className={`h-4 w-4 ${!collapsed ? "mr-3" : ""}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}