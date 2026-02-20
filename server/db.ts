import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sales, InsertSale, expenses, InsertExpense, expenseCategories } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getSalesByUserId(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(sales.userId, userId)];
  
  if (startDate && endDate) {
    conditions.push(sql`${sales.date} >= ${startDate}`);
    conditions.push(sql`${sales.date} <= ${endDate}`);
  }
  
  return db.select().from(sales).where(and(...conditions)).orderBy(sql`${sales.date} DESC`);
}

export async function getExpensesByUserId(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(expenses.userId, userId)];
  
  if (startDate && endDate) {
    conditions.push(sql`${expenses.date} >= ${startDate}`);
    conditions.push(sql`${expenses.date} <= ${endDate}`);
  }
  
  return db
    .select()
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .where(and(...conditions))
    .orderBy(sql`${expenses.date} DESC`);
}

export async function getExpenseCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenseCategories);
}

export async function createSale(sale: InsertSale) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sales).values(sale);
  return result;
}

export async function createExpense(expense: InsertExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(expenses).values(expense);
  return result;
}

export async function updateSale(id: number, updates: Partial<InsertSale>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(sales).set(updates).where(eq(sales.id, id));
}

export async function updateExpense(id: number, updates: Partial<InsertExpense>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(expenses).set(updates).where(eq(expenses.id, id));
}

export async function deleteSale(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { sales: salesTable } = await import("../drizzle/schema");
  return db.delete(salesTable).where(eq(salesTable.id, id));
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { expenses: expensesTable } = await import("../drizzle/schema");
  return db.delete(expensesTable).where(eq(expensesTable.id, id));
}
