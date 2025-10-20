import { useState, useEffect } from "react";
import { Download, Network, Shield, CheckCircle, XCircle, Copy, RefreshCw, AlertCircle, Server, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function VPN() {
  const [vpnConfig, setVpnConfig] = useState<{
    ip: string;
    status: "active" | "inactive";
    configExists: boolean;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simular carregamento de configuração existente
    // Aqui virá a chamada real ao backend
    const mockConfig = {
      ip: "10.8.0.105",
      status: "active" as const,
      configExists: true,
    };
    setVpnConfig(mockConfig);
  }, []);

  const generateVpnConfig = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-vpn-config", {
        body: {},
      });

      if (error) throw error;

      if (data.success) {
        setVpnConfig({
          ip: data.vpn_ip,
          status: "active",
          configExists: true,
        });
        toast.success("Configuração VPN gerada com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao gerar configuração VPN:", error);
      toast.error(error.message || "Erro ao gerar configuração VPN");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadVpnConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-vpn-config", {
        body: { download: true },
      });

      if (error) throw error;

      // Criar blob e fazer download
      const blob = new Blob([data.config_content], { type: "application/x-openvpn-profile" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kryzon.ovpn";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Arquivo .ovpn baixado!");
    } catch (error: any) {
      console.error("Erro ao baixar configuração:", error);
      toast.error("Erro ao baixar configuração");
    }
  };

  const copyIpToClipboard = () => {
    if (vpnConfig?.ip) {
      navigator.clipboard.writeText(vpnConfig.ip);
      toast.success("IP copiado para a área de transferência!");
    }
  };

  const simulateConnection = () => {
    setIsConnected(!isConnected);
    toast.info(isConnected ? "VPN desconectada" : "VPN conectada");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Acesso à Rede Kryzon</h1>
        <p className="text-muted-foreground">
          Conecte-se à VPN para acessar as máquinas e desafios.
        </p>
      </div>

      <Alert className="border-primary/50 bg-primary/10">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          Você precisa estar conectado à VPN para acessar os labs e máquinas CTF.
          Faça o download do arquivo de configuração e conecte-se usando OpenVPN.
        </AlertDescription>
      </Alert>

      {/* Status Card */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            Status da Conexão VPN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-muted-foreground" />
              )}
              <div>
                <p className="font-semibold">
                  {isConnected ? "Conectado" : "Desconectado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? "VPN ativa e funcionando" : "VPN não está ativa"}
                </p>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "outline"}>
              {isConnected ? "Online" : "Offline"}
            </Badge>
          </div>

          {vpnConfig && (
            <div className="mt-4 p-4 rounded-lg border border-border bg-background">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Seu IP VPN</p>
                  <p className="font-mono text-lg font-bold text-primary">
                    {vpnConfig.ip}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyIpToClipboard}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuração Card */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary" />
              Configuração VPN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!vpnConfig?.configExists ? (
              <div className="text-center py-6">
                <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Você ainda não possui uma configuração VPN.
                </p>
                <Button
                  onClick={generateVpnConfig}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Gerar Configuração
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">
                    Configuração VPN ativa
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={downloadVpnConfig}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar arquivo .ovpn
                  </Button>

                  <Button
                    onClick={simulateConnection}
                    variant={isConnected ? "destructive" : "default"}
                    className="w-full gap-2"
                  >
                    <Network className="w-4 h-4" />
                    {isConnected ? "Desconectar" : "Conectar VPN"}
                  </Button>

                  <Button
                    onClick={generateVpnConfig}
                    variant="outline"
                    className="w-full gap-2"
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerar Configuração
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções Card */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle>Como Conectar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  1
                </div>
                <div>
                  <p className="font-medium">Instale o OpenVPN</p>
                  <p className="text-sm text-muted-foreground">
                    Baixe e instale o cliente OpenVPN para seu sistema operacional
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  2
                </div>
                <div>
                  <p className="font-medium">Baixe o arquivo .ovpn</p>
                  <p className="text-sm text-muted-foreground">
                    Clique em "Baixar arquivo .ovpn" para obter sua configuração
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  3
                </div>
                <div>
                  <p className="font-medium">Importe a configuração</p>
                  <p className="text-sm text-muted-foreground">
                    Abra o OpenVPN e importe o arquivo kryzon.ovpn
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  4
                </div>
                <div>
                  <p className="font-medium">Conecte-se</p>
                  <p className="text-sm text-muted-foreground">
                    Clique em conectar e aguarde a conexão ser estabelecida
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium mb-1">💡 Dica</p>
              <p className="text-xs text-muted-foreground">
                Certifique-se de estar conectado à VPN antes de tentar acessar as
                máquinas do laboratório.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle>Informações da Rede</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Subnet VPN</p>
              <p className="font-mono font-semibold">10.8.0.0/24</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Gateway</p>
              <p className="font-mono font-semibold">10.8.0.1</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">DNS</p>
              <p className="font-mono font-semibold">10.8.0.1</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge variant={vpnConfig?.status === "active" ? "default" : "outline"}>
                {vpnConfig?.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Downloads */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Downloads do Cliente VPN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="h-auto flex flex-col items-start p-4 gap-2">
              <div className="flex items-center gap-2 w-full">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <span className="text-xl">🪟</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Windows</p>
                  <p className="text-xs text-muted-foreground">OpenVPN GUI</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto flex flex-col items-start p-4 gap-2">
              <div className="flex items-center gap-2 w-full">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <span className="text-xl">🍎</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">macOS</p>
                  <p className="text-xs text-muted-foreground">Tunnelblick</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto flex flex-col items-start p-4 gap-2">
              <div className="flex items-center gap-2 w-full">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <span className="text-xl">🐧</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Linux</p>
                  <p className="text-xs text-muted-foreground">OpenVPN CLI</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
