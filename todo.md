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
- [x] Filtros por período (mês, trimestre, ano)
- [x] Exportação de dados

### Relatório de Despesas por Categoria
- [x] Análise de gastos por tipo
- [x] Gráfico de distribuição de despesas
- [x] Tabela com totais por categoria
- [x] Filtros por período

### Relatório de Vendas
- [x] Histórico completo de vendas
- [x] Análise de desempenho comercial
- [x] Gráficos de tendência
- [x] Filtros por período e cliente

### Geração de Relatórios em PDF
- [x] Geração de fluxo de caixa em PDF
- [x] Geração de DRE (Demonstrativo de Resultados) em PDF
- [x] Armazenamento de relatórios
- [x] Download de relatórios

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
- [x] Tabela de clientes
- [x] Tabela de produtos

## Funcionalidades Adicionais
- [x] Cadastro de clientes com dados completos
- [x] Cadastro de produtos com descrição e valor
- [x] Edição de despesas
- [x] Edição de vendas
- [x] Filtros avançados em relatórios
- [x] Exportação de relatórios em PDF (Fluxo de Caixa e DRE)

## Testes
- [x] Testes unitários para cálculos financeiros
- [x] Testes de CRUD de clientes
- [x] Testes de CRUD de produtos
- [x] Testes de edição de despesas e vendas
- [x] Testes de validação de dados
- [x] Testes de geração de PDFs

## Ajustes Solicitados
- [ ] Vincular clientes e produtos ao formulário de vendas
- [ ] Corrigir proporção e labels do gráfico em pizza (Despesas por Categoria)
- [ ] Implementar interface de download de relatórios em PDF


## Melhorias Solicitadas - Fase 2

### Visual e Tema Escuro
- [ ] Migrar para tema escuro profissional
- [ ] Sidebar: fundo preto/cinza carvão (#1a1a2e), texto branco
- [ ] Fundo geral: cinza escuro (#0f0f1a)
- [ ] Cards KPI: fundo escuro com borda azul elétrico (#1e90ff)
- [ ] Botões: azul elétrico com hover
- [ ] Adaptar gráficos para tema escuro
- [ ] Textos: branco e cinza claro para hierarquia

### Menu Lateral - Hierarquia
- [ ] Grupo 1: Dashboard, Vendas, Despesas, Relatórios
- [ ] Grupo 2 "Cadastros": Clientes, Produtos, Fornecedores
- [ ] Adicionar divisória sutil entre grupos

### Módulo de Estoque
- [ ] Criar tabela de estoque no banco
- [ ] Cadastro de movimentações (entrada/saída)
- [ ] Campos: data, tipo, produto, quantidade (toneladas), valor unitário, fornecedor, observação
- [ ] Listagem com filtro por período e produto
- [ ] Card de saldo atual por produto
- [ ] Vincular ao módulo de Fornecedores

### Módulo de Contas a Pagar/Receber
- [ ] Criar tabela de contas no banco
- [ ] Cadastro de compromissos futuros
- [ ] Campos: descrição, tipo (pagar/receber), valor, vencimento, status, categoria, cliente/fornecedor
- [ ] Listagem com filtro por tipo, status, período
- [ ] Indicador visual de contas vencidas (vermelho)
- [ ] Dashboard: card com contas vencidas e a vencer (7 dias)

### Módulo de Fornecedores
- [ ] Criar tabela de fornecedores no banco
- [ ] Cadastro com: nome, CNPJ/CPF, telefone, email, produto, observações
- [ ] Listagem com busca por nome
- [ ] Vincular em Despesas e Estoque
- [ ] Adicionar ao menu "Cadastros"

### Dashboard - Atualizações
- [ ] Card de contas vencidas e a vencer
- [ ] Indicadores visuais de alertas
- [ ] Integração com novos módulos
