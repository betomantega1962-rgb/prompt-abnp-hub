import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  RefreshCw, 
  ExternalLink, 
  Star, 
  Calendar, 
  FileText, 
  Plus,
  Search,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with real Supabase data
const mockArticles = [
  {
    id: "1",
    title: "Introdução à Neurociência Política",
    excerpt: "Entenda os fundamentos da neurociência aplicada à política e tomada de decisões...",
    author: "Dr. João Silva",
    published_at: "2024-01-15T10:30:00Z",
    external_url: "https://academiadaneuropolitica.com.br/artigo1",
    is_active: true,
    featured: false,
    source: "RSS",
  },
  {
    id: "2", 
    title: "Como as Emoções Influenciam Decisões Políticas",
    excerpt: "Análise profunda sobre o papel das emoções na formação de opiniões políticas...",
    author: "Dra. Maria Santos",
    published_at: "2024-01-12T14:20:00Z",
    external_url: "https://academiadaneuropolitica.com.br/artigo2",
    is_active: true,
    featured: true,
    source: "RSS",
  },
];

export default function AdminArticles() {
  const [articles, setArticles] = useState(mockArticles);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [rssUrl, setRssUrl] = useState("https://academiadaneuropolitica.com.br/feed/");
  const { toast } = useToast();

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefreshRSS = async () => {
    setIsRefreshing(true);
    try {
      // Simulate RSS fetch
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "RSS Atualizado",
        description: "Artigos sincronizados com sucesso do blog ABNP.",
      });
    } catch (error) {
      toast({
        title: "Erro na Sincronização",
        description: "Falha ao buscar artigos do RSS. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleFeatured = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, featured: !article.featured }
        : article
    ));
    toast({
      title: "Artigo Atualizado",
      description: "Status de destaque alterado com sucesso.",
    });
  };

  const toggleActive = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, is_active: !article.is_active }
        : article
    ));
    toast({
      title: "Artigo Atualizado", 
      description: "Visibilidade do artigo alterada com sucesso.",
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Artigos do Blog</h1>
          <p className="text-muted-foreground">
            Gerencie artigos do blog ABNP e controle destaques
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações RSS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações do RSS</DialogTitle>
                <DialogDescription>
                  Configure a URL do feed RSS do blog ABNP
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rss-url">URL do Feed RSS</Label>
                  <Input
                    id="rss-url"
                    value={rssUrl}
                    onChange={(e) => setRssUrl(e.target.value)}
                    placeholder="https://academiadaneuropolitica.com.br/feed/"
                  />
                </div>
                <Button onClick={() => setShowSettingsDialog(false)} className="w-full">
                  Salvar Configurações
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleRefreshRSS}
            disabled={isRefreshing}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Sincronizando...' : 'Sincronizar RSS'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Artigos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artigos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.filter(a => a.is_active).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Destaque</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.filter(a => a.featured).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Há 2 horas</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou autor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Artigos</CardTitle>
          <CardDescription>
            Artigos sincronizados automaticamente do blog ABNP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{article.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(article.published_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={article.is_active}
                        onCheckedChange={() => toggleActive(article.id)}
                      />
                      <Badge variant={article.is_active ? "default" : "secondary"}>
                        {article.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={article.featured}
                        onCheckedChange={() => toggleFeatured(article.id)}
                      />
                      {article.featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(article.external_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Artigo
                    </Button>
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