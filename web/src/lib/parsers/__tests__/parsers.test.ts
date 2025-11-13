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
  });

  it("returns warnings when required fields are missing", () => {
    const { transaction, warnings } = normalizeRecord(
      { Memo: "Unknown entry" },
      { fileName: "test.csv", accountType: "bank" }
    );
    expect(transaction).toBeNull();
    expect(warnings.length).toBeGreaterThan(0);
  });
});


