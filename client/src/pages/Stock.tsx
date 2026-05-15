import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Stock() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "entrada" as "entrada" | "saida",
    productId: "",
    quantityTonnes: "",
    unitPrice: "",
    supplierId: "",
    notes: "",
  });

  const { data: movements = [], refetch } = trpc.stockMovements.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery();
  
  const createMutation = trpc.stockMovements.create.useMutation();
  const updateMutation = trpc.stockMovements.update.useMutation();
  const deleteMutation = trpc.stockMovements.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          date: new Date(formData.date),
          type: formData.type,
          productId: parseInt(formData.productId),
          quantityTonnes: parseFloat(formData.quantityTonnes),
          unitPrice: parseFloat(formData.unitPrice),
          supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
          notes: formData.notes,
        });
        toast.success("Movimentação atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync({
          date: new Date(formData.date),
          type: formData.type,
          productId: parseInt(formData.productId),
          quantityTonnes: parseFloat(formData.quantityTonnes),
          unitPrice: parseFloat(formData.unitPrice),
          supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
          notes: formData.notes,
        });
        toast.success("Movimentação criada com sucesso!");
      }
      setFormData({ date: new Date().toISOString().split('T')[0], type: "entrada", productId: "", quantityTonnes: "", unitPrice: "", supplierId: "", notes: "" });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar movimentação");
    }
  };

  const handleEdit = (movement: any) => {
    setFormData({
      date: new Date(movement.date).toISOString().split('T')[0],
      type: movement.type,
      productId: movement.productId.toString(),
      quantityTonnes: movement.quantityTonnes,
      unitPrice: (movement.unitPrice / 100).toString(),
      supplierId: movement.supplierId?.toString() || "",
      notes: movement.notes || "",
    });
    setEditingId(movement.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta movimentação?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Movimentação deletada com sucesso!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar movimentação");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
            <p className="text-muted-foreground mt-2">Gerencie movimentações de entrada e saída</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setFormData({ date: new Date().toISOString().split('T')[0], type: "entrada", productId: "", quantityTonnes: "", unitPrice: "", supplierId: "", notes: "" }); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Movimentação" : "Nova Movimentação"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as "entrada" | "saida" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="productId">Produto *</Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p: any) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantityTonnes">Quantidade (toneladas) *</Label>
                  <Input
                    id="quantityTonnes"
                    type="number"
                    step="0.01"
                    value={formData.quantityTonnes}
                    onChange={(e) => setFormData({ ...formData, quantityTonnes: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unitPrice">Valor Unitário (R$) *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="supplierId">Fornecedor</Label>
                  <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s: any) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Atualizar" : "Criar"} Movimentação
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Movimentações de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma movimentação registrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Data</th>
                      <th className="text-left py-3 px-4 font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium">Produto</th>
                      <th className="text-left py-3 px-4 font-medium">Quantidade (ton)</th>
                      <th className="text-left py-3 px-4 font-medium">Valor Unit.</th>
                      <th className="text-left py-3 px-4 font-medium">Fornecedor</th>
                      <th className="text-left py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement: any) => (
                      <tr key={movement.id} className="border-b hover:bg-accent/50">
                        <td className="py-3 px-4">{new Date(movement.date).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${movement.type === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{products.find((p: any) => p.id === movement.productId)?.name || '-'}</td>
                        <td className="py-3 px-4">{parseFloat(movement.quantityTonnes).toFixed(2)}</td>
                        <td className="py-3 px-4">R$ {(movement.unitPrice / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">{suppliers.find((s: any) => s.id === movement.supplierId)?.name || '-'}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(movement)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(movement.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
