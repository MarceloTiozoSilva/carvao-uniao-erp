import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getSalesByUserId,
  getExpensesByUserId,
  getExpenseCategories,
  createSale,
  createExpense,
  updateSale,
  updateExpense,
  deleteSale,
  deleteExpense,
  getClientsByUserId,
  createClient,
  updateClient,
  deleteClient,
  getProductsByUserId,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./db";
import { generateCashFlowPDF, generateDREPDF } from "./pdf";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  sales: router({
    list: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return getSalesByUserId(ctx.user.id, input.startDate, input.endDate);
      }),

    create: protectedProcedure
      .input(
        z.object({
          date: z.date(),
          client: z.string().min(1),
          product: z.string().min(1),
          quantity: z.number().int().positive(),
          unitPrice: z.number().positive(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const total = input.quantity * input.unitPrice;
        return createSale({
          userId: ctx.user.id,
          date: input.date,
          client: input.client,
          product: input.product,
          quantity: input.quantity,
          unitPrice: Math.round(input.unitPrice * 100), // Convert to cents
          total: Math.round(total * 100), // Convert to cents
          notes: input.notes,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          date: z.date().optional(),
          client: z.string().min(1).optional(),
          product: z.string().min(1).optional(),
          quantity: z.number().int().positive().optional(),
          unitPrice: z.number().positive().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updates: any = {};
        if (input.date) updates.date = input.date;
        if (input.client) updates.client = input.client;
        if (input.product) updates.product = input.product;
        if (input.quantity) updates.quantity = input.quantity;
        if (input.unitPrice) {
          updates.unitPrice = Math.round(input.unitPrice * 100);
          if (input.quantity) {
            updates.total = Math.round(input.quantity * input.unitPrice * 100);
          }
        }
        if (input.notes !== undefined) updates.notes = input.notes;

        return updateSale(input.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteSale(input.id);
      }),
  }),

  expenses: router({
    list: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return getExpensesByUserId(ctx.user.id, input.startDate, input.endDate);
      }),

    create: protectedProcedure
      .input(
        z.object({
          date: z.date(),
          description: z.string().min(1),
          categoryId: z.number(),
          amount: z.number().positive(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createExpense({
          userId: ctx.user.id,
          date: input.date,
          description: input.description,
          categoryId: input.categoryId,
          amount: Math.round(input.amount * 100), // Convert to cents
          notes: input.notes,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          date: z.date().optional(),
          description: z.string().min(1).optional(),
          categoryId: z.number().optional(),
          amount: z.number().positive().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updates: any = {};
        if (input.date) updates.date = input.date;
        if (input.description) updates.description = input.description;
        if (input.categoryId) updates.categoryId = input.categoryId;
        if (input.amount) updates.amount = Math.round(input.amount * 100);
        if (input.notes !== undefined) updates.notes = input.notes;

        return updateExpense(input.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteExpense(input.id);
      }),
  }),

  categories: router({
    list: protectedProcedure.query(async () => {
      return getExpenseCategories();
    }),
  }),

  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getClientsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createClient({
          userId: ctx.user.id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          notes: input.notes,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updates: any = {};
        if (input.name) updates.name = input.name;
        if (input.email) updates.email = input.email;
        if (input.phone) updates.phone = input.phone;
        if (input.address) updates.address = input.address;
        if (input.notes !== undefined) updates.notes = input.notes;
        return updateClient(input.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteClient(input.id);
      }),
  }),

  products: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getProductsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          price: z.number().positive(),
          unit: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createProduct({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          price: Math.round(input.price * 100),
          unit: input.unit || 'un',
          notes: input.notes,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          price: z.number().positive().optional(),
          unit: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updates: any = {};
        if (input.name) updates.name = input.name;
        if (input.description) updates.description = input.description;
        if (input.price) updates.price = Math.round(input.price * 100);
        if (input.unit) updates.unit = input.unit;
        if (input.notes !== undefined) updates.notes = input.notes;
        return updateProduct(input.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteProduct(input.id);
      }),
  }),

  reports: router({
    generateCashFlowPDF: protectedProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
          period: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const sales = await getSalesByUserId(ctx.user.id, input.startDate, input.endDate);
        const expenses = await getExpensesByUserId(ctx.user.id, input.startDate, input.endDate);

        const totalSales = sales?.reduce((sum: number, sale: any) => sum + sale.total / 100, 0) || 0;
        const totalExpenses = expenses?.reduce((sum: number, expense: any) => sum + expense.amount / 100, 0) || 0;
        const balance = totalSales - totalExpenses;

        const cashFlow = [
          ...(sales?.map((s: any) => ({
            date: new Date(s.date).toLocaleDateString("pt-BR"),
            description: `Venda - ${s.client}`,
            type: "entrada" as const,
            amount: s.total / 100,
            balance: 0,
          })) || []),
          ...(expenses?.map((e: any) => ({
            date: new Date(e.date).toLocaleDateString("pt-BR"),
            description: `Despesa - ${e.description}`,
            type: "saida" as const,
            amount: -(e.amount / 100),
            balance: 0,
          })) || []),
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let cumulativeBalance = 0;
        cashFlow.forEach((item: any) => {
          cumulativeBalance += item.amount;
          item.balance = cumulativeBalance;
        });

        const pdf = await generateCashFlowPDF(cashFlow, totalSales, totalExpenses, balance, input.period);
        return pdf.toString("base64");
      }),

    generateDREPDF: protectedProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
          period: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const sales = await getSalesByUserId(ctx.user.id, input.startDate, input.endDate);
        const expenses = await getExpensesByUserId(ctx.user.id, input.startDate, input.endDate);
        const categories = await getExpenseCategories();

        const totalSales = sales?.reduce((sum: number, sale: any) => sum + sale.total / 100, 0) || 0;
        const totalExpenses = expenses?.reduce((sum: number, expense: any) => sum + expense.amount / 100, 0) || 0;
        const balance = totalSales - totalExpenses;

        const categoryTotals: { [key: number]: number } = {};
        expenses?.forEach((expense: any) => {
          const categoryId = expense.categoryId;
          categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + expense.amount / 100;
        });

        const expensesByCategory = Object.entries(categoryTotals).map(([categoryId, total]) => {
          const category = categories.find((c: any) => c.id === parseInt(categoryId));
          return {
            name: category?.name || "Sem categoria",
            value: Math.round(total * 100) / 100,
          };
        });

        const pdf = await generateDREPDF(totalSales, totalExpenses, balance, expensesByCategory, input.period);
        return pdf.toString("base64");
      }),
  }),
});

export type AppRouter = typeof appRouter;
