import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlayCircle, Gift, TrendingUp, Eye, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statsData = [
  {
    title: "Total de Usuários",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Users,
    description: "Últimos 30 dias"
  },
  {
    title: "Usuários Ativos",
    value: "892",
    change: "+8%",
    trend: "up", 
    icon: TrendingUp,
    description: "Últimos 7 dias"
  },
  {
    title: "Vídeos Assistidos",
    value: "3,421",
    change: "+23%",
    trend: "up",
    icon: PlayCircle,
    description: "Este mês"
  },
  {
    title: "Cliques em Ofertas",
    value: "156",
    change: "+45%",
    trend: "up",
    icon: Gift,
    description: "Este mês"
  }
];

const recentActivity = [
  {
    action: "Novo usuário cadastrado",
    user: "João Silva",
    time: "2 minutos atrás",
    type: "user"
  },
  {
    action: "Vídeo assistido",
    user: "Maria Santos",
    time: "5 minutos atrás",
    type: "video"
  },
  {
    action: "Clique em oferta Hotmart",
    user: "Pedro Costa",
    time: "12 minutos atrás",
    type: "offer"
  },
  {
    action: "Novo usuário cadastrado",
    user: "Ana Oliveira",
    time: "18 minutos atrás",
    type: "user"
  }
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema ABNP
          </p>
        </div>
        <Badge variant="outline" className="text-primary">
          <Calendar className="w-3 h-3 mr-1" />
          Hoje: {new Date().toLocaleDateString('pt-BR')}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="shadow-card hover:shadow-elegant transition-smooth">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={stat.trend === 'up' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas ações dos usuários no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'user' ? 'bg-success' :
                      activity.type === 'video' ? 'bg-primary' : 'bg-warning'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso direto às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 hover:shadow-sm transition-smooth cursor-pointer bg-gradient-primary text-primary-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Gerenciar Usuários</span>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-sm transition-smooth cursor-pointer border-primary/20">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Adicionar Vídeo</span>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-sm transition-smooth cursor-pointer border-warning/20">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Nova Oferta</span>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-sm transition-smooth cursor-pointer border-success/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Ver Relatórios</span>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}