import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Download, MoreHorizontal, Edit, Ban, CheckCircle, Users, UserPlus } from "lucide-react";

// Mock data - será substituído pela integração com Supabase
const mockUsers = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@email.com",
    phone: "+55 (11) 99999-9999",
    created_at: "2024-01-15",
    last_access: "2024-01-20",
    status: "active"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com", 
    phone: "+55 (21) 88888-8888",
    created_at: "2024-01-10",
    last_access: "2024-01-19",
    status: "active"
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@email.com",
    phone: "+55 (31) 77777-7777", 
    created_at: "2024-01-05",
    last_access: "2024-01-15",
    status: "blocked"
  }
];

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users] = useState(mockUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="default" className="bg-success text-success-foreground">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="destructive">
        <Ban className="w-3 h-3 mr-1" />
        Bloqueado
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie todos os usuários cadastrados na plataforma
          </p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground shadow-elegant">
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <Ban className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'blocked').length}</p>
                <p className="text-sm text-muted-foreground">Usuários Bloqueados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-card-hover transition-smooth">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(user.last_access).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {user.status === 'active' ? (
                              <>
                                <Ban className="mr-2 h-4 w-4" />
                                Bloquear
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Desbloquear
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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