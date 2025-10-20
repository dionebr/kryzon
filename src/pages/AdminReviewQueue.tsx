import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  Server, 
  AlertTriangle,
  Clock,
  User,
  Filter,
  RefreshCw,
  MessageSquare,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PendingMachine {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
  creator: {
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
  flags_count: number;
  files_count: number;
  priority: "low" | "normal" | "high" | "urgent";
  validation_status: "pending" | "testing" | "review";
}

export default function AdminReviewQueue() {
  const [machines, setMachines] = useState<PendingMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<PendingMachine | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState({
    priority: "all",
    category: "all",
    difficulty: "all",
    search: "",
  });

  useEffect(() => {
    fetchPendingMachines();
  }, [filters]);

  const fetchPendingMachines = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('machines')
        .select(`
          *,
          creator:profiles!creator_id(username, avatar_url),
          flags_count:machine_flags(count),
          files_count:machine_files(count)
        `)
        .eq('status', 'pending');
      
      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.category !== "all") {
        query = query.eq('category', filters.category);
      }
      if (filters.difficulty !== "all") {
        query = query.eq('difficulty', filters.difficulty);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;

      // Processar dados e determinar prioridade
      const processedMachines = data?.map(machine => ({
        ...machine,
        flags_count: machine.flags_count?.length || 0,
        files_count: machine.files_count?.length || 0,
        priority: determinePriority(machine),
        validation_status: "pending" as const,
      })) || [];

      setMachines(processedMachines);
    } catch (error) {
      console.error("Erro ao buscar máquinas pendentes:", error);
      toast.error("Erro ao carregar fila de revisão");
    } finally {
      setLoading(false);
    }
  };

  const determinePriority = (machine: any): "low" | "normal" | "high" | "urgent" => {
    const daysSinceSubmission = Math.floor(
      (Date.now() - new Date(machine.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceSubmission >= 7) return "urgent";
    if (daysSinceSubmission >= 3) return "high";
    if (daysSinceSubmission >= 1) return "normal";
    return "low";
  };

  const handleApprove = async (machine: PendingMachine) => {
    setIsProcessing(true);
    try {
      await supabase.functions.invoke('approve-machine', {
        body: { machineId: machine.id, action: 'approve' }
      });
      
      toast.success(`Máquina "${machine.name}" aprovada com sucesso!`, {
        description: "O criador será notificado automaticamente.",
      });
      
      fetchPendingMachines();
    } catch (error) {
      console.error("Erro ao aprovar máquina:", error);
      toast.error("Erro ao aprovar máquina", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (machine: PendingMachine) => {
    if (!feedback.trim()) {
      toast.error("Feedback obrigatório", {
        description: "Por favor, forneça um feedback detalhado para a rejeição.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await supabase.functions.invoke('approve-machine', {
        body: { machineId: machine.id, action: 'reject', feedback }
      });
      
      toast.info(`Máquina "${machine.name}" rejeitada`, {
        description: "Feedback enviado ao criador.",
      });
      setFeedback("");
      setSelectedMachine(null);
      fetchPendingMachines();
    } catch (error) {
      console.error("Erro ao rejeitar máquina:", error);
      toast.error("Erro ao rejeitar máquina", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startTesting = async (machineId: string) => {
    try {
      await supabase.functions.invoke('manage-instance', {
        body: { machineId, action: 'create' }
      });
      
      toast.success("Instância de teste criada", {
        description: "Você pode agora testar a máquina.",
      });
    } catch (error) {
      console.error("Erro ao criar instância de teste:", error);
      toast.error("Erro ao criar instância de teste");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/10 text-red-500 border-red-500";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500";
      case "normal": return "bg-blue-500/10 text-blue-500 border-blue-500";
      case "low": return "bg-green-500/10 text-green-500 border-green-500";
      default: return "bg-muted text-muted-foreground";
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fila de Revisão</h1>
          <p className="text-muted-foreground mt-1">
            Revise e aprove máquinas pendentes - {machines.length} na fila
          </p>
        </div>
        <Button onClick={fetchPendingMachines} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Buscar máquinas..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters({ ...filters, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Atenção Moderadores</AlertTitle>
        <AlertDescription>
          Teste todas as máquinas completamente antes de aprovar. Verifique a qualidade
          das flags, descrições e arquivos anexados.
        </AlertDescription>
      </Alert>

      {loading && (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && machines.length === 0 && (
        <Card className="gradient-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhuma máquina pendente</p>
            <p className="text-sm text-muted-foreground">
              Todas as submissões foram revisadas!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {machines.map((machine) => (
          <Card
            key={machine.id}
            className="gradient-card border-border hover:border-primary/50 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{machine.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Criador: {machine.creator}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{machine.category}</Badge>
                    <Badge variant="outline" className={getDifficultyColor(machine.difficulty)}>
                      {machine.difficulty}
                    </Badge>
                    <Badge variant="outline">{machine.xp_reward} XP</Badge>
                    <Badge variant="outline" className={getPriorityColor(machine.priority)}>
                      {machine.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    Pendente
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(machine.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{machine.description}</p>
              
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{machine.creator?.username}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{machine.flags_count} flags</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{machine.files_count} anexos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(machine.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{machine.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Descrição</h4>
                        <p className="text-sm text-muted-foreground">{machine.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Categoria</p>
                          <p className="text-sm text-muted-foreground">{machine.category}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Dificuldade</p>
                          <p className="text-sm text-muted-foreground">{machine.difficulty}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">XP Total</p>
                          <p className="text-sm text-muted-foreground">{machine.xp} XP</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download VM
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => startTesting(machine.id)}
                >
                  <Play className="w-4 h-4" />
                  Testar Instância
                </Button>

                <div className="flex-1" />

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => setSelectedMachine(machine)}
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rejeitar Máquina</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="feedback">Feedback (obrigatório)</Label>
                        <Textarea
                          id="feedback"
                          placeholder="Explique o motivo da rejeição..."
                          rows={4}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(machine)}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        Confirmar Rejeição
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => handleApprove(machine)}
                  disabled={isProcessing}
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprovar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
