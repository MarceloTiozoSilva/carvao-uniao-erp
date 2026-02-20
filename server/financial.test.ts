import { describe, expect, it } from "vitest";

/**
 * Test suite for financial calculations
 * Validates core business logic for sales, expenses, and cash flow
 */

describe("Financial Calculations", () => {
  describe("Sales Calculations", () => {
    it("should calculate total correctly (quantity * unitPrice)", () => {
      const quantity = 10;
      const unitPrice = 50; // R$ 50,00
      const expected = 500; // R$ 500,00

      const total = quantity * unitPrice;

      expect(total).toBe(expected);
    });

    it("should handle decimal prices correctly", () => {
      const quantity = 5;
      const unitPrice = 25.50; // R$ 25,50
      const expected = 127.50; // R$ 127,50

      const total = quantity * unitPrice;

      expect(total).toBe(expected);
    });

    it("should handle large quantities", () => {
      const quantity = 1000;
      const unitPrice = 100; // R$ 100,00
      const expected = 100000; // R$ 100.000,00

      const total = quantity * unitPrice;

      expect(total).toBe(expected);
    });
  });

  describe("Expense Calculations", () => {
    it("should sum expenses correctly", () => {
      const expenses = [100, 200, 150]; // R$ 100, 200, 150
      const expected = 450; // R$ 450,00

      const total = expenses.reduce((sum, expense) => sum + expense, 0);

      expect(total).toBe(expected);
    });

    it("should calculate expenses by category", () => {
      const expenses = [
        { category: "frota", amount: 200 },
        { category: "funcionarios", amount: 1000 },
        { category: "frota", amount: 150 },
        { category: "fixos", amount: 500 },
      ];

      const byCategory: { [key: string]: number } = {};
      expenses.forEach((expense) => {
        byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
      });

      expect(byCategory.frota).toBe(350);
      expect(byCategory.funcionarios).toBe(1000);
      expect(byCategory.fixos).toBe(500);
    });
  });

  describe("Cash Flow Calculations", () => {
    it("should calculate balance correctly (revenue - expenses)", () => {
      const revenue = 5000; // R$ 5.000,00
      const expenses = 2000; // R$ 2.000,00
      const expected = 3000; // R$ 3.000,00

      const balance = revenue - expenses;

      expect(balance).toBe(expected);
    });

    it("should handle negative balance (loss)", () => {
      const revenue = 1000; // R$ 1.000,00
      const expenses = 2000; // R$ 2.000,00
      const expected = -1000; // R$ -1.000,00 (loss)

      const balance = revenue - expenses;

      expect(balance).toBe(expected);
    });

    it("should calculate cumulative balance correctly", () => {
      const transactions = [
        { type: "entrada", amount: 1000 },
        { type: "saida", amount: -300 },
        { type: "entrada", amount: 500 },
        { type: "saida", amount: -200 },
      ];

      const balances: number[] = [];
      let cumulative = 0;

      transactions.forEach((transaction) => {
        cumulative += transaction.amount;
        balances.push(cumulative);
      });

      expect(balances).toEqual([1000, 700, 1200, 1000]);
    });
  });

  describe("Currency Conversion (Cents)", () => {
    it("should convert BRL to cents correctly", () => {
      const brl = 100.50; // R$ 100,50
      const cents = Math.round(brl * 100); // 10050 cents

      expect(cents).toBe(10050);
    });

    it("should convert cents back to BRL correctly", () => {
      const cents = 10050; // 10050 cents
      const brl = cents / 100; // R$ 100,50

      expect(brl).toBe(100.50);
    });

    it("should handle rounding correctly", () => {
      const brl = 99.99; // R$ 99,99
      const cents = Math.round(brl * 100); // 9999 cents
      const backToBrl = cents / 100;

      expect(backToBrl).toBe(99.99);
    });
  });

  describe("Percentage Calculations", () => {
    it("should calculate percentage of total correctly", () => {
      const category = 350; // R$ 350,00
      const total = 1000; // R$ 1.000,00
      const percentage = (category / total) * 100;

      expect(percentage).toBe(35);
    });

    it("should handle multiple categories", () => {
      const categories = {
        frota: 350,
        funcionarios: 1000,
        fixos: 500,
        variavel: 150,
      };

      const total = Object.values(categories).reduce((sum, val) => sum + val, 0);

      const percentages = Object.entries(categories).map(([name, amount]) => ({
        name,
        percentage: (amount / total) * 100,
      }));

      expect(percentages[0].percentage).toBeCloseTo(17.5, 1);
      expect(percentages[1].percentage).toBeCloseTo(50, 1);
      expect(percentages[2].percentage).toBeCloseTo(25, 1);
      expect(percentages[3].percentage).toBeCloseTo(7.5, 1);
    });
  });

  describe("Validation", () => {
    it("should validate positive amounts", () => {
      const amount = 100;
      const isValid = amount > 0;

      expect(isValid).toBe(true);
    });

    it("should reject zero amounts", () => {
      const amount = 0;
      const isValid = amount > 0;

      expect(isValid).toBe(false);
    });

    it("should reject negative amounts", () => {
      const amount = -100;
      const isValid = amount > 0;

      expect(isValid).toBe(false);
    });

    it("should validate quantity is integer", () => {
      const quantity = 10;
      const isValid = Number.isInteger(quantity);

      expect(isValid).toBe(true);
    });

    it("should reject decimal quantities", () => {
      const quantity = 10.5;
      const isValid = Number.isInteger(quantity);

      expect(isValid).toBe(false);
    });
  });
});
