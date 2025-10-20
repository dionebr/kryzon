import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  totalUsers: number;
  totalMachines: number;
  activeInstances: number;
  pendingReviews: number;
  totalSolves: number;
  newUsersThisMonth: number;
  machinesCreatedThisMonth: number;
  averageSessionTime: number;
  topCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  userGrowth: Array<{
    month: string;
    users: number;
    machines: number;
  }>;
  systemHealth: {
    vpnStatus: "healthy" | "warning" | "critical";
    databaseStatus: "healthy" | "warning" | "critical";
    storageUsage: number; // percentage
    activeConnections: number;
  };
}

export interface AdminActivity {
  id: string;
  type: "user_registered" | "machine_submitted" | "machine_approved" | "machine_rejected" | "flag_captured";
  title: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

export const useAdminData = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAdminData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersCount, machinesCount, instancesCount, reviewsCount, solvesCount] = await Promise.all([
        supabase.from('profiles').select('count').single(),
        supabase.from('machines').select('count').single(),
        supabase.from('machine_instances').select('count').eq('status', 'active').single(),
        supabase.from('machines').select('count').eq('status', 'pending').single(),
        supabase.from('user_solves').select('count').single(),
      ]);

      // Buscar dados de crescimento dos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [userGrowthData, machineGrowthData, categoriesData, recentActivityData] = await Promise.all([
        supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString()),
        supabase
          .from('machines')
          .select('created_at, category')
          .gte('created_at', sixMonthsAgo.toISOString()),
        supabase
          .from('machines')
          .select('category')
          .eq('status', 'approved'),
        supabase
          .from('admin_activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      // Processar dados de crescimento
      const userGrowth = processGrowthData(userGrowthData.data || [], machineGrowthData.data || []);
      const topCategories = processCategoriesData(categoriesData.data || []);

      const stats: AdminStats = {
        totalUsers: usersCount.data?.count || 0,
        totalMachines: machinesCount.data?.count || 0,
        activeInstances: instancesCount.data?.count || 0,
        pendingReviews: reviewsCount.data?.count || 0,
        totalSolves: solvesCount.data?.count || 0,
        newUsersThisMonth: calculateNewThisMonth(userGrowthData.data || []),
        machinesCreatedThisMonth: calculateNewThisMonth(machineGrowthData.data || []),
        averageSessionTime: 0, // TODO: Implementar tracking de sessão
        topCategories,
        userGrowth,
        systemHealth: {
          vpnStatus: "healthy", // TODO: Implementar health check
          databaseStatus: "healthy",
          storageUsage: 0, // TODO: Implementar monitoramento de storage
          activeConnections: 0, // TODO: Implementar monitoramento de conexões
        },
      };

      const activity: AdminActivity[] = (recentActivityData.data || []).map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        timestamp: item.created_at,
        user: item.user_data,
        metadata: item.metadata,
      }));

      setStats(stats);
      setRecentActivity(activity);
    } catch (err) {
      console.error("Erro ao buscar dados administrativos:", err);
      setError("Erro ao carregar dados administrativos");
    } finally {
      setLoading(false);
    }
  };

  const processGrowthData = (users: any[], machines: any[]) => {
    // TODO: Implementar processamento de dados de crescimento
    return [];
  };

  const processCategoriesData = (categories: any[]) => {
    // TODO: Implementar processamento de dados de categorias
    return [];
  };

  const calculateNewThisMonth = (data: any[]) => {
    const thisMonth = new Date().getMonth();
    return data.filter(item => new Date(item.created_at).getMonth() === thisMonth).length;
  };

  const refreshStats = () => {
    return fetchAdminData();
  };

  return {
    stats,
    recentActivity,
    loading,
    error,
    refreshStats,
  };
};