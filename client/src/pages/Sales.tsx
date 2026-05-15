import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function Sales() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    clientId: "",
    productId: "",
    quantity: 1,
    unitPrice: 0,
  });

  const utils = trpc.useUtils();
  const { data: sales, isLoading } = trpc.sales.list.useQuery({} as any);
  const { data: clients } = trpc.clients.list.useQuery(undefined as any);
  const { data: products } = trpc.products.list.useQuery(undefined as any);
  
  const createMutation = trpc.sales.create.useMutation({
    onSuccess: () => {
      toast.success("Venda registrada com sucesso!");
      resetForm();
      setOpen(false);
      utils.sales.list.invalidate({});
    },
    onError: (error) => {
      toast.error("Erro ao registrar venda: " + error.message);
    },
  });

  const updateMutation = trpc.sales.update.useMutation({
    onSuccess: () => {
      toast.success("Venda atualizada com sucesso!");
      resetForm();
      setOpen(false);
      utils.sales.list.invalidate({});
    },
    onError: (error) => {
      toast.error("Erro ao atualizar venda: " + error.message);
    },
  });

  const deleteMutation = trpc.sales.delete.useMutation({
    onSuccess: () => {
      toast.success("Venda removida com sucesso!");
      utils.sales.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao remover venda: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      clientId: "",
      productId: "",
      quantity: 1,
      unitPrice: 0,
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.productId || formData.quantity <= 0 || formData.unitPrice <= 0) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    const selectedClient = clients?.find((c: any) => c.id === parseInt(formData.clientId));
    const selectedProduct = products?.find((p: any) => p.id === parseInt(formData.productId));

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        client: selectedClient?.name || "",
        product: selectedProduct?.name || "",
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
      });
    } else {
      createMutation.mutate({
        date: new Date(formData.date),
        client: selectedClient?.name || "",
        product: selectedProduct?.name || "",
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
      });
    }
  };

  const handleEdit = (sale: any) => {
    const client = clients?.find((c: any) => c.name === sale.client);
    const product = products?.find((p: any) => p.name === sale.product);
    
    setFormData({
      date: format(new Date(sale.date), "yyyy-MM-dd"),
      clientId: client?.id.toString() || "",
      productId: product?.id.toString() || "",
      quantity: sale.quantity,
      unitPrice: sale.unitPrice / 100,
    });
    setEditingId(sale.id);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta venda?")) {
      deleteMutation.mutate({ id });
    }
  };

  const total = useMemo(() => formData.quantity * formData.unitPrice, [formData.quantity, formData.unitPrice]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lançamento de Vendas</h1>
            <p className="text-muted-foreground mt-1">Registre as vendas de carvão ensacado</p>
          </div>
          <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (!newOpen) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Venda" : "Registrar Nova Venda"}</DialogTitle>
                <DialogDescription>Preencha os dados da venda abaixo</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client: any) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Produto</Label>
                  <Select value={formData.productId} onValueChange={(value) => {
                    const selectedProduct = products?.find((p: any) => p.id === parseInt(value));
                    setFormData({ 
                      ...formData, 
                      productId: value,
                      unitPrice: selectedProduct ? selectedProduct.price / 100 : formData.unitPrice
                    });
                  }}>
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product: any) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - R$ {(product.price / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Valor Unitário (R$)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total da Venda</p>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingId ? "Atualizando..." : "Registrando..."}
                    </>
                  ) : (
                    editingId ? "Atualizar Venda" : "Registrar Venda"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
            <CardDescription>Todas as vendas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : sales && sales.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Unitário</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell>{sale.client}</TableCell>
                        <TableCell>{sale.product}</TableCell>
                        <TableCell className="text-right">{sale.quantity}</TableCell>
                        <TableCell className="text-right">
                          R$ {(sale.unitPrice / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          R$ {(sale.total / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(sale)}
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(sale.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Nenhuma venda registrada ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
