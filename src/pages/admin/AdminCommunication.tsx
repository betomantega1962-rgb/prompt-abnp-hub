import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  Send, 
  Mail, 
  MessageCircle,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
interface Message {
  id: string;
  subject: string;
  content: string;
  type: string;
  status: string;
  recipients_count: number;
  created_by: string;
  sent_at?: string;
  scheduled_for?: string;
  created_at?: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    subject: "Bem-vindo à ABNP!",
    content: "Olá! Seja bem-vindo à Academia Brasileira de Neurociência Política...",
    type: "email",
    status: "sent",
    recipients_count: 245,
    sent_at: "2024-01-15T10:30:00Z",
    created_by: "Admin",
  },
  {
    id: "2",
    subject: "Novo curso disponível",
    content: "Temos um novo curso gratuito disponível na plataforma...",
    type: "email",
    status: "scheduled",
    recipients_count: 189,
    scheduled_for: "2024-01-20T09:00:00Z",
    created_by: "Admin",
  },
  {
    id: "3",
    subject: "Oferta especial Hotmart",
    content: "Aproveite nossa oferta especial com desconto de 15%...",
    type: "whatsapp",
    status: "draft",
    recipients_count: 0,
    created_at: "2024-01-14T16:45:00Z",
    created_by: "Admin",
  },
];

const mockUsers = [
  { id: "1", name: "João Silva", email: "joao@email.com", accepts_email: true, accepts_whatsapp: true },
  { id: "2", name: "Maria Santos", email: "maria@email.com", accepts_email: true, accepts_whatsapp: false },
  { id: "3", name: "Pedro Costa", email: "pedro@email.com", accepts_email: false, accepts_whatsapp: true },
];

export default function AdminCommunication() {
  const [messages, setMessages] = useState(mockMessages);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    type: "email",
    send_immediately: true,
    scheduled_date: "",
    scheduled_time: "",
    target_audience: "all", // all, active_users, course_completed, custom
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipientsCount = formData.target_audience === "custom" 
      ? selectedUsers.length 
      : mockUsers.filter(user => 
          formData.type === "email" ? user.accepts_email : user.accepts_whatsapp
        ).length;

    const newMessage = {
      id: Date.now().toString(),
      subject: formData.subject,
      content: formData.content,
      type: formData.type,
      status: formData.send_immediately ? "sent" : "scheduled",
      recipients_count: recipientsCount,
      created_by: "Admin",
      ...(formData.send_immediately 
        ? { sent_at: new Date().toISOString() }
        : { 
            scheduled_for: new Date(`${formData.scheduled_date}T${formData.scheduled_time}`).toISOString(),
            created_at: new Date().toISOString()
          }
      ),
    };

    setMessages(prev => [newMessage, ...prev]);
    
    toast({
      title: formData.send_immediately ? "Mensagem Enviada" : "Mensagem Agendada",
      description: `${recipientsCount} usuários ${formData.send_immediately ? 'receberam' : 'receberão'} a mensagem.`,
    });

    setFormData({
      subject: "",
      content: "",
      type: "email",
      send_immediately: true,
      scheduled_date: "",
      scheduled_time: "",
      target_audience: "all",
    });
    setSelectedUsers([]);
    setShowNewMessageDialog(false);
  };

  const formatDate = (dateString: string) => {
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
      case "sent":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "draft":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800">Enviada</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>;
      case "draft":
        return <Badge variant="secondary">Rascunho</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "email" ? 
      <Mail className="h-4 w-4" /> : 
      <MessageCircle className="h-4 w-4" />;
  };

  const totalSent = messages.filter(m => m.status === "sent").length;
  const totalScheduled = messages.filter(m => m.status === "scheduled").length;
  const totalRecipients = messages.reduce((sum, m) => sum + (m.recipients_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comunicação</h1>
          <p className="text-muted-foreground">
            Envie mensagens para seus usuários via e-mail ou WhatsApp
          </p>
        </div>
        
        <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Nova Mensagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Mensagem</DialogTitle>
              <DialogDescription>
                Crie e envie mensagens para seus usuários
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Mensagem</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_audience">Público-alvo</Label>
                  <Select 
                    value={formData.target_audience} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os usuários</SelectItem>
                      <SelectItem value="active_users">Usuários ativos</SelectItem>
                      <SelectItem value="course_completed">Concluíram cursos</SelectItem>
                      <SelectItem value="custom">Seleção customizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.target_audience === "custom" && (
                <div>
                  <Label>Selecionar Usuários</Label>
                  <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                    {mockUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <Label htmlFor={`user-${user.id}`} className="text-sm">
                          {user.name} ({user.email})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Digite o assunto da mensagem"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Digite o conteúdo da mensagem..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send_immediately"
                    checked={formData.send_immediately}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, send_immediately: !!checked }))}
                  />
                  <Label htmlFor="send_immediately">Enviar imediatamente</Label>
                </div>

                {!formData.send_immediately && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduled_date">Data</Label>
                      <Input
                        id="scheduled_date"
                        type="date"
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                        required={!formData.send_immediately}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduled_time">Horário</Label>
                      <Input
                        id="scheduled_time"
                        type="time"
                        value={formData.scheduled_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                        required={!formData.send_immediately}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {formData.send_immediately ? "Enviar Agora" : "Agendar Envio"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewMessageDialog(false)}
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
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Agendadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScheduled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Destinatários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecipients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens</CardTitle>
          <CardDescription>
            Todas as mensagens enviadas e agendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mensagem</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Destinatários</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      {getStatusIcon(message.status)}
                      <div>
                        <div className="font-medium">{message.subject}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          por {message.created_by}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(message.type)}
                      <span className="capitalize">{message.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(message.status)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {message.recipients_count} usuários
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {message.status === "sent" && message.sent_at && (
                        <div>Enviada em {formatDate(message.sent_at)}</div>
                      )}
                      {message.status === "scheduled" && message.scheduled_for && (
                        <div>Agendada para {formatDate(message.scheduled_for)}</div>
                      )}
                      {message.status === "draft" && message.created_at && (
                        <div>Criada em {formatDate(message.created_at)}</div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}