import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Save, Plus, User, Shield, Trash2, Youtube, Rss, ShoppingCart } from "lucide-react";

// Mock data - será substituído pela integração com Supabase
const mockAdmins = [
  {
    id: 1,
    name: "Admin Principal",
    email: "admin@abnp.com.br",
    role: "super_admin",
    created_at: "2024-01-01"
  },
  {
    id: 2,
    name: "João Silva",
    email: "joao@abnp.com.br", 
    role: "admin",
    created_at: "2024-01-15"
  }
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    welcomeTitle: "Bem-vindo à Academia ABNP",
    welcomeMessage: "Explore nossos conteúdos gratuitos sobre Neurociência Política e desenvolva suas habilidades.",
    youtubePlaylist: "https://www.youtube.com/playlist?list=PLxxxx",
    blogFeedUrl: "https://academiadaneuropolitica.com.br/feed/",
    hotmartCourseUrl: "https://hotmart.com/pt-br/marketplace/produtos/metodo-neurocp/U100302649X",
    hotmartCoupon: "ABNP10",
    enableWhatsApp: true,
    enableEmailNotifications: true
  });

  const [admins] = useState(mockAdmins);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    role: "admin"
  });

  const handleSaveSettings = () => {
    // Aqui será implementada a lógica para salvar no Supabase
    console.log("Configurações salvas:", settings);
  };

  const handleAddAdmin = () => {
    // Aqui será implementada a lógica para adicionar admin no Supabase
    console.log("Novo admin:", newAdmin);
    setNewAdmin({ name: "", email: "", role: "admin" });
    setIsAddAdminDialogOpen(false);
  };

  const getRoleBadge = (role: string) => {
    return role === "super_admin" ? (
      <Badge className="bg-gradient-primary text-primary-foreground">
        <Shield className="w-3 h-3 mr-1" />
        Super Admin
      </Badge>
    ) : (
      <Badge variant="outline">
        <User className="w-3 h-3 mr-1" />
        Admin
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
        <Button onClick={handleSaveSettings} className="bg-gradient-primary text-primary-foreground shadow-elegant">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
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
                value={settings.welcomeTitle}
                onChange={(e) => setSettings({...settings, welcomeTitle: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcomeMessage"
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({...settings, welcomeMessage: e.target.value})}
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
                value={settings.youtubePlaylist}
                onChange={(e) => setSettings({...settings, youtubePlaylist: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="blogFeedUrl" className="flex items-center gap-2">
                <Rss className="h-4 w-4" />
                Feed RSS do Blog
              </Label>
              <Input
                id="blogFeedUrl"
                value={settings.blogFeedUrl}
                onChange={(e) => setSettings({...settings, blogFeedUrl: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hotmartCourseUrl" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                URL Principal Hotmart
              </Label>
              <Input
                id="hotmartCourseUrl"
                value={settings.hotmartCourseUrl}
                onChange={(e) => setSettings({...settings, hotmartCourseUrl: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hotmartCoupon">Cupom de Desconto Padrão</Label>
              <Input
                id="hotmartCoupon"
                value={settings.hotmartCoupon}
                onChange={(e) => setSettings({...settings, hotmartCoupon: e.target.value})}
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
                checked={settings.enableWhatsApp}
                onCheckedChange={(checked) => setSettings({...settings, enableWhatsApp: checked})}
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
                checked={settings.enableEmailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, enableEmailNotifications: checked})}
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
                    Crie um novo usuário com acesso administrativo
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="adminName">Nome</Label>
                    <Input
                      id="adminName"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddAdminDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddAdmin} className="bg-gradient-primary text-primary-foreground">
                    Criar Admin
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
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{getRoleBadge(admin.role)}</TableCell>
                    <TableCell>{new Date(admin.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      {admin.role !== 'super_admin' && (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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