import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface UserRole {
  id: string;
  role: "user" | "moderator" | "admin";
  created_at: string;
  updated_at: string;
}

export interface AdminPermissions {
  canModerate: boolean;
  canManageUsers: boolean;
  canManageMachines: boolean;
  canAccessAnalytics: boolean;
  canManageSettings: boolean;
}

export const useAdminRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions>({
    canModerate: false,
    canManageUsers: false,
    canManageMachines: false,
    canAccessAnalytics: false,
    canManageSettings: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) return;

    fetchUserRole();
  }, [user, authLoading]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setUserRole(data);
      updatePermissions(data.role);
    } catch (error) {
      console.error("Erro ao buscar role do usuário:", error);
      // Fallback para usuário comum se não encontrar role
      const fallbackRole: UserRole = {
        id: user.id,
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUserRole(fallbackRole);
      updatePermissions("user");
    } finally {
      setLoading(false);
    }
  };

  const updatePermissions = (role: "user" | "moderator" | "admin") => {
    switch (role) {
      case "admin":
        setPermissions({
          canModerate: true,
          canManageUsers: true,
          canManageMachines: true,
          canAccessAnalytics: true,
          canManageSettings: true,
        });
        break;
      case "moderator":
        setPermissions({
          canModerate: true,
          canManageUsers: false,
          canManageMachines: true,
          canAccessAnalytics: true,
          canManageSettings: false,
        });
        break;
      default: // user
        setPermissions({
          canModerate: false,
          canManageUsers: false,
          canManageMachines: false,
          canAccessAnalytics: false,
          canManageSettings: false,
        });
    }
  };

  const isAdmin = () => userRole?.role === "admin";
  const isModerator = () => userRole?.role === "moderator" || userRole?.role === "admin";
  const canAccess = (requiredRole: "user" | "moderator" | "admin") => {
    if (!userRole) return false;
    
    const roleHierarchy = { user: 1, moderator: 2, admin: 3 };
    return roleHierarchy[userRole.role] >= roleHierarchy[requiredRole];
  };

  return {
    userRole,
    permissions,
    loading: loading || authLoading,
    isAdmin,
    isModerator,
    canAccess,
    refetch: fetchUserRole,
  };
};