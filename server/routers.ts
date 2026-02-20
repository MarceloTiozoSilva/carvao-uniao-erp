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
} from "./db";

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
});

export type AppRouter = typeof appRouter;
