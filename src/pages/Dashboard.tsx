import { Trophy, Target, Zap, TrendingUp, Server, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useXP } from "@/hooks/useXP";
import { XPProgressCard } from "@/components/XPProgressCard";
import { CategoryProgressChart } from "@/components/CategoryProgressChart";
import { SkillsRadarChart } from "@/components/SkillsRadarChart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Mock XP - será integrado com banco posteriormente
  const { xpData } = useXP(1250);
  
  // Mock data - será substituído por dados reais do banco
  const stats = [
    {
      title: "XP Total",
      value: xpData.totalXP.toString(),
      icon: Zap,
      description: `Nível ${xpData.level}`,
    },
    {
      title: "Máquinas Concluídas",
      value: "8",
      icon: Target,
      description: "8/15 disponíveis",
    },
    {
      title: "Flags Capturadas",
      value: "24",
      icon: Trophy,
      description: "Top 15%",
    },
    {
      title: "Posição no Rank",
      value: "#42",
      icon: TrendingUp,
      description: "Entre 500 usuários",
    },
  ];

  // Dados para gráficos
  const categoryProgress = [
    { category: "Web", completed: 5, total: 8, xp: 450 },
    { category: "Pwn", completed: 2, total: 5, xp: 280 },
    { category: "Reverse", completed: 1, total: 4, xp: 180 },
    { category: "Crypto", completed: 0, total: 3, xp: 0 },
    { category: "Forensics", completed: 0, total: 2, xp: 0 },
  ];

  const skillsData = [
    { skill: "Web", value: 75, fullMark: 100 },
    { skill: "Network", value: 40, fullMark: 100 },
    { skill: "Binary", value: 30, fullMark: 100 },
    { skill: "Linux", value: 85, fullMark: 100 },
    { skill: "Windows", value: 50, fullMark: 100 },
  ];

  const activeMachines = [
    {
      id: "lab1",
      name: "Lab1 - LFI",
      difficulty: "Fácil",
      timeRemaining: "01:45:32",
      progress: 60,
      ip: "10.8.0.10"
    },
    {
      id: "lab2",
      name: "Lab2 - SQLi",
      difficulty: "Fácil",
      timeRemaining: "02:15:00",
      progress: 30,
      ip: "10.8.0.11"
    }
  ];

  const progressData = [
    { month: "Jan", xp: 120 },
    { month: "Fev", xp: 280 },
    { month: "Mar", xp: 450 },
    { month: "Abr", xp: 680 },
    { month: "Mai", xp: 920 },
    { month: "Jun", xp: 1200 }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bem-vindo ao Kryzon</h1>
        <p className="text-muted-foreground">
          Sua jornada no mundo da segurança ofensiva começa aqui.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="gradient-card border-border hover:border-primary/50 transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Máquinas em Andamento */}
      {activeMachines.length > 0 && (
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Máquinas em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeMachines.map((machine) => (
              <div
                key={machine.id}
                className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/machines/${machine.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{machine.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="border-primary text-primary text-xs">
                        {machine.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">IP: {machine.ip}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-mono text-primary">{machine.timeRemaining}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{machine.progress}%</span>
                  </div>
                  <Progress value={machine.progress} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Progresso Atual de Nível */}
      <XPProgressCard xpData={xpData} />

      {/* Gráfico de Progresso XP Mensal */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Progresso de XP (Últimos 6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line 
                type="monotone" 
                dataKey="xp" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Progresso por Categoria */}
      <CategoryProgressChart data={categoryProgress} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Continue de onde parou
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Você ainda não iniciou nenhuma máquina.
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Explorar Máquinas
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary" />
              Novas Máquinas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Lab1 - LFI", difficulty: "Fácil", xp: 50 },
              { name: "Lab2 - SQLi", difficulty: "Fácil", xp: 50 },
              { name: "Lab3 - XSS", difficulty: "Fácil", xp: 50 },
            ].map((machine, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-gradient-primary flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{machine.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs border-primary text-primary"
                      >
                        {machine.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {machine.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Iniciar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <SkillsRadarChart data={skillsData} />
    </div>
  );
}
