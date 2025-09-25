import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, Plus, User, Shield, Trash2, Youtube, Rss, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types for settings and users
interface SettingsData {
  platform_welcome_title: string;
  platform_welcome_message: string;
  youtube_playlist_url: string;
  blog_rss_url: string;
  hotmart_course_url: string;
  hotmart_coupon_code: string;
  whatsapp_notifications: boolean;
  email_notifications: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    platform_welcome_title: "",
    platform_welcome_message: "",
    youtube_playlist_url: "",
    blog_rss_url: "",
    hotmart_course_url: "",
    hotmart_coupon_code: "",
    whatsapp_notifications: true,
    email_notifications: true
  });

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    role: "user" as "admin" | "moderator" | "user"
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    loadAdmins();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      const settingsObj: any = {};
      data?.forEach(item => {
        settingsObj[item.key] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
      });

      setSettings({
        platform_welcome_title: settingsObj.platform_welcome_title || "",
        platform_welcome_message: settingsObj.platform_welcome_message || "",
        youtube_playlist_url: settingsObj.youtube_playlist_url || "",
        blog_rss_url: settingsObj.blog_rss_url || "",
        hotmart_course_url: settingsObj.hotmart_course_url || "",
        hotmart_coupon_code: settingsObj.hotmart_coupon_code || "",
        whatsapp_notifications: settingsObj.whatsapp_notifications ?? true,
        email_notifications: settingsObj.email_notifications ?? true
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive"
      });
    }
  };

  const loadAdmins = async () => {
    try {
      // Get profiles with admin/moderator roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'moderator']);

      if (rolesError) throw rolesError;

      // Combine data and filter only admin/moderator users
      const adminUserIds = rolesData?.map(r => r.user_id) || [];
      const adminProfiles = profilesData?.filter(p => adminUserIds.includes(p.user_id)) || [];

      // Get auth user data for emails
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      const authUsers = authData?.users || [];

      const adminList: AdminUser[] = adminProfiles.map(profile => {
        const role = rolesData?.find(r => r.user_id === profile.user_id)?.role || 'user';
        const authUser = authUsers.find(u => u.id === profile.user_id);
        
        return {
          id: profile.user_id,
          email: authUser?.email || '',
          display_name: profile.display_name || '',
          role,
          created_at: profile.created_at
        };
      });

      setAdmins(adminList);
    } catch (error) {
      console.error('Error loading admins:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar administradores",
        variant: "destructive"
      });
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: JSON.stringify(value)
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' });
        
        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      // First, invite the user
      const { data: userData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        newAdmin.email,
        {
          redirectTo: `${window.location.origin}/auth`
        }
      );

      if (inviteError && !inviteError.message.includes('already registered')) {
        throw inviteError;
      }

      // Get user ID
      let userId = userData?.user?.id;
      if (!userId) {
        const { data: authData } = await supabase.auth.admin.listUsers();
        const authUsers = authData?.users || [];
        const existingUser = authUsers.find(u => u.email === newAdmin.email);
        userId = existingUser?.id;
      }

      if (userId) {
        // Add role to user_roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: newAdmin.role
          });

        if (roleError) throw roleError;

        toast({
          title: "Sucesso",
          description: "Administrador adicionado com sucesso!"
        });

        setNewAdmin({ email: "", role: "user" });
        setIsAddAdminDialogOpen(false);
        loadAdmins();
      }
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar administrador",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Administrador removido com sucesso!"
      });

      loadAdmins();
    } catch (error: any) {
      console.error('Error removing admin:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover administrador",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-gradient-primary text-primary-foreground">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline">
        <User className="w-3 h-3 mr-1" />
        Moderador
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações Gerais</h1>
          <p className="text-muted-foreground">
            Configure as opções gerais da plataforma e gerencie administradores
          </p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
          className="bg-gradient-primary text-primary-foreground shadow-elegant"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Textos da Plataforma */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Textos da Plataforma
            </CardTitle>
            <CardDescription>
              Configure os textos exibidos no painel do aluno
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="welcomeTitle">Título de Boas-vindas</Label>
              <Input
                id="welcomeTitle"
                value={settings.platform_welcome_title}
                onChange={(e) => setSettings({...settings, platform_welcome_title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcomeMessage"
                value={settings.platform_welcome_message}
                onChange={(e) => setSettings({...settings, platform_welcome_message: e.target.value})}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Links Externos */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-primary" />
              Links Externos
            </CardTitle>
            <CardDescription>
              Configure os links para conteúdos externos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="youtubePlaylist" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                Playlist Principal YouTube
              </Label>
              <Input
                id="youtubePlaylist"
                value={settings.youtube_playlist_url}
                onChange={(e) => setSettings({...settings, youtube_playlist_url: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="blogFeedUrl" className="flex items-center gap-2">
                <Rss className="h-4 w-4" />
                Feed RSS do Blog
              </Label>
              <Input
                id="blogFeedUrl"
                value={settings.blog_rss_url}
                onChange={(e) => setSettings({...settings, blog_rss_url: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hotmartCourseUrl" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                URL Principal Hotmart
              </Label>
              <Input
                id="hotmartCourseUrl"
                value={settings.hotmart_course_url}
                onChange={(e) => setSettings({...settings, hotmart_course_url: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hotmartCoupon">Cupom de Desconto Padrão</Label>
              <Input
                id="hotmartCoupon"
                value={settings.hotmart_coupon_code}
                onChange={(e) => setSettings({...settings, hotmart_coupon_code: e.target.value})}
                placeholder="Ex: ABNP10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações de Notificação */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Configurações de Notificação</CardTitle>
          <CardDescription>
            Configure as opções de comunicação com os usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Notificações por WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar envio de mensagens via WhatsApp
                </p>
              </div>
              <Switch
                checked={settings.whatsapp_notifications}
                onCheckedChange={(checked) => setSettings({...settings, whatsapp_notifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar envio de emails promocionais
                </p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciamento de Administradores */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Administradores
              </CardTitle>
              <CardDescription>
                Gerencie os usuários com acesso administrativo
              </CardDescription>
            </div>
            <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Administrador</DialogTitle>
                  <DialogDescription>
                    Convide um usuário para acesso administrativo
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                      placeholder="usuario@exemplo.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adminRole">Função</Label>
                    <Select
                      value={newAdmin.role}
                      onValueChange={(value: "admin" | "moderator" | "user") => 
                        setNewAdmin({...newAdmin, role: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddAdminDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddAdmin} 
                    className="bg-gradient-primary text-primary-foreground"
                    disabled={!newAdmin.email}
                  >
                    Convidar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-card-hover transition-smooth">
                    <TableCell className="font-medium">{admin.display_name || 'N/A'}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{getRoleBadge(admin.role)}</TableCell>
                    <TableCell>{new Date(admin.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveAdmin(admin.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}