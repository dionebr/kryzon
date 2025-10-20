import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Eye, 
  EyeOff,
  Save,
  Upload
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function UserSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estado para configurações
  const [settings, setSettings] = useState({
    // Perfil
    username: user?.user_metadata?.username || "",
    email: user?.email || "",
    fullName: user?.user_metadata?.full_name || "",
    bio: user?.user_metadata?.bio || "",
    
    // Notificações
    emailNotifications: true,
    browserNotifications: true,
    machineApprovalNotifications: true,
    challengeNotifications: true,
    rankingNotifications: false,
    
    // Privacidade
    profileVisibility: "public",
    showEmail: false,
    showRanking: true,
    showStats: true,
    
    // Aparência
    theme: "dark",
    language: "pt-BR",
    
    // Segurança
    twoFactorEnabled: false,
    passwordChangeRequired: false,
  });

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      // Simular save - integrar com Supabase posteriormente
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Configurações de ${section} salvas com sucesso!`);
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = () => {
    // Implementar upload de avatar
    toast.info("Funcionalidade em desenvolvimento");
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="outline"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
            onClick={handleAvatarUpload}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações de conta
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidade
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e de perfil público
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input
                    id="username"
                    value={settings.username}
                    onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="seu_usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={settings.fullName}
                  onChange={(e) => setSettings(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Seu Nome Completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Input
                  id="bio"
                  value={settings.bio}
                  onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Fale um pouco sobre você..."
                />
              </div>
              <Button onClick={() => handleSave("perfil")} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure quando e como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações importantes por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações do navegador</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações push no navegador
                    </p>
                  </div>
                  <Switch
                    checked={settings.browserNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, browserNotifications: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aprovação de máquinas</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre aprovação/rejeição de máquinas
                    </p>
                  </div>
                  <Switch
                    checked={settings.machineApprovalNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, machineApprovalNotifications: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Novos desafios</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre novos desafios disponíveis
                    </p>
                  </div>
                  <Switch
                    checked={settings.challengeNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, challengeNotifications: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mudanças no ranking</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre mudanças na sua posição no ranking
                    </p>
                  </div>
                  <Switch
                    checked={settings.rankingNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, rankingNotifications: checked }))
                    }
                  />
                </div>
              </div>
              <Button onClick={() => handleSave("notificações")} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Privacidade</CardTitle>
              <CardDescription>
                Controle quais informações são visíveis para outros usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar email no perfil</Label>
                    <p className="text-sm text-muted-foreground">
                      Outros usuários podem ver seu email
                    </p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, showEmail: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar posição no ranking</Label>
                    <p className="text-sm text-muted-foreground">
                      Sua posição será visível nos rankings públicos
                    </p>
                  </div>
                  <Switch
                    checked={settings.showRanking}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, showRanking: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar estatísticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Suas estatísticas de desempenho serão públicas
                    </p>
                  </div>
                  <Switch
                    checked={settings.showStats}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, showStats: checked }))
                    }
                  />
                </div>
              </div>
              <Button onClick={() => handleSave("privacidade")} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência e Idioma</CardTitle>
              <CardDescription>
                Personalize a aparência da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={settings.theme === "light" ? "default" : "outline"}
                      onClick={() => setSettings(prev => ({ ...prev, theme: "light" }))}
                    >
                      Claro
                    </Button>
                    <Button
                      variant={settings.theme === "dark" ? "default" : "outline"}
                      onClick={() => setSettings(prev => ({ ...prev, theme: "dark" }))}
                    >
                      Escuro
                    </Button>
                    <Button
                      variant={settings.theme === "system" ? "default" : "outline"}
                      onClick={() => setSettings(prev => ({ ...prev, theme: "system" }))}
                    >
                      Sistema
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={settings.language === "pt-BR" ? "default" : "outline"}
                      onClick={() => setSettings(prev => ({ ...prev, language: "pt-BR" }))}
                    >
                      🇧🇷 Português
                    </Button>
                    <Button
                      variant={settings.language === "en-US" ? "default" : "outline"}
                      onClick={() => setSettings(prev => ({ ...prev, language: "en-US" }))}
                    >
                      🇺🇸 English
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSave("aparência")} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Alterar senha</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button variant="outline">Alterar</Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label>Autenticação de dois fatores</Label>
                      {settings.twoFactorEnabled && (
                        <Badge variant="secondary" className="text-xs">
                          Ativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, twoFactorEnabled: checked }))
                    }
                  />
                </div>
              </div>
              <Button onClick={() => handleSave("segurança")} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}