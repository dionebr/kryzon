import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface UserRole {
  id: string;
  role: "user" | "creator" | "moderator" | "admin";
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
        .from('profiles')
        .select('id, role, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error("Profile not found");
      }

      const profile = data as Profile;
      
      const roleData: UserRole = {
        id: profile.id,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      setUserRole(roleData);
      updatePermissions(profile.role);
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

  const updatePermissions = (role: "user" | "creator" | "moderator" | "admin") => {
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
      case "creator":
        setPermissions({
          canModerate: false,
          canManageUsers: false,
          canManageMachines: false,
          canAccessAnalytics: false,
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
  const canAccess = (requiredRole: "user" | "creator" | "moderator" | "admin") => {
    if (!userRole) return false;
    
    const roleHierarchy = { user: 1, creator: 2, moderator: 3, admin: 4 };
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