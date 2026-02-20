# Carvão União - Sistema de Gestão Financeira

## Funcionalidades Obrigatórias

### Autenticação e Acesso
- [x] Sistema de autenticação com Manus OAuth
- [x] Controle de acesso aos dados da empresa
- [x] Página de login/logout

### Dashboard Principal
- [x] Visão geral com faturamento mensal
- [x] Exibição de total de despesas
- [x] Exibição de saldo atual
- [x] Gráfico de vendas (últimos 12 meses)
- [x] Gráfico de custos (últimos 12 meses)
- [x] Cards resumidos com KPIs principais

### Módulo de Vendas
- [x] Formulário de lançamento de vendas
- [x] Campos: data, cliente, produto, quantidade, valor unitário
- [x] Cálculo automático do total (quantidade × valor unitário)
- [x] Listagem de vendas com filtros
- [x] Edição e exclusão de vendas
- [x] Validações de entrada

### Controle de Despesas
- [x] Formulário de lançamento de despesas
- [x] Categorização: custos fixos, custos variáveis, manutenção de frota, despesas com funcionários
- [x] Campos: data, descrição, categoria, valor
- [x] Listagem de despesas com filtros
- [x] Edição e exclusão de despesas
- [x] Validações de entrada

### Relatório de Fluxo de Caixa
- [x] Visualização de todas as entradas (vendas)
- [x] Visualização de todas as saídas (despesas)
- [x] Cálculo de saldo acumulado
- [ ] Filtros por período (mês, trimestre, ano)
- [ ] Exportação de dados

### Relatório de Despesas por Categoria
- [x] Análise de gastos por tipo
- [x] Gráfico de distribuição de despesas
- [x] Tabela com totais por categoria
- [ ] Filtros por período

### Relatório de Vendas
- [x] Histórico completo de vendas
- [ ] Análise de desempenho comercial
- [ ] Gráficos de tendência
- [ ] Filtros por período e cliente

### Geração de Relatórios em PDF
- [ ] Geração de fluxo de caixa em PDF
- [ ] Geração de DRE (Demonstrativo de Resultados) em PDF
- [ ] Armazenamento de relatórios
- [ ] Download de relatórios

### Design e UX
- [x] Estilo elegante e refinado
- [x] Layout responsivo
- [x] Navegação intuitiva
- [x] Paleta de cores profissional
- [x] Tipografia clara e legível

## Estrutura do Banco de Dados
- [x] Tabela de vendas
- [x] Tabela de despesas
- [x] Tabela de categorias de despesas
- [ ] Tabela de clientes (opcional)

## Testes
- [x] Testes unitários para cálculos financeiros
- [ ] Testes de validação de formulários
