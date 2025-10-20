import { useState, useEffect } from "react";
import {
  Settings,
  Server,
  Network,
  Bell,
  Shield,
  Database,
  Clock,
  Users,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlatformSettings {
  general: {
    platform_name: string;
    platform_description: string;
    max_users: number;
    registration_enabled: boolean;
    maintenance_mode: boolean;
    maintenance_message: string;
  };
  machines: {
    max_instance_time: number; // em minutos
    max_concurrent_instances: number;
    auto_destroy_inactive: boolean;
    max_machine_size: number; // em MB
    allowed_categories: string[];
    max_xp_reward: number;
    require_approval: boolean;
  };
  vpn: {
    server_endpoint: string;
    port_range_start: number;
    port_range_end: number;
    max_connections: number;
    session_timeout: number; // em minutos
    allowed_subnets: string[];
    enable_traffic_monitoring: boolean;
  };
  notifications: {
    email_enabled: boolean;
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    webhook_url: string;
    discord_enabled: boolean;
    discord_webhook: string;
    notification_types: {
      machine_approved: boolean;
      machine_rejected: boolean;
      new_user: boolean;
      flag_captured: boolean;
      system_alerts: boolean;
    };
  };
  security: {
    password_min_length: number;
    require_email_verification: boolean;
    max_login_attempts: number;
    lockout_duration: number; // em minutos
    session_duration: number; // em horas
    two_factor_enabled: boolean;
    allowed_domains: string[];
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showPasswords, setShowPasswords] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // Se não existir configuração, usar valores padrão
      const defaultSettings: PlatformSettings = {
        general: {
          platform_name: "Kryzon",
          platform_description: "Plataforma de CTF e Segurança Ofensiva",
          max_users: 1000,
          registration_enabled: true,
          maintenance_mode: false,
          maintenance_message: "Sistema em manutenção. Voltamos em breve!",
        },
        machines: {
          max_instance_time: 120, // 2 horas
          max_concurrent_instances: 3,
          auto_destroy_inactive: true,
          max_machine_size: 2048, // 2GB
          allowed_categories: ["web", "pwn", "reverse", "crypto", "forensics"],
          max_xp_reward: 500,
          require_approval: true,
        },
        vpn: {
          server_endpoint: "vpn.kryzon.local",
          port_range_start: 10000,
          port_range_end: 11000,
          max_connections: 100,
          session_timeout: 240, // 4 horas
          allowed_subnets: ["10.8.0.0/24", "10.9.0.0/24"],
          enable_traffic_monitoring: true,
        },
        notifications: {
          email_enabled: false,
          smtp_host: "",
          smtp_port: 587,
          smtp_username: "",
          smtp_password: "",
          webhook_url: "",
          discord_enabled: false,
          discord_webhook: "",
          notification_types: {
            machine_approved: true,
            machine_rejected: true,
            new_user: true,
            flag_captured: false,
            system_alerts: true,
          },
        },
        security: {
          password_min_length: 8,
          require_email_verification: true,
          max_login_attempts: 5,
          lockout_duration: 15,
          session_duration: 24,
          two_factor_enabled: false,
          allowed_domains: [],
        },
      };

      setSettings(data?.settings || defaultSettings);
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          id: 1, // ID único para configurações
          settings: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setUnsavedChanges(false);
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (category: keyof PlatformSettings, key: string, value: any) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };

    setSettings(newSettings);
    setUnsavedChanges(true);
  };

  const resetToDefaults = async () => {
    if (!confirm("Tem certeza que deseja resetar todas as configurações para os valores padrão?")) {
      return;
    }

    setLoading(true);
    try {
      await fetchSettings(); // Recarrega configurações padrão
      setUnsavedChanges(false);
      toast({
        title: "Sucesso",
        description: "Configurações resetadas para os valores padrão",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-destructive">Erro ao carregar configurações</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações da Plataforma</h1>
          <p className="text-muted-foreground">
            Gerencie todas as configurações do sistema
          </p>
        </div>
        <div className="flex items-center gap-4">
          {unsavedChanges && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              Alterações não salvas
            </Badge>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            <Button onClick={saveSettings} disabled={saving || !unsavedChanges}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>

      {settings.general.maintenance_mode && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Modo de Manutenção Ativo</AlertTitle>
          <AlertDescription>
            A plataforma está em modo de manutenção. Novos usuários não podem se registrar.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="machines">Máquinas</TabsTrigger>
          <TabsTrigger value="vpn">VPN</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Nome da Plataforma</Label>
                  <Input
                    id="platform_name"
                    value={settings.general.platform_name}
                    onChange={(e) => updateSettings("general", "platform_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_users">Máximo de Usuários</Label>
                  <Input
                    id="max_users"
                    type="number"
                    value={settings.general.max_users}
                    onChange={(e) => updateSettings("general", "max_users", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform_description">Descrição da Plataforma</Label>
                <Textarea
                  id="platform_description"
                  value={settings.general.platform_description}
                  onChange={(e) => updateSettings("general", "platform_description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Registro de Novos Usuários</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que novos usuários se registrem
                    </p>
                  </div>
                  <Switch
                    checked={settings.general.registration_enabled}
                    onCheckedChange={(checked) => updateSettings("general", "registration_enabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar modo de manutenção da plataforma
                    </p>
                  </div>
                  <Switch
                    checked={settings.general.maintenance_mode}
                    onCheckedChange={(checked) => updateSettings("general", "maintenance_mode", checked)}
                  />
                </div>
              </div>

              {settings.general.maintenance_mode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenance_message">Mensagem de Manutenção</Label>
                  <Textarea
                    id="maintenance_message"
                    value={settings.general.maintenance_message}
                    onChange={(e) => updateSettings("general", "maintenance_message", e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Máquinas */}
        <TabsContent value="machines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Configurações de Máquinas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_instance_time">Tempo Máximo de Instância (minutos)</Label>
                  <Input
                    id="max_instance_time"
                    type="number"
                    value={settings.machines.max_instance_time}
                    onChange={(e) => updateSettings("machines", "max_instance_time", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_concurrent_instances">Instâncias Simultâneas por Usuário</Label>
                  <Input
                    id="max_concurrent_instances"
                    type="number"
                    value={settings.machines.max_concurrent_instances}
                    onChange={(e) => updateSettings("machines", "max_concurrent_instances", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_machine_size">Tamanho Máximo da Máquina (MB)</Label>
                  <Input
                    id="max_machine_size"
                    type="number"
                    value={settings.machines.max_machine_size}
                    onChange={(e) => updateSettings("machines", "max_machine_size", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_xp_reward">Recompensa Máxima de XP</Label>
                  <Input
                    id="max_xp_reward"
                    type="number"
                    value={settings.machines.max_xp_reward}
                    onChange={(e) => updateSettings("machines", "max_xp_reward", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Destruir Instâncias Inativas Automaticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Remover instâncias sem atividade automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={settings.machines.auto_destroy_inactive}
                    onCheckedChange={(checked) => updateSettings("machines", "auto_destroy_inactive", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requer Aprovação</Label>
                    <p className="text-sm text-muted-foreground">
                      Máquinas precisam ser aprovadas antes de ficarem públicas
                    </p>
                  </div>
                  <Switch
                    checked={settings.machines.require_approval}
                    onCheckedChange={(checked) => updateSettings("machines", "require_approval", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de VPN */}
        <TabsContent value="vpn" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Configurações de VPN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="server_endpoint">Endpoint do Servidor VPN</Label>
                  <Input
                    id="server_endpoint"
                    value={settings.vpn.server_endpoint}
                    onChange={(e) => updateSettings("vpn", "server_endpoint", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_connections">Conexões Máximas</Label>
                  <Input
                    id="max_connections"
                    type="number"
                    value={settings.vpn.max_connections}
                    onChange={(e) => updateSettings("vpn", "max_connections", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="port_range_start">Porta Inicial</Label>
                  <Input
                    id="port_range_start"
                    type="number"
                    value={settings.vpn.port_range_start}
                    onChange={(e) => updateSettings("vpn", "port_range_start", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port_range_end">Porta Final</Label>
                  <Input
                    id="port_range_end"
                    type="number"
                    value={settings.vpn.port_range_end}
                    onChange={(e) => updateSettings("vpn", "port_range_end", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_timeout">Timeout da Sessão (minutos)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={settings.vpn.session_timeout}
                  onChange={(e) => updateSettings("vpn", "session_timeout", parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Monitoramento de Tráfego</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar monitoramento de tráfego VPN
                  </p>
                </div>
                <Switch
                  checked={settings.vpn.enable_traffic_monitoring}
                  onCheckedChange={(checked) => updateSettings("vpn", "enable_traffic_monitoring", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-mail Habilitado</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar notificações por e-mail
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email_enabled}
                  onCheckedChange={(checked) => updateSettings("notifications", "email_enabled", checked)}
                />
              </div>

              {settings.notifications.email_enabled && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host">Servidor SMTP</Label>
                      <Input
                        id="smtp_host"
                        value={settings.notifications.smtp_host}
                        onChange={(e) => updateSettings("notifications", "smtp_host", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">Porta SMTP</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        value={settings.notifications.smtp_port}
                        onChange={(e) => updateSettings("notifications", "smtp_port", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_username">Usuário SMTP</Label>
                      <Input
                        id="smtp_username"
                        value={settings.notifications.smtp_username}
                        onChange={(e) => updateSettings("notifications", "smtp_username", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_password">Senha SMTP</Label>
                      <div className="relative">
                        <Input
                          id="smtp_password"
                          type={showPasswords ? "text" : "password"}
                          value={settings.notifications.smtp_password}
                          onChange={(e) => updateSettings("notifications", "smtp_password", e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Discord Habilitado</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar notificações via Discord
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.discord_enabled}
                  onCheckedChange={(checked) => updateSettings("notifications", "discord_enabled", checked)}
                />
              </div>

              {settings.notifications.discord_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="discord_webhook">Webhook do Discord</Label>
                  <Input
                    id="discord_webhook"
                    value={settings.notifications.discord_webhook}
                    onChange={(e) => updateSettings("notifications", "discord_webhook", e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                  />
                </div>
              )}

              <div className="space-y-4">
                <Label>Tipos de Notificação</Label>
                <div className="space-y-3">
                  {Object.entries(settings.notifications.notification_types).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="capitalize">
                        {key.replace(/_/g, ' ')}
                      </Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => {
                          const newTypes = { ...settings.notifications.notification_types };
                          newTypes[key as keyof typeof newTypes] = checked;
                          updateSettings("notifications", "notification_types", newTypes);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password_min_length">Comprimento Mínimo da Senha</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    min="6"
                    max="50"
                    value={settings.security.password_min_length}
                    onChange={(e) => updateSettings("security", "password_min_length", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Máximo de Tentativas de Login</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    value={settings.security.max_login_attempts}
                    onChange={(e) => updateSettings("security", "max_login_attempts", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lockout_duration">Duração do Bloqueio (minutos)</Label>
                  <Input
                    id="lockout_duration"
                    type="number"
                    value={settings.security.lockout_duration}
                    onChange={(e) => updateSettings("security", "lockout_duration", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_duration">Duração da Sessão (horas)</Label>
                  <Input
                    id="session_duration"
                    type="number"
                    value={settings.security.session_duration}
                    onChange={(e) => updateSettings("security", "session_duration", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verificação de E-mail Obrigatória</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir verificação de e-mail no registro
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.require_email_verification}
                    onCheckedChange={(checked) => updateSettings("security", "require_email_verification", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar 2FA para administradores
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.two_factor_enabled}
                    onCheckedChange={(checked) => updateSettings("security", "two_factor_enabled", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}