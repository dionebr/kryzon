import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  Users,
  FileCheck,
  TrendingUp,
  Settings,
  Shield,
  ChevronLeft,
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
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    requiredRole: "moderator" as const,
  },
  {
    title: "Máquinas",
    url: "/admin/machines",
    icon: Server,
    requiredRole: "moderator" as const,
  },
  {
    title: "Usuários",
    url: "/admin/users",
    icon: Users,
    requiredRole: "admin" as const,
  },
  {
    title: "Moderação",
    url: "/admin/moderation",
    icon: FileCheck,
    requiredRole: "moderator" as const,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: TrendingUp,
    requiredRole: "moderator" as const,
  },
  {
    title: "Configurações",
    url: "/admin/settings",
    icon: Settings,
    requiredRole: "admin" as const,
  },
];

export function AdminNavigation() {
  const { state, toggleSidebar } = useSidebar();
  const { canAccess } = useAdminRole();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Kryzon</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <ChevronLeft 
              className={`h-4 w-4 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`} 
            />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground uppercase text-xs px-2">
            {!collapsed && "Administração"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems
                .filter(item => canAccess(item.requiredRole))
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground font-medium shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Link para voltar ao painel principal */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  >
                    <ChevronLeft className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Painel Principal</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}