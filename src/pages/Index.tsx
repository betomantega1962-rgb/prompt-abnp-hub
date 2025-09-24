import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, GraduationCap, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-primary rounded-2xl shadow-glow">
              <GraduationCap className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          
          <Badge variant="outline" className="mb-6 text-primary border-primary/20">
            Academia Brasileira de Neurociência Política
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Plataforma de Gestão
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              ABNP
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo para gestão de usuários, cursos e conteúdos da 
            Academia Brasileira de Neurociência Política
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            {/* Painel do Aluno */}
            <Card className="shadow-card hover:shadow-elegant transition-smooth text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Painel do Aluno
                </CardTitle>
                <CardDescription>
                  Acesso aos conteúdos gratuitos e cursos premium
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  <span>Em Desenvolvimento</span>
                </Button>
              </CardContent>
            </Card>

            {/* Painel Admin */}
            <Card className="shadow-card hover:shadow-elegant transition-smooth text-left border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Super Admin
                </CardTitle>
                <CardDescription>
                  Gerenciamento completo da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin">
                  <Button className="w-full bg-gradient-primary text-primary-foreground shadow-elegant">
                    Acessar Painel
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Conecte ao <strong>Supabase</strong> para ativar autenticação e banco de dados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
