import { describe, expect, it } from "vitest";

import { parseStatementFile } from "@/lib/parsers";
import { detectStatementFormat } from "@/lib/parsers/detect-file-type";
import { inferAccountType } from "@/lib/parsers/account-type";
import { normalizeRecord } from "@/lib/parsers/normalize";

describe("statement parsing utilities", () => {
  it("detects formats based on file metadata", () => {
    const csv = new File(["date,amount"], "statement.csv", { type: "text/csv" });
    const pdf = new File(["%PDF"], "card.pdf", { type: "application/pdf" });
    const excel = new File([""], "bank.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    expect(detectStatementFormat(csv)).toBe("csv");
    expect(detectStatementFormat(pdf)).toBe("pdf");
    expect(detectStatementFormat(excel)).toBe("excel");
  });

  it("infers account type from file name", () => {
    expect(inferAccountType("credit_card_statement.pdf")).toBe("credit-card");
    expect(inferAccountType("bank_statement_jan.csv")).toBe("bank");
  });

  it("normalises basic CSV transactions", async () => {
    const csv = new File(
      ["Date,Description,Amount\n2024-01-01,Coffee Shop,-5.50"],
      "statement.csv",
      { type: "text/csv" }
    );
    const result = await parseStatementFile(csv);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      description: "Coffee Shop",
      amount: 5.5,
      type: "debit",
      accountType: "bank",
      date: "2024-01-01",
    });
    expect(result.warnings).toHaveLength(0);
    expect(result.metadata).toMatchObject({
      accountType: "bank",
      bankName: null,
      accountNumber: null,
    });
  });

  it("returns warnings when required fields are missing", () => {
    const { transaction, warnings } = normalizeRecord(
      { Memo: "Unknown entry" },
      { fileName: "test.csv", accountType: "bank" }
    );
    expect(transaction).toBeNull();
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("handles fuzzy column name matching", async () => {
    const csv = new File(
      ["Transaction Date,Transaction Details,Withdrawal Amount,Deposit Amount\n2024-01-15,Grocery Store,50.00,\n2024-01-16,Salary Deposit,,2000.00"],
      "statement.csv",
      { type: "text/csv" }
    );
    const result = await parseStatementFile(csv);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0]).toMatchObject({
      description: "Grocery Store",
      amount: 50.0,
      type: "debit",
      date: "2024-01-15",
    });
    expect(result.transactions[1]).toMatchObject({
      description: "Salary Deposit",
      amount: 2000.0,
      type: "credit",
      date: "2024-01-16",
    });
  });

  it("provides helpful error messages with available columns", () => {
    const { transaction, warnings } = normalizeRecord(
      { "Unknown Column": "Some value", "Another Column": "Another value" },
      { fileName: "test.csv", accountType: "bank" }
    );
    expect(transaction).toBeNull();
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toContain("Available columns:");
    expect(warnings[0].message).toContain("Unknown Column");
  });

  it("captures bank metadata when available", async () => {
    const csv = new File(
      ["Date,Description,Amount,Bank Name,Account Number\n2024-02-01,Rent Payment,-1200.00,Sample Bank,9876543210"],
      "multi-bank.csv",
      { type: "text/csv" }
    );
    const result = await parseStatementFile(csv);
    expect(result.metadata).toMatchObject({
      accountType: "bank",
      bankName: "Sample Bank",
      accountNumber: "9876543210",
    });
  });

  it("normalises account metadata from raw rows", () => {
    const { transaction } = normalizeRecord(
      {
        Date: "2024-03-05",
        Description: "Utility Bill",
        Amount: "-75.35",
        "Bank Name": "City Credit Union",
        "Account Number": "ACC-12345",
      },
      { fileName: "utility.csv", accountType: "bank" }
    );
    expect(transaction).not.toBeNull();
    expect(transaction).toMatchObject({
      bankName: "City Credit Union",
      accountNumber: "ACC-12345",
    });
  });
});


