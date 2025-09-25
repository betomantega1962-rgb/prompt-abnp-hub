import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminProtectedRoute } from "./AdminProtectedRoute";

export function AdminLayout() {
  return (
    <AdminProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-subtle">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader />
            <main className="flex-1 p-6 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminProtectedRoute>
  );
}