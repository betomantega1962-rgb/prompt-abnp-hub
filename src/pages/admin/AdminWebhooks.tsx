import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Webhook, 
  Plus, 
  Edit, 
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockWebhooks = [
  {
    id: "1",
    name: "Novo Usuário Cadastrado",
    url: "https://api.abnp.com.br/webhooks/new-user",
    event_type: "user.created",
    is_active: true,
    last_triggered: "2024-01-15T10:30:00Z",
    status: "success",
    response_time: 245,
    created_at: "2024-01-10T14:20:00Z",
  },
  {
    id: "2",
    name: "Conclusão de Curso",
    url: "https://api.abnp.com.br/webhooks/course-completed",
    event_type: "course.completed",
    is_active: true,
    last_triggered: "2024-01-14T16:45:00Z",
    status: "failed",
    response_time: 5000,
    created_at: "2024-01-08T09:15:00Z",
  },
];

const mockLogs = [
  {
    id: "1",
    webhook_id: "1",
    webhook_name: "Novo Usuário Cadastrado",
    triggered_at: "2024-01-15T10:30:00Z",
    status: "success",
    response_code: 200,
    response_time: 245,
    payload: { user_id: "123", email: "user@example.com" },
    response: { success: true, message: "User processed" },
  },
  {
    id: "2",
    webhook_id: "2",
    webhook_name: "Conclusão de Curso",
    triggered_at: "2024-01-14T16:45:00Z",
    status: "failed",
    response_code: 500,
    response_time: 5000,
    payload: { user_id: "456", course_id: "789" },
    response: { error: "Internal server error" },
  },
];

const eventTypes = [
  { value: "user.created", label: "Usuário Criado" },
  { value: "user.updated", label: "Usuário Atualizado" },
  { value: "course.completed", label: "Curso Concluído" },
  { value: "course.started", label: "Curso Iniciado" },
  { value: "offer.clicked", label: "Oferta Clicada" },
  { value: "article.viewed", label: "Artigo Visualizado" },
];

export default function AdminWebhooks() {
  const [webhooks, setWebhooks] = useState(mockWebhooks);
  const [logs, setLogs] = useState(mockLogs);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<any>(null);
  const [selectedWebhookLogs, setSelectedWebhookLogs] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    event_type: "",
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWebhook) {
      setWebhooks(prev => prev.map(webhook => 
        webhook.id === editingWebhook.id 
          ? { ...webhook, ...formData }
          : webhook
      ));
      toast({
        title: "Webhook Atualizado",
        description: "O webhook foi atualizado com sucesso.",
      });
      setEditingWebhook(null);
    } else {
      const newWebhook = {
        id: Date.now().toString(),
        ...formData,
        last_triggered: null,
        status: "pending",
        response_time: 0,
        created_at: new Date().toISOString(),
      };
      setWebhooks(prev => [...prev, newWebhook]);
      toast({
        title: "Webhook Criado",
        description: "Novo webhook adicionado com sucesso.",
      });
    }
    setFormData({
      name: "",
      url: "",
      event_type: "",
      is_active: true,
    });
    setShowAddDialog(false);
  };

  const toggleActive = (webhookId: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === webhookId 
        ? { ...webhook, is_active: !webhook.is_active }
        : webhook
    ));
    toast({
      title: "Webhook Atualizado",
      description: "Status do webhook alterado com sucesso.",
    });
  };

  const testWebhook = async (webhook: any) => {
    toast({
      title: "Testando Webhook",
      description: `Enviando requisição de teste para ${webhook.name}...`,
    });

    // Simulate webhook test
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate
      
      setWebhooks(prev => prev.map(w => 
        w.id === webhook.id 
          ? { 
              ...w, 
              last_triggered: new Date().toISOString(),
              status: isSuccess ? "success" : "failed",
              response_time: Math.floor(Math.random() * 1000) + 100
            }
          : w
      ));

      toast({
        title: isSuccess ? "Teste Bem-sucedido" : "Teste Falhado",
        description: isSuccess 
          ? "O webhook respondeu corretamente." 
          : "O webhook falhou no teste. Verifique a URL e configurações.",
        variant: isSuccess ? "default" : "destructive",
      });
    }, 2000);
  };

  const openEditDialog = (webhook: any) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      event_type: webhook.event_type,
      is_active: webhook.is_active,
    });
    setShowAddDialog(true);
  };

  const viewLogs = (webhook: any) => {
    const webhookLogs = logs.filter(log => log.webhook_id === webhook.id);
    setSelectedWebhookLogs(webhookLogs);
    setShowLogsDialog(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>;
      case "failed":
        return <Badge variant="destructive">Falhado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Webhooks</h1>
          <p className="text-muted-foreground">
            Configure e monitore integrações via webhook
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingWebhook ? "Editar Webhook" : "Novo Webhook"}
              </DialogTitle>
              <DialogDescription>
                {editingWebhook ? "Edite as configurações do webhook" : "Configure um novo webhook"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Webhook</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Novo Usuário Cadastrado"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="url">URL do Webhook</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.exemplo.com/webhook"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="event_type">Tipo de Evento</Label>
                <Select 
                  value={formData.event_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Webhook ativo</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingWebhook ? "Atualizar" : "Criar"} Webhook
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingWebhook(null);
                    setFormData({
                      name: "",
                      url: "",
                      event_type: "",
                      is_active: true,
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Webhooks</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.filter(w => w.is_active).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções Hoje</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.length > 0 ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Webhooks</CardTitle>
          <CardDescription>
            Gerencie todos os webhooks configurados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Execução</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(webhook.status)}
                      <div>
                        <div className="font-medium">{webhook.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Criado em {formatDate(webhook.created_at)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {eventTypes.find(t => t.value === webhook.event_type)?.label || webhook.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm font-mono">
                      {webhook.url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={webhook.is_active}
                          onCheckedChange={() => toggleActive(webhook.id)}
                        />
                        <Badge variant={webhook.is_active ? "default" : "secondary"}>
                          {webhook.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {getStatusBadge(webhook.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(webhook.last_triggered)}</div>
                      {webhook.response_time > 0 && (
                        <div className="text-muted-foreground">
                          {webhook.response_time}ms
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testWebhook(webhook)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(webhook)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewLogs(webhook)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Logs do Webhook</DialogTitle>
            <DialogDescription>
              Histórico de execuções e respostas do webhook
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Resposta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedWebhookLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.triggered_at)}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    <Badge variant={log.response_code >= 200 && log.response_code < 300 ? "default" : "destructive"}>
                      {log.response_code}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.response_time}ms</TableCell>
                  <TableCell>
                    <div className="max-w-xs text-sm">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}