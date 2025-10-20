import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Server,
  Users,
  Calendar,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

interface Machine {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "pending" | "approved" | "rejected";
  xp_reward: number;
  creator_id: string;
  creator: {
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
  solves_count: number;
  views_count: number;
  rating: number;
}

interface Filters {
  search: string;
  status: string;
  category: string;
  difficulty: string;
  creator: string;
}

export default function AdminMachines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    category: "all",
    difficulty: "all",
    creator: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMachines();
  }, [filters]);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('machines')
        .select(`
          *,
          creator:profiles!creator_id(username, avatar_url),
          solves_count:user_solves(count),
          views_count:machine_views(count)
        `);

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.status !== "all") {
        query = query.eq('status', filters.status);
      }
      if (filters.category !== "all") {
        query = query.eq('category', filters.category);
      }
      if (filters.difficulty !== "all") {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.creator) {
        query = query.eq('creator_id', filters.creator);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Processar dados para incluir contadores
      const processedMachines = data?.map(machine => ({
        ...machine,
        solves_count: machine.solves_count?.length || 0,
        views_count: machine.views_count?.length || 0,
        rating: 0, // TODO: Implementar sistema de rating
      })) || [];

      setMachines(processedMachines);
    } catch (error) {
      console.error("Erro ao buscar máquinas:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar máquinas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: "approve" | "reject" | "delete") => {
    if (selectedMachines.length === 0) return;

    try {
      switch (action) {
        case "approve":
          await supabase
            .from('machines')
            .update({ status: 'approved' })
            .in('id', selectedMachines);
          toast({
            title: "Sucesso",
            description: `${selectedMachines.length} máquinas aprovadas`,
          });
          break;
        case "reject":
          await supabase
            .from('machines')
            .update({ status: 'rejected' })
            .in('id', selectedMachines);
          toast({
            title: "Sucesso", 
            description: `${selectedMachines.length} máquinas rejeitadas`,
          });
          break;
        case "delete":
          await supabase
            .from('machines')
            .delete()
            .in('id', selectedMachines);
          toast({
            title: "Sucesso",
            description: `${selectedMachines.length} máquinas deletadas`,
          });
          break;
      }
      setSelectedMachines([]);
      fetchMachines();
    } catch (error) {
      console.error("Erro na ação em massa:", error);
      toast({
        title: "Erro",
        description: "Erro ao executar ação",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/10 text-green-500 border-green-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500"; 
      case "hard": return "bg-red-500/10 text-red-500 border-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/10 text-green-500 border-green-500";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500";
      case "rejected": return "bg-red-500/10 text-red-500 border-red-500";
      case "draft": return "bg-gray-500/10 text-gray-500 border-gray-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Máquinas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as máquinas da plataforma
          </p>
        </div>
        <Button onClick={() => window.open('/machines/create', '_blank')}>
          <Server className="w-4 h-4 mr-2" />
          Nova Máquina  
        </Button>
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
                placeholder="Buscar máquinas..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="pwn">Pwn</SelectItem>
                <SelectItem value="reverse">Reverse</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="forensics">Forensics</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.difficulty}
              onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Dificuldades</SelectItem>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setFilters({ search: "", status: "all", category: "all", difficulty: "all", creator: "" })}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações em Massa */}
      {selectedMachines.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedMachines.length} máquinas selecionadas
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("approve")}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction("reject")}
                  className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá deletar permanentemente {selectedMachines.length} máquinas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("delete")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Máquinas */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedMachines.length === machines.length && machines.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMachines(machines.map(m => m.id));
                      } else {
                        setSelectedMachines([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Criador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Estatísticas</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={10}>
                      <div className="h-12 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                machines.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMachines.includes(machine.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMachines([...selectedMachines, machine.id]);
                          } else {
                            setSelectedMachines(selectedMachines.filter(id => id !== machine.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{machine.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {machine.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-3 h-3" />
                        </div>
                        <span className="text-sm">{machine.creator?.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(machine.status)}>
                        {machine.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{machine.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getDifficultyColor(machine.difficulty)}>
                        {machine.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{machine.xp_reward} XP</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{machine.views_count} visualizações</div>
                        <div>{machine.solves_count} soluções</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(machine.created_at).toLocaleDateString('pt-BR')}
                      </div>
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
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
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
    </div>
  );
}