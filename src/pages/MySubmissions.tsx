import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, CheckCircle, XCircle, Eye, Edit, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MySubmissions() {
  const navigate = useNavigate();

  const submissions = [
    {
      id: 1,
      name: "Lab4 - Buffer Overflow",
      status: "pending",
      submittedAt: "2025-10-15",
      category: "Pwn",
      difficulty: "Médio",
      views: 12,
      feedback: null,
    },
    {
      id: 2,
      name: "Lab5 - JWT Bypass",
      status: "approved",
      submittedAt: "2025-10-10",
      category: "Web",
      difficulty: "Difícil",
      views: 45,
      feedback: "Excelente máquina! Muito educativa.",
    },
    {
      id: 3,
      name: "Lab6 - Race Condition",
      status: "rejected",
      submittedAt: "2025-10-08",
      category: "Web",
      difficulty: "Médio",
      views: 8,
      feedback: "A flag é muito previsível. Considere torná-la mais complexa.",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-500";
      case "approved":
        return "border-green-500 text-green-500";
      case "rejected":
        return "border-destructive text-destructive";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Em Revisão";
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Submissões</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as máquinas que você criou
          </p>
        </div>
        <Button onClick={() => navigate("/machines/create")} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Máquina
        </Button>
      </div>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card
            key={submission.id}
            className="gradient-card border-border hover:border-primary/50 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{submission.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{submission.category}</Badge>
                    <Badge variant="outline">{submission.difficulty}</Badge>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(submission.status)}>
                  <span className="mr-1">{getStatusIcon(submission.status)}</span>
                  {getStatusText(submission.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Enviado em: {submission.submittedAt}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {submission.views} visualizações
                </span>
              </div>
              {submission.feedback && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm font-medium mb-1">Feedback:</p>
                  <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{submission.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Descrição</h4>
                        <p className="text-sm text-muted-foreground">
                          {submission.category === "Web" 
                            ? "Máquina focada em vulnerabilidades web modernas e exploração de aplicações."
                            : "Máquina focada em exploração de binários e técnicas de pwn."}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Categoria</p>
                          <p className="text-sm text-muted-foreground">{submission.category}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Dificuldade</p>
                          <p className="text-sm text-muted-foreground">{submission.difficulty}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Visualizações</p>
                          <p className="text-sm text-muted-foreground">{submission.views}</p>
                        </div>
                      </div>
                      {submission.feedback && (
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                          <p className="text-sm font-medium mb-1">Feedback:</p>
                          <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                {submission.status === "approved" && (
                  <>
                    <Button variant="outline" size="sm" className="gap-2">
                      <BarChart className="w-4 h-4" />
                      Estatísticas
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                  </>
                )}
                {submission.status === "rejected" && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Revisar e Reenviar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
