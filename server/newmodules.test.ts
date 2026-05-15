import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("New Modules - Suppliers, Stock, Accounts", () => {
  it("should list suppliers", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.suppliers.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list stock movements", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stockMovements.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list accounts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.accounts.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should have suppliers router with CRUD operations", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Verify that all operations exist
    expect(typeof caller.suppliers.list).toBe("function");
    expect(typeof caller.suppliers.create).toBe("function");
    expect(typeof caller.suppliers.update).toBe("function");
    expect(typeof caller.suppliers.delete).toBe("function");
  });

  it("should have stock movements router with CRUD operations", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Verify that all operations exist
    expect(typeof caller.stockMovements.list).toBe("function");
    expect(typeof caller.stockMovements.create).toBe("function");
    expect(typeof caller.stockMovements.update).toBe("function");
    expect(typeof caller.stockMovements.delete).toBe("function");
  });

  it("should have accounts router with CRUD operations", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Verify that all operations exist
    expect(typeof caller.accounts.list).toBe("function");
    expect(typeof caller.accounts.create).toBe("function");
    expect(typeof caller.accounts.update).toBe("function");
    expect(typeof caller.accounts.delete).toBe("function");
  });
});
