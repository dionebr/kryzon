import { useParams } from "react-router-dom";
import { Trophy, Target, Award, Calendar, TrendingUp, Server, Plus, Eye, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useCreatorStats } from "@/hooks/useCreatorStats";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Verificar se é o próprio perfil do usuário
  const isOwnProfile = user?.user_metadata?.username === username;
  
  // Buscar estatísticas de criador se for o próprio perfil
  const { stats: creatorStats, loading: creatorLoading } = useCreatorStats(
    isOwnProfile ? user?.id : undefined
  );

  const profile = {
    username: username || "user",
    avatar: "U",
    xp: 8450,
    rank: 15,
    level: 42,
    joinedAt: "2024-05-10",
    solvedMachines: 56,
    totalMachines: 120,
    firstBloods: 7,
    badges: [
      { id: 1, name: "Early Adopter", icon: "🌟" },
      { id: 2, name: "Web Expert", icon: "🌐" },
      { id: 3, name: "Speed Demon", icon: "⚡" },
      { id: 4, name: "100 Days Streak", icon: "🔥" },
    ],
    stats: {
      web: 25,
      pwn: 15,
      crypto: 8,
      reverse: 5,
      forensics: 3,
    },
    recentSolves: [
      {
        id: 1,
        name: "Lab1 - LFI",
        difficulty: "Fácil",
        solvedAt: "2025-10-18",
        firstBlood: true,
      },
      {
        id: 2,
        name: "Lab2 - SQLi",
        difficulty: "Fácil",
        solvedAt: "2025-10-17",
        firstBlood: false,
      },
      {
        id: 3,
        name: "Lab3 - XSS",
        difficulty: "Fácil",
        solvedAt: "2025-10-16",
        firstBlood: false,
      },
    ],
    activityData: [
      { month: "Jan", solves: 4 },
      { month: "Fev", solves: 8 },
      { month: "Mar", solves: 12 },
      { month: "Abr", solves: 10 },
      { month: "Mai", solves: 14 },
      { month: "Jun", solves: 8 },
    ],
  };

  const progressToNextLevel = ((profile.xp % 200) / 200) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <Card className="gradient-card border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl">
                {profile.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{profile.username}</h1>
                  <p className="text-muted-foreground mt-1">
                    Membro desde {profile.joinedAt}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Rank Global</p>
                  <p className="text-3xl font-bold text-primary">#{profile.rank}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{profile.xp}</p>
                  <p className="text-sm text-muted-foreground">XP Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile.level}</p>
                  <p className="text-sm text-muted-foreground">Nível</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile.solvedMachines}</p>
                  <p className="text-sm text-muted-foreground">Máquinas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">{profile.firstBloods}</p>
                  <p className="text-sm text-muted-foreground">First Bloods</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for own profile */}
      {isOwnProfile ? (
        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="perfil">Meu Perfil</TabsTrigger>
            <TabsTrigger value="maquinas">Minhas Máquinas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="perfil" className="space-y-6">
            {/* Profile Content */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress */}
                <Card className="gradient-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Progresso Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Máquinas Resolvidas</span>
                        <span className="text-sm font-medium">
                          {profile.solvedMachines}/{profile.totalMachines}
                        </span>
                      </div>
                      <Progress
                        value={(profile.solvedMachines / profile.totalMachines) * 100}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Próximo Nível</span>
                        <span className="text-sm font-medium">
                          {Math.floor(progressToNextLevel)}%
                        </span>
                      </div>
                      <Progress value={progressToNextLevel} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Stats por Categoria */}
                <Card className="gradient-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                      Estatísticas por Categoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(profile.stats).map(([category, count]) => (
                        <div key={category} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-24 capitalize">
                            {category}
                          </span>
                          <div className="flex-1">
                            <Progress value={(count / 30) * 100} className="h-2" />
                          </div>
                          <span className="text-sm font-bold text-primary w-8 text-right">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Atividade */}
                <Card className="gradient-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Atividade Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 flex items-end justify-between gap-2">
                      {profile.activityData.map((data) => {
                        const maxSolves = Math.max(...profile.activityData.map((d) => d.solves));
                        const height = (data.solves / maxSolves) * 100;
                        return (
                          <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                            <div className="text-xs font-medium text-primary">{data.solves}</div>
                            <div
                              className="w-full bg-gradient-primary rounded-t-lg transition-all hover:opacity-80"
                              style={{ height: `${height}%`, minHeight: "10px" }}
                            />
                            <div className="text-xs text-muted-foreground">{data.month}</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Badges */}
                <Card className="gradient-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Conquistas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {profile.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="p-3 rounded-lg bg-muted/50 text-center hover:bg-muted transition-colors"
                        >
                          <div className="text-3xl mb-1">{badge.icon}</div>
                          <p className="text-xs font-medium">{badge.name}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Solves */}
                <Card className="gradient-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Resolvidos Recentemente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.recentSolves.map((solve) => (
                        <div
                          key={solve.id}
                          className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-sm">{solve.name}</p>
                            {solve.firstBlood && (
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {solve.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {solve.solvedAt}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="maquinas" className="space-y-6">
            {/* Creator Stats */}
            {!creatorLoading && creatorStats && (
              <div className="grid gap-6 lg:grid-cols-4">
                <Card className="gradient-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Server className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{creatorStats.totalMachines}</p>
                        <p className="text-sm text-muted-foreground">Máquinas Criadas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="gradient-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Eye className="w-8 h-8 text-secondary" />
                      <div>
                        <p className="text-2xl font-bold">{creatorStats.totalSolves}</p>
                        <p className="text-sm text-muted-foreground">Total de Solves</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="gradient-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{creatorStats.approvedMachines}</p>
                        <p className="text-sm text-muted-foreground">Aprovadas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="gradient-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-orange-500" />
                      <div>
                        <p className="text-2xl font-bold">{creatorStats.pendingMachines}</p>
                        <p className="text-sm text-muted-foreground">Pendentes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* My Machines */}
            <Card className="gradient-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    Minhas Máquinas
                  </CardTitle>
                  <Button 
                    onClick={() => navigate('/machines/create')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Máquina
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Machine List */}
                <div className="space-y-4">
                  {creatorStats?.machines?.map((machine) => (
                    <div
                      key={machine.id}
                      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/machines/${machine.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{machine.name}</h3>
                            <Badge 
                              variant={
                                machine.status === 'approved' ? 'default' :
                                machine.status === 'pending' ? 'secondary' :
                                'destructive'
                              }
                            >
                              {machine.status === 'approved' ? 'Aprovada' :
                               machine.status === 'pending' ? 'Pendente' :
                               'Rejeitada'}
                            </Badge>
                            <Badge variant="outline">
                              {machine.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {machine.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Categoria: {machine.category}</span>
                            <span>Solves: {machine.solveCount}</span>
                            <span>Criado em: {new Date(machine.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/machines/${machine.id}/edit`);
                            }}
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12">
                      <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma máquina criada</h3>
                      <p className="text-muted-foreground mb-4">
                        Comece criando sua primeira máquina para a plataforma
                      </p>
                      <Button onClick={() => navigate('/machines/create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeira Máquina
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* Regular profile view for other users */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Progresso Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Máquinas Resolvidas</span>
                    <span className="text-sm font-medium">
                      {profile.solvedMachines}/{profile.totalMachines}
                    </span>
                  </div>
                  <Progress
                    value={(profile.solvedMachines / profile.totalMachines) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Próximo Nível</span>
                    <span className="text-sm font-medium">
                      {Math.floor(progressToNextLevel)}%
                    </span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Stats por Categoria */}
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  Estatísticas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(profile.stats).map(([category, count]) => (
                    <div key={category} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-24 capitalize">
                        {category}
                      </span>
                      <div className="flex-1">
                        <Progress value={(count / 30) * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-bold text-primary w-8 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Atividade */}
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-end justify-between gap-2">
                  {profile.activityData.map((data) => {
                    const maxSolves = Math.max(...profile.activityData.map((d) => d.solves));
                    const height = (data.solves / maxSolves) * 100;
                    return (
                      <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-xs font-medium text-primary">{data.solves}</div>
                        <div
                          className="w-full bg-gradient-primary rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: `${height}%`, minHeight: "10px" }}
                        />
                        <div className="text-xs text-muted-foreground">{data.month}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Badges */}
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {profile.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-3 rounded-lg bg-muted/50 text-center hover:bg-muted transition-colors"
                    >
                      <div className="text-3xl mb-1">{badge.icon}</div>
                      <p className="text-xs font-medium">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Solves */}
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Resolvidos Recentemente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.recentSolves.map((solve) => (
                    <div
                      key={solve.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm">{solve.name}</p>
                        {solve.firstBlood && (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {solve.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {solve.solvedAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
