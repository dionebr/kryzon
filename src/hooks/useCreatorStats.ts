import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface CreatorStats {
  totalMachines: number;
  approvedMachines: number;
  pendingMachines: number;
  rejectedMachines: number;
  totalViews: number;
  totalSolves: number;
  averageRating: number;
  totalXPGenerated: number;
  categories: {
    [key: string]: number;
  };
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentSubmissions: Array<{
    id: string;
    name: string;
    status: "draft" | "pending" | "approved" | "rejected";
    submittedAt: string;
    category: string;
    difficulty: string;
  }>;
}

export const useCreatorStats = (userId?: string) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) return;
    
    fetchCreatorStats();
  }, [targetUserId]);

  const fetchCreatorStats = async () => {
    if (!targetUserId) return;

    setLoading(true);
    setError(null);

    try {
      // Primeiro buscar as máquinas
      const machinesData = await supabase
        .from('machines')
        .select('id, name, status, category, difficulty, xp_reward, created_at')
        .eq('creator_id', targetUserId);

      if (machinesData.error) throw machinesData.error;

      const machineIds = machinesData.data?.map(m => m.id) || [];

      // Depois buscar views e solves
      const [viewsData, solvesData] = await Promise.all([
        supabase
          .from('machine_views')
          .select('count')
          .eq('creator_id', targetUserId),
        machineIds.length > 0 
          ? supabase
              .from('user_solves')
              .select('machine_id, created_at')
              .in('machine_id', machineIds)
          : Promise.resolve({ data: [], error: null })
      ]);

      const machines = machinesData.data || [];
      const totalViews = viewsData.data?.reduce((sum, item) => sum + item.count, 0) || 0;
      const totalSolves = solvesData.data?.length || 0;

      // Calcular estatísticas
      const stats: CreatorStats = {
        totalMachines: machines.length,
        approvedMachines: machines.filter(m => m.status === 'approved').length,
        pendingMachines: machines.filter(m => m.status === 'pending').length,
        rejectedMachines: machines.filter(m => m.status === 'rejected').length,
        totalViews,
        totalSolves,
        averageRating: 0, // TODO: Implementar quando tiver sistema de rating
        totalXPGenerated: machines
          .filter(m => m.status === 'approved')
          .reduce((sum, m) => sum + (m.xp_reward || 0), 0),
        categories: machines.reduce((acc, m) => {
          acc[m.category] = (acc[m.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        difficultyBreakdown: {
          easy: machines.filter(m => m.difficulty === 'easy').length,
          medium: machines.filter(m => m.difficulty === 'medium').length,
          hard: machines.filter(m => m.difficulty === 'hard').length,
        },
        recentSubmissions: machines.slice(0, 10).map(m => ({
          id: m.id,
          name: m.name,
          status: m.status as "draft" | "pending" | "approved" | "rejected",
          submittedAt: m.created_at,
          category: m.category,
          difficulty: m.difficulty,
        })),
      };

      setStats(stats);
    } catch (err) {
      console.error("Erro ao buscar estatísticas do criador:", err);
      setError("Erro ao carregar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  const getMachinesByStatus = (status: "draft" | "pending" | "approved" | "rejected") => {
    return stats?.recentSubmissions.filter(machine => machine.status === status) || [];
  };

  const getTopCategory = () => {
    if (!stats?.categories) return null;
    
    return Object.entries(stats.categories).reduce((a, b) => 
      stats.categories[a[0]] > stats.categories[b[0]] ? a : b
    )[0];
  };

  const getSuccessRate = () => {
    if (!stats || stats.totalMachines === 0) return 0;
    return (stats.approvedMachines / stats.totalMachines) * 100;
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchCreatorStats,
    getMachinesByStatus,
    getTopCategory,
    getSuccessRate,
  };
};