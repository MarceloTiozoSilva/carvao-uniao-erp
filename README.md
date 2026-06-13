# Carvão União - Sistema de Gestão

Sistema Sistema de Gestão Financeira da Carvão União.

## Sobre o projeto

Desenvolvido com Manus e tRPC, este sistema integra gestão de vendas, despesas, contas a pagar/receber, estoque e relatórios financeiros em uma única plataforma. Inclui dashboard em tempo real com KPIs críticos, tabelas de gestão de clientes, produtos e fornecedores, e análise de fluxo de caixa.

## Stack

**Frontend:**
- React 19 + Tailwind CSS 4
- tRPC para comunicação com backend
- Shadcn/ui para componentes

**Backend:**
- Express 4
- tRPC 11
- Drizzle ORM com MySQL/TiDB

**Autenticação:**
- Manus OAuth

**Banco de dados:**
- MySQL com Drizzle migrations

## Funcionalidades

✅ **Dashboard** — KPIs em tempo real (Faturamento, Despesas, Saldo, Estoque)
✅ **Gestão de Vendas** — Registro e acompanhamento de movimentações
✅ **Gestão Financeira** — Contas a pagar/receber com vencimentos
✅ **Estoque** — Controle de toneladas por produto
✅ **Cadastros** — Clientes, Produtos, Fornecedores com tabelas compactas
✅ **Relatórios** — Fluxo de caixa e DRE
✅ **Identidade Visual** — Branding Carvão União (cores: dourado #C8A96E, vermelho #CC2200)

## Como usar

1. **Acesse o sistema:** https://carvaoerp-v7dldryq.manus.space
2. **Faça login** com sua conta Manus
3. **Navegue pelos módulos** no menu lateral
4. **Adicione dados** usando os botões "Nova [Entidade]"
5. **Acompanhe métricas** no Dashboard

## Desenvolvimento local

```bash
# Instalar dependências
pnpm install

# Executar migrations do banco
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev

# Rodar testes
pnpm test
```

## Estrutura do projeto

```
client/          # Frontend React
server/          # Backend Express + tRPC
drizzle/         # Schema e migrations
shared/          # Tipos compartilhados
storage/         # Helpers S3
```

## Autor

Marcelo Tiozo da Silva

---

**Status:** Em desenvolvimento ativo | **Versão:** 1.0.0 | **Licença:** Privada
