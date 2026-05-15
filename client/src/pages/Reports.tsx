import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfQuarter, endOfQuarter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

interface PDFGenerationState {
  cashFlow: boolean;
  dre: boolean;
}

const COLORS = [
  "oklch(0.55 0.2 260)",
  "oklch(0.65 0.15 280)",
  "oklch(0.45 0.15 240)",
  "oklch(0.35 0.12 200)",
  "oklch(0.75 0.1 300)",
];

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pdfLoading, setPdfLoading] = useState<PDFGenerationState>({ cashFlow: false, dre: false });

  const cashFlowPdfMutation = trpc.reports.generateCashFlowPDF.useMutation();
  const drePdfMutation = trpc.reports.generateDREPDF.useMutation();

  const handleDownloadCashFlowPDF = async () => {
    setPdfLoading({ ...pdfLoading, cashFlow: true });
    try {
      const pdfBase64 = await cashFlowPdfMutation.mutateAsync({
        startDate,
        endDate,
        period: format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR }),
      });
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = `fluxo-caixa-${format(selectedMonth, "yyyy-MM-dd")}.pdf`;
      link.click();
      toast.success("PDF de fluxo de caixa baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF de fluxo de caixa");
    } finally {
      setPdfLoading({ ...pdfLoading, cashFlow: false });
    }
  };

  const handleDownloadDREPDF = async () => {
    setPdfLoading({ ...pdfLoading, dre: true });
    try {
      const pdfBase64 = await drePdfMutation.mutateAsync({
        startDate,
        endDate,
        period: format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR }),
      });
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = `dre-${format(selectedMonth, "yyyy-MM-dd")}.pdf`;
      link.click();
      toast.success("PDF de DRE baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF de DRE");
    } finally {
      setPdfLoading({ ...pdfLoading, dre: false });
    }
  };

  const getDateRange = () => {
    const now = new Date();
    switch (filterPeriod) {
      case "month":
        return { start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) };
      case "quarter":
        return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case "year":
        return { start: startOfYear(now), end: endOfYear(now) };
      case "last3months":
        return { start: startOfMonth(subMonths(now, 3)), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();

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
    let totalSales = 0;
    let totalExpenses = 0;

    if (salesData) {
      totalSales = salesData.reduce((sum: number, sale: any) => sum + sale.total / 100, 0);
    }

    if (expensesData) {
      totalExpenses = expensesData.reduce((sum: number, expense: any) => {
        if (selectedCategory === "all" || expense.categoryId === parseInt(selectedCategory)) {
          return sum + expense.amount / 100;
        }
        return sum;
      }, 0);
    }

    const balance = totalSales - totalExpenses;
    return { totalSales, totalExpenses, balance };
  };

  const getExpensesByCategory = () => {
    if (!expensesData || !categoriesData) return [];

    const categoryTotals: { [key: number]: number } = {};
    
    expensesData.forEach((expense: any) => {
      const categoryId = expense.categoryId;
      categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + expense.amount / 100;
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
        date: e.date,
        type: "saida",
        description: `Despesa - ${e.description}`,
        amount: -(e.amount / 100),
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



  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Análise financeira e fluxo de caixa</p>
        </div>

        {/* Filtros Avançados */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="period">Período</Label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mês</SelectItem>
                    <SelectItem value="quarter">Trimestre</SelectItem>
                    <SelectItem value="year">Ano</SelectItem>
                    <SelectItem value="last3months">Últimos 3 Meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterPeriod === "month" && (
                <div>
                  <Label htmlFor="month">Mês/Ano</Label>
                  <Input
                    id="month"
                    type="month"
                    value={format(selectedMonth, "yyyy-MM")}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split("-");
                      setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1));
                    }}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="category">Categoria de Despesa</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categoriesData?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-destructive"}`}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Abas de Relatórios */}
        <Tabs defaultValue="cashflow" className="w-full">
          <TabsList>
            <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="expenses">Despesas por Categoria</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
          </TabsList>

          {/* Fluxo de Caixa */}
          <TabsContent value="cashflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa</CardTitle>
                <CardDescription>Entradas e saídas acumuladas</CardDescription>
              </CardHeader>
              <CardContent>
                {expensesLoading || salesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
                          <TableHead className="text-right">Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashFlow.map((transaction: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              <span className={transaction.type === "entrada" ? "text-green-600" : "text-destructive"}>
                                {transaction.type === "entrada" ? "Entrada" : "Saída"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium">
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
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma transação no período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Despesas por Categoria */}
          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição de gastos</CardDescription>
              </CardHeader>
              <CardContent>
                {expensesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : expensesByCategory.length > 0 ? (
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
                      <Tooltip formatter={(value: any) => `R$ ${typeof value === 'number' ? value.toFixed(2) : value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma despesa no período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendas */}
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>Todas as vendas do período</CardDescription>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : salesData && salesData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Valor Unit.</TableHead>
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
                            <TableCell className="text-right font-medium">
                              R$ {(sale.total / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma venda no período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botões de Download de PDF */}
        <div className="flex gap-4">
          <Button onClick={handleDownloadCashFlowPDF} className="gap-2" disabled={pdfLoading.cashFlow}>
            {pdfLoading.cashFlow ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Baixar Fluxo de Caixa (PDF)
              </>
            )}
          </Button>
          <Button onClick={handleDownloadDREPDF} className="gap-2" disabled={pdfLoading.dre}>
            {pdfLoading.dre ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Baixar DRE (PDF)
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
