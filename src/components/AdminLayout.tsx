import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminNavigation } from "./AdminNavigation";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { NotificationCenter } from "./NotificationCenter";
import { SidebarProvider } from "@/components/ui/sidebar";

export function AdminLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar de navegação administrativa */}
        <AdminNavigation />
        
        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col">
          {/* Header com breadcrumbs e notificações */}
          <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex items-center justify-between px-6 py-4">
              <AdminBreadcrumbs />
              <div className="flex items-center gap-4">
                <NotificationCenter />
              </div>
            </div>
          </header>

          {/* Área de conteúdo */}
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}