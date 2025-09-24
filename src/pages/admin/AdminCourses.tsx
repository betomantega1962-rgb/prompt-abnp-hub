import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayCircle, Plus, Eye, Edit, MoreHorizontal, Youtube } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Mock data - será substituído pela integração com Supabase
const mockVideos = [
  {
    id: 1,
    title: "Introdução à Neurociência Política",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Fundamentos",
    order: 1,
    active: true,
    created_at: "2024-01-15"
  },
  {
    id: 2,
    title: "Tomada de Decisão Política",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
    category: "Comportamento",
    order: 2,
    active: true,
    created_at: "2024-01-10"
  },
  {
    id: 3,
    title: "Neuroplasticidade e Política",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Avançado",
    order: 3,
    active: false,
    created_at: "2024-01-05"
  }
];

const categories = ["Fundamentos", "Comportamento", "Avançado", "Prática"];

export default function AdminCourses() {
  const [videos, setVideos] = useState(mockVideos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: "",
    youtube_url: "",
    description: "",
    category: "",
    order: videos.length + 1,
    active: true
  });

  const handleAddVideo = () => {
    const video = {
      id: videos.length + 1,
      ...newVideo,
      created_at: new Date().toISOString().split('T')[0]
    };
    setVideos([...videos, video]);
    setNewVideo({
      title: "",
      youtube_url: "",
      description: "",
      category: "",
      order: videos.length + 2,
      active: true
    });
    setIsDialogOpen(false);
  };

  const toggleVideoStatus = (id: number) => {
    setVideos(videos.map(video => 
      video.id === id ? { ...video, active: !video.active } : video
    ));
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cursos Gratuitos</h1>
          <p className="text-muted-foreground">
            Gerencie os vídeos gratuitos do YouTube disponíveis para os alunos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-elegant">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Vídeo</DialogTitle>
              <DialogDescription>
                Adicione um novo vídeo do YouTube à biblioteca de cursos gratuitos
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título do Vídeo</Label>
                <Input
                  id="title"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                  placeholder="Ex: Introdução à Neurociência Política"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="youtube_url">URL do YouTube</Label>
                <Input
                  id="youtube_url"
                  value={newVideo.youtube_url}
                  onChange={(e) => setNewVideo({...newVideo, youtube_url: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                  placeholder="Breve descrição do conteúdo do vídeo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={newVideo.category} onValueChange={(value) => setNewVideo({...newVideo, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="order">Ordem</Label>
                  <Input
                    id="order"
                    type="number"
                    value={newVideo.order}
                    onChange={(e) => setNewVideo({...newVideo, order: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newVideo.active}
                  onCheckedChange={(checked) => setNewVideo({...newVideo, active: checked})}
                />
                <Label htmlFor="active">Vídeo ativo (visível para alunos)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddVideo} className="bg-gradient-primary text-primary-foreground">
                Adicionar Vídeo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{videos.length}</p>
                <p className="text-sm text-muted-foreground">Total de Vídeos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Eye className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{videos.filter(v => v.active).length}</p>
                <p className="text-sm text-muted-foreground">Vídeos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Youtube className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <MoreHorizontal className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">1.2k</p>
                <p className="text-sm text-muted-foreground">Visualizações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Videos List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Lista de Vídeos</CardTitle>
          <CardDescription>
            Gerencie todos os vídeos disponíveis na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.sort((a, b) => a.order - b.order).map((video) => (
                  <TableRow key={video.id} className="hover:bg-card-hover transition-smooth">
                    <TableCell className="font-medium">{video.order}</TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{video.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {getYouTubeId(video.youtube_url) && (
                        <img
                          src={`https://img.youtube.com/vi/${getYouTubeId(video.youtube_url)}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={video.active}
                          onCheckedChange={() => toggleVideoStatus(video.id)}
                        />
                        <span className="text-sm">
                          {video.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(video.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
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