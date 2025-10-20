import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Server,
  Activity,
  Calendar,
  Clock,
  Target,
  Zap,
  Trophy,
  Eye,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Treemap,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnalyticsData {
  userEngagement: {
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    averageSessionTime: number;
    bounceRate: number;
  };
  machineStats: {
    totalViews: number;
    totalSolves: number;
    averageSolveTime: number;
    popularMachines: Array<{
      name: string;
      views: number;
      solves: number;
      rating: number;
    }>;
    categoryPerformance: Array<{
      category: string;
      machines: number;
      views: number;
      solves: number;
      avgTime: number;
    }>;
  };
  timeSeriesData: Array<{
    date: string;
    users: number;
    solves: number;
    newMachines: number;
    flags: number;
  }>;
  heatmapData: Array<{
    hour: number;
    day: string;
    activity: number;
  }>;
  topCreators: Array<{
    username: string;
    machines: number;
    totalSolves: number;
    avgRating: number;
  }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084f0'];

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = dateRange.to;
      const startDate = dateRange.from;

      // Buscar dados de engajamento de usuários
      const [
        activeUsersData,
        machineViewsData,
        solvesData,
        newMachinesData,
        creatorsData
      ] = await Promise.all([
        supabase
          .from('user_sessions')
          .select('user_id, created_at, duration')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('machine_views')
          .select('machine_id, user_id, created_at, machines(name, category)')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('user_solves')
          .select('machine_id, user_id, created_at, solve_time, machines(name, category, creator_id)')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('machines')
          .select('id, name, category, created_at, creator_id')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),

        supabase
          .from('profiles')
          .select(`
            username,
            machines(count),
            user_solves(count)
          `)
      ]);

      // Processar dados de engajamento
      const uniqueUsers = new Set(activeUsersData.data?.map(s => s.user_id) || []);
      const totalSessions = activeUsersData.data?.length || 0;
      const avgSessionTime = activeUsersData.data?.reduce((acc, s) => acc + (s.duration || 0), 0) / totalSessions || 0;

      // Processar máquinas populares
      const machineViewCounts = machineViewsData.data?.reduce((acc, view) => {
        const machineId = view.machine_id;
        acc[machineId] = (acc[machineId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const machineSolveCounts = solvesData.data?.reduce((acc, solve) => {
        const machineId = solve.machine_id;
        acc[machineId] = (acc[machineId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Processar performance por categoria
      const categoryStats = (machineViewsData.data || []).reduce((acc, view) => {
        const category = view.machines?.category || 'Unknown';
        if (!acc[category]) {
          acc[category] = { views: 0, solves: 0, machines: new Set() };
        }
        acc[category].views++;
        acc[category].machines.add(view.machine_id);
        return acc;
      }, {} as Record<string, any>);

      // Adicionar dados de solves às categorias
      (solvesData.data || []).forEach(solve => {
        const category = solve.machines?.category || 'Unknown';
        if (categoryStats[category]) {
          categoryStats[category].solves++;
        }
      });

      // Processar séries temporais
      const timeSeriesMap = new Map();
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < daysDiff; i++) {
        const date = subDays(endDate, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        timeSeriesMap.set(dateKey, {
          date: dateKey,
          users: 0,
          solves: 0,
          newMachines: 0,
          flags: 0
        });
      }

      // Preencher dados da série temporal
      activeUsersData.data?.forEach(session => {
        const dateKey = format(new Date(session.created_at), 'yyyy-MM-dd');
        if (timeSeriesMap.has(dateKey)) {
          timeSeriesMap.get(dateKey).users++;
        }
      });

      solvesData.data?.forEach(solve => {
        const dateKey = format(new Date(solve.created_at), 'yyyy-MM-dd');
        if (timeSeriesMap.has(dateKey)) {
          timeSeriesMap.get(dateKey).solves++;
          timeSeriesMap.get(dateKey).flags++;
        }
      });

      newMachinesData.data?.forEach(machine => {
        const dateKey = format(new Date(machine.created_at), 'yyyy-MM-dd');
        if (timeSeriesMap.has(dateKey)) {
          timeSeriesMap.get(dateKey).newMachines++;
        }
      });

      // Processar dados de heatmap (atividade por hora/dia)
      const heatmapMap = new Map();
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          heatmapMap.set(`${day}-${hour}`, {
            hour,
            day: days[day],
            activity: 0
          });
        }
      }

      activeUsersData.data?.forEach(session => {
        const date = new Date(session.created_at);
        const day = date.getDay();
        const hour = date.getHours();
        const key = `${day}-${hour}`;
        if (heatmapMap.has(key)) {
          heatmapMap.get(key).activity++;
        }
      });

      // Processar top criadores
      const topCreators = (creatorsData.data || [])
        .map(creator => ({
          username: creator.username,
          machines: creator.machines?.length || 0,
          totalSolves: creator.user_solves?.length || 0,
          avgRating: 0 // TODO: Implementar sistema de rating
        }))
        .filter(creator => creator.machines > 0)
        .sort((a, b) => b.machines - a.machines)
        .slice(0, 10);

      const analyticsData: AnalyticsData = {
        userEngagement: {
          activeUsers: uniqueUsers.size,
          newUsers: 0, // TODO: Calcular novos usuários no período
          returningUsers: 0, // TODO: Calcular usuários retornando
          averageSessionTime: avgSessionTime / 60, // em minutos
          bounceRate: 0, // TODO: Calcular bounce rate
        },
        machineStats: {
          totalViews: machineViewsData.data?.length || 0,
          totalSolves: solvesData.data?.length || 0,
          averageSolveTime: solvesData.data?.reduce((acc, s) => acc + (s.solve_time || 0), 0) / (solvesData.data?.length || 1) || 0,
          popularMachines: [], // TODO: Processar máquinas populares
          categoryPerformance: Object.entries(categoryStats).map(([category, stats]: [string, any]) => ({
            category,
            machines: stats.machines.size,
            views: stats.views,
            solves: stats.solves,
            avgTime: 0 // TODO: Calcular tempo médio por categoria
          }))
        },
        timeSeriesData: Array.from(timeSeriesMap.values()).reverse(),
        heatmapData: Array.from(heatmapMap.values()),
        topCreators
      };

      setData(analyticsData);
    } catch (error) {
      console.error("Erro ao buscar dados de analytics:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = (exportFormat: "csv" | "json") => {
    if (!data) return;
    
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    const filename = `kryzon_analytics_${timestamp}.${exportFormat}`;
    
    let content: string;
    let mimeType: string;
    
    if (exportFormat === "json") {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
    } else {
      // CSV básico com dados de série temporal
      const csvHeaders = "Data,Usuários,Soluções,Novas Máquinas,Flags\n";
      const csvRows = data.timeSeriesData
        .map(row => `${row.date},${row.users},${row.solves},${row.newMachines},${row.flags}`)
        .join("\n");
      content = csvHeaders + csvRows;
      mimeType = "text/csv";
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Sucesso",
      description: `Dados exportados como ${filename}`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Carregando métricas...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-destructive">Erro ao carregar dados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Métricas detalhadas e análise de engajamento
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportData("csv")}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => exportData("json")}>
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userEngagement.activeUsers}</div>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {Math.round(data.userEngagement.averageSessionTime)}min sessão média
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.machineStats.totalViews.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Máquinas visualizadas
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Soluções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.machineStats.totalSolves.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {Math.round(data.machineStats.averageSolveTime / 60)}min tempo médio
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.machineStats.totalSolves / Math.max(data.machineStats.totalViews, 1)) * 100).toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Visualizações→Soluções
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Série Temporal */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Atividade ao Longo do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                  name="Usuários"
                />
                <Area 
                  type="monotone" 
                  dataKey="solves" 
                  stackId="2"
                  stroke="hsl(var(--secondary))" 
                  fill="hsl(var(--secondary))"
                  fillOpacity={0.6}
                  name="Soluções"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.machineStats.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" name="Visualizações" />
                <Bar dataKey="solves" fill="hsl(var(--secondary))" name="Soluções" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Calor de Atividade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Mapa de Calor de Atividade (Hora × Dia da Semana)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-24 gap-1 text-xs">
            {/* Header com horas */}
            <div className="col-span-24 grid grid-cols-24 gap-1 mb-2">
              {[...Array(24)].map((_, hour) => (
                <div key={hour} className="text-center text-muted-foreground">
                  {hour}h
                </div>
              ))}
            </div>
            
            {/* Dados do heatmap agrupados por dia */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="col-span-24 grid grid-cols-24 gap-1 mb-1">
                {data.heatmapData
                  .filter(item => item.day === day)
                  .map(item => {
                    const intensity = Math.min(item.activity / 10, 1); // Normalizar
                    return (
                      <div
                        key={`${day}-${item.hour}`}
                        className="aspect-square rounded-sm border"
                        style={{
                          backgroundColor: `hsl(var(--primary) / ${intensity})`,
                        }}
                        title={`${day} ${item.hour}:00 - ${item.activity} atividades`}
                      />
                    );
                  })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Criadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Top Criadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCreators.map((creator, index) => (
              <div key={creator.username} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{creator.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {creator.machines} máquinas • {creator.totalSolves} soluções geradas
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{creator.machines}</div>
                  <div className="text-sm text-muted-foreground">máquinas</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}