import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Suppliers() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cnpjCpf: "",
    phone: "",
    email: "",
    product: "",
    notes: "",
  });

  const { data: suppliers = [], refetch } = trpc.suppliers.list.useQuery();
  const createMutation = trpc.suppliers.create.useMutation();
  const updateMutation = trpc.suppliers.update.useMutation();
  const deleteMutation = trpc.suppliers.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Fornecedor atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Fornecedor criado com sucesso!");
      }
      setFormData({ name: "", cnpjCpf: "", phone: "", email: "", product: "", notes: "" });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar fornecedor");
    }
  };

  const handleEdit = (supplier: any) => {
    setFormData({
      name: supplier.name,
      cnpjCpf: supplier.cnpjCpf || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      product: supplier.product || "",
      notes: supplier.notes || "",
    });
    setEditingId(supplier.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este fornecedor?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Fornecedor deletado com sucesso!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar fornecedor");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
            <p className="text-muted-foreground mt-2">Gerencie seus fornecedores</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setFormData({ name: "", cnpjCpf: "", phone: "", email: "", product: "", notes: "" }); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cnpjCpf">CNPJ/CPF</Label>
                  <Input
                    id="cnpjCpf"
                    value={formData.cnpjCpf}
                    onChange={(e) => setFormData({ ...formData, cnpjCpf: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="product">Produto Fornecido</Label>
                  <Input
                    id="product"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  />
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
                  {editingId ? "Atualizar" : "Criar"} Fornecedor
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            {suppliers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum fornecedor cadastrado</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Nome</th>
                      <th className="text-left py-3 px-4 font-medium">CNPJ/CPF</th>
                      <th className="text-left py-3 px-4 font-medium">Telefone</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Produto</th>
                      <th className="text-left py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier: any) => (
                      <tr key={supplier.id} className="border-b hover:bg-accent/50">
                        <td className="py-3 px-4">{supplier.name}</td>
                        <td className="py-3 px-4">{supplier.cnpjCpf || "-"}</td>
                        <td className="py-3 px-4">{supplier.phone || "-"}</td>
                        <td className="py-3 px-4">{supplier.email || "-"}</td>
                        <td className="py-3 px-4">{supplier.product || "-"}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(supplier)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(supplier.id)}
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
