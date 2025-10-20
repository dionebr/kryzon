import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Server, Calendar, Trophy, User, Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const machines = [
  {
    id: "lab1",
    name: "Lab1 - LFI",
    difficulty: "Fácil",
    category: "Web",
    releaseDate: "19 October, 2025",
    xp: 50,
    ip: "10.8.0.10",
    creator: { name: "Kryzon", avatar: "K" },
    firstBlood: null,
    started: false,
  },
  {
    id: "lab2",
    name: "Lab2 - SQLi",
    difficulty: "Fácil",
    category: "Web",
    releaseDate: "19 October, 2025",
    xp: 50,
    ip: "10.8.0.11",
    creator: { name: "Kryzon", avatar: "K" },
    firstBlood: null,
    started: false,
  },
  {
    id: "lab3",
    name: "Lab3 - XSS",
    difficulty: "Fácil",
    category: "Web",
    releaseDate: "19 October, 2025",
    xp: 50,
    ip: "10.8.0.12",
    creator: { name: "Kryzon", avatar: "K" },
    firstBlood: null,
    started: false,
  },
];

const difficultyColors: Record<string, string> = {
  Fácil: "border-primary text-primary",
  Médio: "border-yellow-500 text-yellow-500",
  Difícil: "border-destructive text-destructive",
};

export default function Machines() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    difficulty: "all",
    category: "all",
    status: "all",
  });

  const filteredMachines = machines.filter((machine) => {
    if (filters.difficulty !== "all" && machine.difficulty !== filters.difficulty) return false;
    if (filters.category !== "all" && machine.category !== filters.category) return false;
    if (filters.status !== "all") {
      if (filters.status === "started" && !machine.started) return false;
      if (filters.status === "not-started" && machine.started) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilters({ difficulty: "all", category: "all", status: "all" });
  };

  const hasActiveFilters = filters.difficulty !== "all" || filters.category !== "all" || filters.status !== "all";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Máquinas CTF</h1>
          <p className="text-muted-foreground">
            Explore e domine as máquinas vulneráveis disponíveis.
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 px-1.5 py-0 h-5 text-xs">
                  {Object.values(filters).filter(v => v !== "all").length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filtros</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Limpar
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Dificuldade</label>
                  <Select value={filters.difficulty} onValueChange={(v) => setFilters({...filters, difficulty: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Fácil">Fácil</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Difícil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Categoria</label>
                  <Select value={filters.category} onValueChange={(v) => setFilters({...filters, category: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Web">Web</SelectItem>
                      <SelectItem value="Pwn">Pwn</SelectItem>
                      <SelectItem value="Crypto">Crypto</SelectItem>
                      <SelectItem value="Reverse">Reverse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="started">Iniciados</SelectItem>
                      <SelectItem value="not-started">Não Iniciados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMachines.map((machine) => (
          <Card
            key={machine.id}
            className="gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(`/machines/${machine.id}`)}
          >
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Server className="w-8 h-8 text-primary-foreground" />
                </div>
                {!machine.started && (
                  <Badge
                    variant="outline"
                    className="border-yellow-500 text-yellow-500"
                  >
                    Não Iniciado
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">{machine.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={difficultyColors[machine.difficulty]}
                  >
                    {machine.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-secondary text-secondary">
                    {machine.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Data de Lançamento</span>
                </div>
              </div>
              <p className="text-sm font-medium">{machine.releaseDate}</p>

              <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {machine.creator.avatar}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Criador</p>
                    <p className="font-medium">{machine.creator.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total de XP</p>
                  <p className="font-bold text-primary">{machine.xp} XP</p>
                </div>
              </div>

              {machine.firstBlood && (
                <div className="flex items-center gap-2 text-sm pt-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-muted-foreground">First Blood:</span>
                  <span className="font-medium">{machine.firstBlood}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
