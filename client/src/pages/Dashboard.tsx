import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { useEffect, useState, useMemo } from "react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface MonthlyData {
  month: string;
  sales: number;
  expenses: number;
}

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = [
  "oklch(0.55 0.2 260)",
  "oklch(0.65 0.15 280)",
  "oklch(0.45 0.15 240)",
  "oklch(0.35 0.12 200)",
  "oklch(0.75 0.1 300)",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [overdueAccounts, setOverdueAccounts] = useState(0);
  const [upcomingAccounts, setUpcomingAccounts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);

  const startDate = useMemo(() => subMonths(new Date(), 11), []);
  const endDate = useMemo(() => new Date(), []);

  const { data: salesData, isLoading: salesLoading } = trpc.sales.list.useQuery({
    startDate,
    endDate,
  });

  const { data: expensesData, isLoading: expensesLoading } = trpc.expenses.list.useQuery({
    startDate,
    endDate,
  });

  const { data: accountsData, isLoading: accountsLoading } = trpc.accounts.list.useQuery();
  const { data: stockData, isLoading: stockLoading } = trpc.stockMovements.list.useQuery();

  const { data: categoriesData, isLoading: categoriesLoading } = trpc.categories.list.useQuery();

  useEffect(() => {
    if (salesLoading || expensesLoading || categoriesLoading) {
      return;
    }

    if (!salesData || !expensesData) {
      return;
    }

    try {
      if (accountsData) {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        let overdue = 0;
        let upcoming = 0;
        accountsData.forEach((account: any) => {
          if (account.status !== "pago") {
            const dueDate = new Date(account.dueDate);
            if (dueDate < now) {
              overdue++;
            } else if (dueDate <= sevenDaysFromNow) {
              upcoming++;
            }
          }
        });
        setOverdueAccounts(overdue);
        setUpcomingAccounts(upcoming);
      }
      if (stockData) {
        const totalTonnes = stockData.reduce((acc: number, movement: any) => {
          const quantity = typeof movement.quantityTonnes === 'string' ? parseFloat(movement.quantityTonnes) : movement.quantityTonnes;
          return movement.type === "entrada" ? acc + quantity : acc - quantity;
        }, 0);
        setTotalStock(totalTonnes);
      }
      const months: { [key: string]: { sales: number; expenses: number } } = {};
      
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, "MMM/yy", { locale: ptBR });
        months[monthKey] = { sales: 0, expenses: 0 };
      }

      salesData.forEach((sale: any) => {
        const monthKey = format(new Date(sale.date), "MMM/yy", { locale: ptBR });
        if (months[monthKey]) {
          months[monthKey].sales += sale.total / 100;
        }
      });

      expensesData.forEach((expense: any) => {
        const monthKey = format(new Date(expense.date), "MMM/yy", { locale: ptBR });
        if (months[monthKey]) {
          months[monthKey].expenses += expense.amount / 100;
        }
      });

      setMonthlyData(Object.entries(months).map(([month, data]) => ({
        month,
        sales: Math.round(data.sales * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100,
      })));

      const revenue = salesData.reduce((sum: number, sale: any) => sum + sale.total / 100, 0);
      const expenses = expensesData.reduce((sum: number, expense: any) => sum + expense.amount / 100, 0);
      
      setTotalRevenue(Math.round(revenue * 100) / 100);
      setTotalExpenses(Math.round(expenses * 100) / 100);
      setBalance(Math.round((revenue - expenses) * 100) / 100);

      if (categoriesData && categoriesData.length > 0) {
        const categoryTotals: { [key: number]: number } = {};
        
        expensesData.forEach((expense: any) => {
          const categoryId = expense.categoryId;
          categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + expense.amount / 100;
        });

        const categoryDataFormatted = Object.entries(categoryTotals).map(([categoryId, total]) => {
          const category = categoriesData.find((c: any) => c.id === parseInt(categoryId));
          return {
            name: category?.name || "Sem categoria",
            value: Math.round(total * 100) / 100,
          };
        });

        setCategoryData(categoryDataFormatted);
      }
    } catch (error) {
      console.error("Erro ao processar dados do dashboard:", error);
    }
  }, [salesData, expensesData, categoriesData, accountsData, stockData, salesLoading, expensesLoading, categoriesLoading, accountsLoading, stockLoading]);

  const isLoading = salesLoading || expensesLoading || categoriesLoading || accountsLoading || stockLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão Financeira</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Últimos 12 meses</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Últimos 12 meses</p>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#C8A96E' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Receita - Despesa</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contas Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {overdueAccounts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pendentes de pagamento</p>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#C8A96E' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vencimento Próximo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#C8A96E' }}>
                {upcomingAccounts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Próximos 7 dias</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalStock.toFixed(2)} ton
              </div>
              <p className="text-xs text-muted-foreground mt-1">Toneladas em estoque</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vendas vs Despesas</CardTitle>
              <CardDescription>Comparação mensal dos últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="var(--chart-1)" name="Vendas" />
                    <Bar dataKey="expenses" fill="var(--chart-3)" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>Distribuição dos gastos</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="45%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                      formatter={(value: any) => `R$ ${(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    />
                    <Legend 
                      verticalAlign="middle" 
                      align="right"
                      layout="vertical"
                      formatter={(value, entry) => {
                        const data = (entry as any).payload;
                        return `${data.name}: R$ ${(data.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhuma despesa registrada
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
