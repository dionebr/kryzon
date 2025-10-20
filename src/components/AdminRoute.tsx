import React from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: "moderator" | "admin";
}

export function AdminRoute({ children, requiredRole = "moderator" }: AdminRouteProps) {
  const { userRole, loading, canAccess, isAdmin, isModerator } = useAdminRole();

  // Mostrar loading enquanto verifica permissões
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não tem role ou não pode acessar, redirecionar ou mostrar erro
  if (!userRole || !canAccess(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Permissões Insuficientes</AlertTitle>
              <AlertDescription>
                {!userRole 
                  ? "Não foi possível verificar suas permissões. Tente fazer login novamente."
                  : `Você precisa ter privilégios de ${requiredRole === "admin" ? "administrador" : "moderador"} para acessar esta área.`
                }
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Seu nível atual: <span className="font-medium capitalize">{userRole?.role || "Desconhecido"}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Nível necessário: <span className="font-medium capitalize">{requiredRole}</span>
              </p>
            </div>

            <Button 
              onClick={() => window.history.back()} 
              variant="outline" 
              className="w-full"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  return <>{children}</>;
}

// Componente helper para verificar se usuário é admin
export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute requiredRole="admin">
      {children}
    </AdminRoute>
  );
}

// Componente helper para verificar se usuário é moderador ou admin
export function ModeratorRoute({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute requiredRole="moderator">
      {children}
    </AdminRoute>
  );
}