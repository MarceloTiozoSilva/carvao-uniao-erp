import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Accounts() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<"all" | "pagar" | "receber">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pendente" | "pago" | "vencido">("all");
  
  const [formData, setFormData] = useState({
    description: "",
    type: "pagar" as "pagar" | "receber",
    amount: "",
    dueDate: new Date().toISOString().split('T')[0],
    status: "pendente" as "pendente" | "pago" | "vencido",
    categoryId: "",
    clientId: "",
    supplierId: "",
    notes: "",
  });

  const { data: accounts = [], refetch } = trpc.accounts.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery();
  
  const createMutation = trpc.accounts.create.useMutation();
  const updateMutation = trpc.accounts.update.useMutation();
  const deleteMutation = trpc.accounts.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          description: formData.description,
          type: formData.type,
          amount: parseFloat(formData.amount),
          dueDate: new Date(formData.dueDate),
          status: formData.status,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
          clientId: formData.clientId ? parseInt(formData.clientId) : undefined,
          supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
          notes: formData.notes,
        });
        toast.success("Conta atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync({
          description: formData.description,
          type: formData.type,
          amount: parseFloat(formData.amount),
          dueDate: new Date(formData.dueDate),
          status: formData.status,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
          clientId: formData.clientId ? parseInt(formData.clientId) : undefined,
          supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
          notes: formData.notes,
        });
        toast.success("Conta criada com sucesso!");
      }
      setFormData({ description: "", type: "pagar", amount: "", dueDate: new Date().toISOString().split('T')[0], status: "pendente", categoryId: "", clientId: "", supplierId: "", notes: "" });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar conta");
    }
  };

  const handleEdit = (account: any) => {
    setFormData({
      description: account.description,
      type: account.type,
      amount: (account.amount / 100).toString(),
      dueDate: new Date(account.dueDate).toISOString().split('T')[0],
      status: account.status,
      categoryId: account.categoryId?.toString() || "",
      clientId: account.clientId?.toString() || "",
      supplierId: account.supplierId?.toString() || "",
      notes: account.notes || "",
    });
    setEditingId(account.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta conta?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Conta deletada com sucesso!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar conta");
      }
    }
  };

  const filteredAccounts = accounts.filter((account: any) => {
    const typeMatch = filterType === "all" || account.type === filterType;
    const statusMatch = filterStatus === "all" || account.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const overdueCount = accounts.filter((a: any) => a.status === "vencido").length;
  const upcomingCount = accounts.filter((a: any) => {
    const dueDate = new Date(a.dueDate);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return a.status === "pendente" && dueDate <= nextWeek && dueDate > today;
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar/Receber</h1>
            <p className="text-muted-foreground mt-2">Gerencie seus compromissos financeiros</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setFormData({ description: "", type: "pagar", amount: "", dueDate: new Date().toISOString().split('T')[0], status: "pendente", categoryId: "", clientId: "", supplierId: "", notes: "" }); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Conta" : "Nova Conta"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as "pagar" | "receber" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pagar">A Pagar</SelectItem>
                      <SelectItem value="receber">A Receber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Valor (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Data de Vencimento *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as "pendente" | "pago" | "vencido" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clientId">Cliente</Label>
                  <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {editingId ? "Atualizar" : "Criar"} Conta
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {(overdueCount > 0 || upcomingCount > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {overdueCount > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-red-600 font-medium">{overdueCount} contas vencidas</p>
                      <p className="text-xs text-red-500">Ação imediata necessária</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {upcomingCount > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">{upcomingCount} contas próximas</p>
                      <p className="text-xs text-yellow-500">Vencem nos próximos 7 dias</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contas</CardTitle>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="pagar">A Pagar</SelectItem>
                    <SelectItem value="receber">A Receber</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAccounts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma conta encontrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Descrição</th>
                      <th className="text-left py-3 px-4 font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium">Valor</th>
                      <th className="text-left py-3 px-4 font-medium">Vencimento</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account: any) => (
                      <tr key={account.id} className="border-b hover:bg-accent/50">
                        <td className="py-3 px-4">{account.description}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${account.type === 'pagar' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {account.type === 'pagar' ? 'A Pagar' : 'A Receber'}
                          </span>
                        </td>
                        <td className="py-3 px-4">R$ {(account.amount / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">{new Date(account.dueDate).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            account.status === 'vencido' ? 'bg-red-100 text-red-800' :
                            account.status === 'pago' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {account.status === 'vencido' ? 'Vencido' : account.status === 'pago' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(account)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(account.id)}
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
