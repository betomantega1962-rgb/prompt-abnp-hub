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
  Gift, 
  Plus, 
  Edit, 
  ExternalLink, 
  Star,
  Calendar,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockOffers = [
  {
    id: "1",
    name: "Método NeuroCP - Completo",
    hotmart_url: "https://hotmart.com/pt-br/marketplace/produtos/metodo-neurocp/U100302649X",
    coupon_code: "ABNP10",
    discount_percentage: 10,
    is_featured: true,
    is_active: true,
    clicks: 45,
    conversions: 12,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Neurociência Política Avançada",
    hotmart_url: "https://hotmart.com/pt-br/marketplace/produtos/neuro-avancado/U100302649Y",
    coupon_code: "ABNP15",
    discount_percentage: 15,
    is_featured: false,
    is_active: true,
    clicks: 23,
    conversions: 7,
    created_at: "2024-01-10T14:20:00Z",
  },
];

export default function AdminOffers() {
  const [offers, setOffers] = useState(mockOffers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    hotmart_url: "",
    coupon_code: "",
    discount_percentage: 0,
    is_featured: false,
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      setOffers(prev => prev.map(offer => 
        offer.id === editingOffer.id 
          ? { ...offer, ...formData }
          : offer
      ));
      toast({
        title: "Oferta Atualizada",
        description: "A oferta foi atualizada com sucesso.",
      });
      setEditingOffer(null);
    } else {
      const newOffer = {
        id: Date.now().toString(),
        ...formData,
        clicks: 0,
        conversions: 0,
        created_at: new Date().toISOString(),
      };
      setOffers(prev => [...prev, newOffer]);
      toast({
        title: "Oferta Criada",
        description: "Nova oferta adicionada com sucesso.",
      });
    }
    setFormData({
      name: "",
      hotmart_url: "",
      coupon_code: "",
      discount_percentage: 0,
      is_featured: false,
      is_active: true,
    });
    setShowAddDialog(false);
  };

  const toggleFeatured = (offerId: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId 
        ? { ...offer, is_featured: !offer.is_featured }
        : offer
    ));
    toast({
      title: "Oferta Atualizada",
      description: "Status de destaque alterado com sucesso.",
    });
  };

  const toggleActive = (offerId: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId 
        ? { ...offer, is_active: !offer.is_active }
        : offer
    ));
    toast({
      title: "Oferta Atualizada",
      description: "Status da oferta alterado com sucesso.",
    });
  };

  const openEditDialog = (offer: any) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      hotmart_url: offer.hotmart_url,
      coupon_code: offer.coupon_code,
      discount_percentage: offer.discount_percentage,
      is_featured: offer.is_featured,
      is_active: offer.is_active,
    });
    setShowAddDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const totalClicks = offers.reduce((sum, offer) => sum + offer.clicks, 0);
  const totalConversions = offers.reduce((sum, offer) => sum + offer.conversions, 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ofertas Hotmart</h1>
          <p className="text-muted-foreground">
            Gerencie ofertas de cursos premium e cupons de desconto
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Oferta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? "Editar Oferta" : "Nova Oferta"}
              </DialogTitle>
              <DialogDescription>
                {editingOffer ? "Edite os dados da oferta" : "Adicione uma nova oferta Hotmart"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Curso</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Método NeuroCP Completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="hotmart_url">URL da Hotmart</Label>
                <Input
                  id="hotmart_url"
                  value={formData.hotmart_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, hotmart_url: e.target.value }))}
                  placeholder="https://hotmart.com/..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="coupon_code">Cupom de Desconto</Label>
                <Input
                  id="coupon_code"
                  value={formData.coupon_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, coupon_code: e.target.value.toUpperCase() }))}
                  placeholder="Ex: ABNP10"
                />
              </div>
              
              <div>
                <Label htmlFor="discount_percentage">Desconto (%)</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
                <Label htmlFor="is_featured">Marcar como destaque</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Oferta ativa</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingOffer ? "Atualizar" : "Criar"} Oferta
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingOffer(null);
                    setFormData({
                      name: "",
                      hotmart_url: "",
                      coupon_code: "",
                      discount_percentage: 0,
                      is_featured: false,
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
            <CardTitle className="text-sm font-medium">Total de Ofertas</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ofertas</CardTitle>
          <CardDescription>
            Gerencie todas as ofertas de cursos premium da Hotmart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Cupom</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{offer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Criado em {formatDate(offer.created_at)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {offer.coupon_code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {offer.discount_percentage}% OFF
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={offer.is_active}
                          onCheckedChange={() => toggleActive(offer.id)}
                        />
                        <Badge variant={offer.is_active ? "default" : "secondary"}>
                          {offer.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={offer.is_featured}
                          onCheckedChange={() => toggleFeatured(offer.id)}
                        />
                        {offer.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{offer.clicks} cliques</div>
                      <div>{offer.conversions} conversões</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(offer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(offer.hotmart_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
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