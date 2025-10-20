import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import VPN from "./pages/VPN";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";
import MachineCreate from "./pages/MachineCreate";
import MySubmissions from "./pages/MySubmissions";
import Rankings from "./pages/Rankings";
import UserProfile from "./pages/UserProfile";
import Challenges from "./pages/Challenges";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Admin Components
import { AdminRoute } from "./components/AdminRoute";
import { AdminLayout } from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMachines from "./pages/AdminMachines";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import AdminReviewQueue from "./pages/AdminReviewQueue";

import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          } />
          <Route path="/*" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col w-full">
                    <Header />
                    <main className="flex-1 p-6 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/vpn" element={<VPN />} />
                        <Route path="/machines" element={<Machines />} />
                        <Route path="/machines/:id" element={<MachineDetail />} />
                        <Route path="/machines/create" element={<MachineCreate />} />
                        <Route path="/machines/my-submissions" element={<MySubmissions />} />
                        <Route path="/rankings" element={<Rankings />} />
                        <Route path="/profile/:username" element={<UserProfile />} />
                        <Route path="/challenges" element={<Challenges />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin/*" element={
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        }>
                          <Route index element={<AdminDashboard />} />
                          <Route path="machines" element={<AdminMachines />} />
                          <Route path="users" element={<AdminUsers />} />
                          <Route path="moderation" element={<AdminReviewQueue />} />
                          <Route path="analytics" element={<AdminAnalytics />} />
                          <Route path="settings" element={<AdminSettings />} />
                        </Route>
                        
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
