import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Stock from "./pages/Stock";
import Accounts from "./pages/Accounts";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/vendas"} component={Sales} />
      <Route path={"/despesas"} component={Expenses} />
      <Route path={"/relatorios"} component={Reports} />
      <Route path={"/clientes"} component={Clients} />
      <Route path={"/produtos"} component={Products} />
      <Route path={"/fornecedores"} component={Suppliers} />
      <Route path={"/estoque"} component={Stock} />
      <Route path={"/contas"} component={Accounts} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
