import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Download } from "lucide-react";

const COLORS = [
  "oklch(0.55 0.2 260)",
  "oklch(0.65 0.15 280)",
  "oklch(0.45 0.15 240)",
  "oklch(0.35 0.12 200)",
  "oklch(0.75 0.1 300)",
];

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

  const { data: salesData, isLoading: salesLoading } = trpc.sales.list.useQuery({
    startDate,
    endDate,
  });

  const { data: expensesData, isLoading: expensesLoading } = trpc.expenses.list.useQuery({
    startDate,
    endDate,
  });

  const { data: categoriesData } = trpc.categories.list.useQuery();

  const calculateTotals = () => {
    const totalSales = salesData?.reduce((sum: number, sale: any) => sum + sale.total / 100, 0) || 0;
    const totalExpenses = expensesData?.reduce((sum: number, expense: any) => sum + expense.expenses.amount / 100, 0) || 0;
    const balance = totalSales - totalExpenses;

    return { totalSales, totalExpenses, balance };
  };

  const getExpensesByCategory = () => {
    if (!expensesData || !categoriesData) return [];

    const categoryTotals: { [key: number]: number } = {};
    
    expensesData.forEach((expense: any) => {
      const categoryId = expense.expenses.categoryId;
      categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + expense.expenses.amount / 100;
    });

    return Object.entries(categoryTotals).map(([categoryId, total]) => {
      const category = categoriesData.find((c: any) => c.id === parseInt(categoryId));
      return {
        name: category?.name || "Sem categoria",
        value: Math.round(total * 100) / 100,
      };
    });
  };

  const getCashFlow = () => {
    const flow: any[] = [];
    let cumulativeBalance = 0;

    const allTransactions = [
      ...(salesData?.map((s: any) => ({
        date: s.date,
        type: "entrada",
        description: `Venda - ${s.client}`,
        amount: s.total / 100,
      })) || []),
      ...(expensesData?.map((e: any) => ({
        date: e.expenses.date,
        type: "saida",
        description: `Despesa - ${e.expenses.description}`,
        amount: -(e.expenses.amount / 100),
      })) || []),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    allTransactions.forEach((transaction: any) => {
      cumulativeBalance += transaction.amount;
      flow.push({
        ...transaction,
        balance: Math.round(cumulativeBalance * 100) / 100,
      });
    });

    return flow;
  };

  const { totalSales, totalExpenses, balance } = calculateTotals();
  const expensesByCategory = getExpensesByCategory();
  const cashFlow = getCashFlow();

  const handleDownloadPDF = () => {
    // Placeholder for PDF generation
    alert("Funcionalidade de download de PDF será implementada em breve!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
            <p className="text-muted-foreground mt-1">Análise detalhada do desempenho financeiro</p>
          </div>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="w-4 h-4" />
            Gerar PDF
          </Button>
        </div>

        <Tabs defaultValue="resumo" className="space-y-4">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="categorias">Despesas por Categoria</TabsTrigger>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    R$ {totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{format(selectedMonth, "MMMM/yyyy", { locale: ptBR })}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{format(selectedMonth, "MMMM/yyyy", { locale: ptBR })}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resultado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{balance >= 0 ? "Lucro" : "Prejuízo"}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fluxo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa</CardTitle>
                <CardDescription>Todas as entradas e saídas com saldo acumulado</CardDescription>
              </CardHeader>
              <CardContent>
                {expensesLoading || salesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : cashFlow.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Saldo Acumulado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashFlow.map((transaction: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                transaction.type === "entrada" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {transaction.type === "entrada" ? "Entrada" : "Saída"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              R$ {Math.abs(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              R$ {transaction.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    Nenhuma transação neste período
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição dos gastos por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                {expensesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : expensesByCategory.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={expensesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoria</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-right">%</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expensesByCategory.map((category: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{category.name}</TableCell>
                              <TableCell className="text-right font-semibold">
                                R$ {category.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right">
                                {((category.value / totalExpenses) * 100).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    Nenhuma despesa registrada neste período
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>Todas as vendas do período</CardDescription>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : salesData && salesData.length > 0 ? (
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesData.map((sale: any) => (
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    Nenhuma venda registrada neste período
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
