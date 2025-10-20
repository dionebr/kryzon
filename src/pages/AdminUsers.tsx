import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Shield,
  Crown,
  Ban,
  RotateCcw,
  Edit,
  MoreHorizontal,
  UserPlus,
  Calendar,
  Trophy,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useXP } from "@/hooks/useXP";

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role: "user" | "moderator" | "admin";
  total_xp: number;
  level: number;
  created_at: string;
  last_login?: string;
  is_banned: boolean;
  machines_created: number;
  machines_solved: number;
  flags_captured: number;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  level: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "all",
    status: "all",
    level: "all",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role),
          machines_created:machines(count),
          machines_solved:user_solves(count),
          flags_captured:user_solves(count)
        `);

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Processar dados dos usuários
      const processedUsers = data?.map(user => {
        const { getLevelFromXP } = useXP(user.total_xp || 0);
        return {
          ...user,
          role: user.user_roles?.role || "user",
          level: getLevelFromXP(user.total_xp || 0),
          machines_created: user.machines_created?.length || 0,
          machines_solved: user.machines_solved?.length || 0,
          flags_captured: user.flags_captured?.length || 0,
        };
      }) || [];

      // Aplicar filtros adicionais
      let filteredUsers = processedUsers;

      if (filters.role !== "all") {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }

      if (filters.status !== "all") {
        if (filters.status === "banned") {
          filteredUsers = filteredUsers.filter(user => user.is_banned);
        } else if (filters.status === "active") {
          filteredUsers = filteredUsers.filter(user => !user.is_banned);
        }
      }

      if (filters.level !== "all") {
        const levelRange = filters.level.split("-");
        if (levelRange.length === 2) {
          const minLevel = parseInt(levelRange[0]);
          const maxLevel = parseInt(levelRange[1]);
          filteredUsers = filteredUsers.filter(user => 
            user.level >= minLevel && user.level <= maxLevel
          );
        }
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "user" | "moderator" | "admin") => {
    try {
      await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole });

      toast({
        title: "Sucesso",
        description: `Role atualizada para ${newRole}`,
      });
      fetchUsers();
    } catch (error) {
      console.error("Erro ao atualizar role:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar role do usuário",
        variant: "destructive",
      });
    }
  };

  const toggleBanUser = async (userId: string, banned: boolean) => {
    try {
      await supabase
        .from('profiles')
        .update({ is_banned: banned })
        .eq('id', userId);

      toast({
        title: "Sucesso",
        description: banned ? "Usuário banido" : "Usuário desbanido",
      });
      fetchUsers();
    } catch (error) {
      console.error("Erro ao banir/desbanir usuário:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do usuário",
        variant: "destructive",
      });
    }
  };

  const resetUserXP = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ total_xp: 0 })
        .eq('id', userId);

      toast({
        title: "Sucesso",
        description: "XP do usuário resetado",
      });
      fetchUsers();
    } catch (error) {
      console.error("Erro ao resetar XP:", error);
      toast({
        title: "Erro", 
        description: "Erro ao resetar XP do usuário",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/10 text-red-500 border-red-500";
      case "moderator": return "bg-blue-500/10 text-blue-500 border-blue-500";
      case "user": return "bg-green-500/10 text-green-500 border-green-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="w-3 h-3" />;
      case "moderator": return <Shield className="w-3 h-3" />;
      case "user": return <Users className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, roles e permissões
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Usuário
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "admin").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moderadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "moderator").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Banidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.is_banned).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.role}
              onValueChange={(value) => setFilters({ ...filters, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Roles</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="moderator">Moderador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="banned">Banido</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.level}
              onValueChange={(value) => setFilters({ ...filters, level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Níveis</SelectItem>
                <SelectItem value="1-10">Nível 1-10</SelectItem>
                <SelectItem value="11-25">Nível 11-25</SelectItem>
                <SelectItem value="26-50">Nível 26-50</SelectItem>
                <SelectItem value="51-100">Nível 51+</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setFilters({ search: "", role: "all", status: "all", level: "all" })}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Estatísticas</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-16 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold">{user.level}</div>
                        <div className="text-sm text-muted-foreground">
                          ({user.total_xp} XP)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-yellow-500" />
                          <span>{user.machines_solved} resolvidas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-primary" />
                          <span>{user.machines_created} criadas</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_banned ? (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">
                          Banido
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                          Ativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Role
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => toggleBanUser(user.id, !user.is_banned)}
                            className={user.is_banned ? "text-green-600" : "text-red-600"}
                          >
                            {user.is_banned ? (
                              <>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Desbanir
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Banir
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-yellow-600"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Resetar XP
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Resetar XP</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação irá resetar todo o XP de {user.username} para 0. 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => resetUserXP(user.id)}
                                  className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                  Resetar XP
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para editar role */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Role - {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Role Atual</label>
              <div className="mt-1">
                <Badge variant="outline" className={getRoleColor(selectedUser?.role || "user")}>
                  <div className="flex items-center gap-1">
                    {getRoleIcon(selectedUser?.role || "user")}
                    <span className="capitalize">{selectedUser?.role}</span>
                  </div>
                </Badge>
              </div>
            </div>
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedUser) {
                    updateUserRole(selectedUser.id, "user");
                    setSelectedUser(null);
                  }
                }}
                className="justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                Usuário
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedUser) {
                    updateUserRole(selectedUser.id, "moderator");
                    setSelectedUser(null);
                  }
                }}
                className="justify-start"
              >
                <Shield className="w-4 h-4 mr-2" />
                Moderador
              </Button>
              <Button
                variant="outline" 
                onClick={() => {
                  if (selectedUser) {
                    updateUserRole(selectedUser.id, "admin");
                    setSelectedUser(null);
                  }
                }}
                className="justify-start"
              >
                <Crown className="w-4 h-4 mr-2" />
                Administrador
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}