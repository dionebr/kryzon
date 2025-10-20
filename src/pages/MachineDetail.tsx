import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Power,
  Send,
  Clock,
  Trophy,
  User,
  Calendar,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function MachineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flag, setFlag] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const machine = {
    name: "Lab1 - LFI",
    difficulty: "Fácil",
    category: "Web",
    ip: "10.8.0.10",
    releaseDate: "19 October, 2025",
    xp: 50,
    creator: { name: "Kryzon", avatar: "K" },
    firstBlood: null,
    progress: 0,
    flags: { captured: 0, total: 1 },
    description:
      "Esta máquina apresenta uma vulnerabilidade de Local File Inclusion (LFI). Explore o sistema de arquivos e encontre informações sensíveis.",
  };

  const handleStartMachine = () => {
    setIsRunning(true);
    toast.success("Máquina iniciada com sucesso!");
  };

  const handleStopMachine = () => {
    setIsRunning(false);
    toast.info("Máquina desligada.");
  };

  const handleSubmitFlag = () => {
    if (!flag.trim()) {
      toast.error("Por favor, insira uma flag.");
      return;
    }
    
    // Simulação de validação de flag
    if (flag.includes("FLAG") || flag.includes("flag{")) {
      toast.success("Flag correta! Parabéns! 🎉");
      setFlag("");
    } else {
      toast.error("Flag incorreta. Tente novamente.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/machines")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{machine.name}</h1>
          <p className="text-muted-foreground mt-1">{machine.description}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Controle da Instância</span>
                <Button
                  variant={isRunning ? "destructive" : "default"}
                  onClick={isRunning ? handleStopMachine : handleStartMachine}
                  className={
                    !isRunning
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : ""
                  }
                >
                  <Power className="w-4 h-4 mr-2" />
                  {isRunning ? "Desligar Instância" : "Iniciar Instância"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRunning && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Endereço IP</span>
                    <Badge className="bg-primary text-primary-foreground">
                      {machine.ip}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use este IP para acessar a máquina através da VPN.
                  </p>
                </div>
              )}

              {!isRunning && (
                <div className="text-center py-8 text-muted-foreground">
                  <Power className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>A máquina está desligada.</p>
                  <p className="text-sm mt-2">
                    Clique em "Iniciar Instância" para começar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Enviar Flag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="kryzon{FLAG}"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitFlag()}
                  className="font-mono"
                  disabled={!isRunning}
                />
                <Button
                  onClick={handleSubmitFlag}
                  disabled={!isRunning}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {!isRunning && (
                <p className="text-xs text-muted-foreground mt-2">
                  Inicie a máquina para enviar flags.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary" />
                Anexos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">lab1-hints.txt</p>
                  <p className="text-xs text-muted-foreground">
                    Dicas para resolver o desafio
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Tempo Restante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {isRunning ? "02:00:00" : "--:--:--"}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  A instância será desligada automaticamente
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Seu progresso nesta máquina
                </p>
                <Progress value={machine.progress} className="h-2 mb-2" />
                <p className="text-sm font-medium">{machine.progress}%</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Flags</p>
                <p className="font-medium">
                  {machine.flags.captured}/{machine.flags.total}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-primary text-primary"
                >
                  {machine.difficulty}
                </Badge>
                <Badge variant="outline" className="border-secondary text-secondary">
                  {machine.category}
                </Badge>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Lançamento:</span>
                  <span className="font-medium">{machine.releaseDate}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Criador:</span>
                  <span className="font-medium">{machine.creator.name}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">XP Total:</span>
                  <span className="font-bold text-primary">{machine.xp} XP</span>
                </div>

                {machine.firstBlood && (
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-muted-foreground">First Blood:</span>
                    <span className="font-medium">{machine.firstBlood}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
