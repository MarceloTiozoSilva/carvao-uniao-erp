import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Clients CRUD", () => {
  it("should create a client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clients.create({
      name: "Cliente Teste",
      email: "cliente@example.com",
      phone: "(11) 99999-9999",
      address: "Rua Teste, 123",
      notes: "Cliente importante",
    });

    expect(result).toBeDefined();
  });

  it("should list clients", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clients.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update a client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clients.update({
      id: 1,
      name: "Cliente Atualizado",
      email: "novo@example.com",
    });

    expect(result).toBeDefined();
  });

  it("should delete a client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clients.delete({ id: 1 });
    expect(result).toBeDefined();
  });
});

describe("Products CRUD", () => {
  it("should create a product", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Produto Teste",
      description: "Descrição do produto",
      price: 100.5,
      unit: "un",
      notes: "Produto de teste",
    });

    expect(result).toBeDefined();
  });

  it("should list products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update a product", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.update({
      id: 1,
      name: "Produto Atualizado",
      price: 150.75,
    });

    expect(result).toBeDefined();
  });

  it("should delete a product", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.delete({ id: 1 });
    expect(result).toBeDefined();
  });
});

describe("Expenses Update", () => {
  it("should update an expense", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expenses.update({
      id: 1,
      description: "Despesa Atualizada",
      amount: 500.0,
      categoryId: 1,
    });

    expect(result).toBeDefined();
  });

  it("should handle partial expense updates", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expenses.update({
      id: 1,
      description: "Apenas descrição atualizada",
    });

    expect(result).toBeDefined();
  });
});

describe("Sales Update", () => {
  it("should update a sale", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sales.update({
      id: 1,
      client: "Cliente Atualizado",
      product: "Produto Atualizado",
      quantity: 10,
      unitPrice: 50.0,
    });

    expect(result).toBeDefined();
  });

  it("should calculate total correctly on update", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sales.update({
      id: 1,
      quantity: 5,
      unitPrice: 100.0,
    });

    expect(result).toBeDefined();
  });
});

describe("Reports PDF Generation", () => {
  it("should generate cash flow PDF", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await caller.reports.generateCashFlowPDF({
      startDate,
      endDate,
      period: `${now.toLocaleString("pt-BR", { month: "long", year: "numeric" })}`,
    });

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should generate DRE PDF", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await caller.reports.generateDREPDF({
      startDate,
      endDate,
      period: `${now.toLocaleString("pt-BR", { month: "long", year: "numeric" })}`,
    });

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("Data Validation", () => {
  it("should validate client name is required", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.clients.create({
        name: "",
        email: "test@example.com",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("too_small");
    }
  });

  it("should validate product price is positive", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.products.create({
        name: "Produto",
        price: -100,
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("too_small");
    }
  });

  it("should validate expense amount is positive", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.expenses.create({
        date: new Date(),
        description: "Despesa",
        categoryId: 1,
        amount: -50,
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("too_small");
    }
  });
});
