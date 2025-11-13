# 🛠 Tech Spec v1 — SpendSight (Phase 1 Web)

**Owner:** Saquib  
**Status:** Draft v1  
**Platforms:** Web (Next.js)  
**Future:** React Native (Expo) sharing core logic  
**Data:** Client-side only, no backend persistence

---

## 1. Architecture Overview

### 1.1 High-Level
SpendSight is a **single-page web application** built on **Next.js + React + TypeScript**.  
All core logic (parsing, categorisation, recurring detection, exports) runs **in the browser**.

- No backend for Phase 1.  
- Optional LLM classification via external API (configurable + optional).  
- User-defined category rules stored in **IndexedDB** using **Dexie**.

### 1.2 Key Modules
1. File Ingestion & Parsing Module  
2. Normalization & Transaction Model  
3. Categorisation Engine  
4. Recurring & New Spend Detector  
5. Local Rule Storage (IndexedDB)  
6. Visualization Engine  
7. Export Engine (Excel/PDF)  
8. LLM Adapter (optional)  
9. UI Layer  
10. App State Management  

---

## 2. Tech Stack

- **Framework:** Next.js 15  
- **Language:** TypeScript  
- **UI:** React 19, TailwindCSS, ShadCN UI  
- **State Management:** React Context + custom hooks  
- **Local Storage:** IndexedDB via Dexie  
- **Parsing:** pdf.js, papaparse, SheetJS  
- **Charts:** Recharts (or Chart.js)  
- **Export:** jsPDF / pdf-lib, SheetJS  
- **Optional LLM:** OpenAI/Anthropic via encrypted API  

---

## 3. Data Model & Types

### 3.1 Core Types

```ts
export type AccountType = "bank" | "credit-card";
export type TransactionType = "debit" | "credit";

export interface Transaction {
  id: string;
  date: string;
  rawDate: string;
  description: string;
  amount: number;
  type: TransactionType;
  accountType: AccountType;
  sourceFileName: string;

  category?: string | null;
  subcategory?: string | null;
  isRecurring?: boolean;
  isNewSpend?: boolean;
  classificationConfidence?: number;
  classificationSource?: "rule" | "llm" | "manual" | "none";
}
```

```ts
export interface CategoryRule {
  id: string;
  keyword: string;
  category: string;
  subcategory?: string | null;
  createdAt: number;
  matchType: "contains" | "startsWith" | "regex";
}
```

```ts
export type Frequency = "monthly" | "weekly" | "custom";

export interface RecurringExpense {
  id: string;
  merchant: string;
  frequency: Frequency;
  transactionIds: string[];
  averageAmount: number;
  amountPattern: number[];
}
```

---

## 4. Module Design

### 4.1 File Ingestion & Parsing Module

Converts user-uploaded documents into unified `Transaction[]`.

Supported formats:  
- **PDF** → pdf.js  
- **CSV** → Papaparse  
- **Excel** → SheetJS  

---

### 4.2 Categorisation Engine

Pipeline:
1. Apply **local rules**  
2. If still uncategorized → **LLM (optional)**  
3. Manual category selection fallback  

---

### 4.3 Recurring & New Spend Detector

**Recurring logic:**
- Merchant grouping  
- Analyze periodicity  
- Monthly/weekly detection  
- ±3 day tolerance  
- ±10% amount variation  

**New spend logic:**
- Merchant appears first time in batch  
- Not recurring  
- No rule exists  

---

### 4.4 Local Rule Storage (IndexedDB)

Rules schema:
```ts
{
  id: uuid,
  keyword: string,
  category: string,
  subcategory: string | null,
  matchType: "contains" | "startsWith" | "regex",
  createdAt: number
}
```

---

### 4.5 Visualization Engine

Prepares chart data for:
- Category pie chart  
- Daily spend line graph  
- Recurring vs non-recurring bar  
- Top merchants  
- Category trend  

---

### 4.6 Export Engine

**Excel (SheetJS):**  
Sheets:
1. RawTransactions  
2. CategorisedTransactions  
3. RecurringExpenses  
4. NewSpends  
5. Summary  
6. CategoryRules  
7. Charts (optional)  

**PDF Export:**  
- Convert charts → PNG via html2canvas  
- Insert into pdf-lib/jsPDF  

---

### 4.7 Optional LLM Adapter

Input to model:
```ts
{
  id: string,
  description: string,
  amount: number,
  type: "debit" | "credit"
}
```

Output:
```ts
{
  id: string,
  category: string,
  subcategory?: string,
  confidence: number
}
```

---

## 5. UI & Pages

- `/` → LandingPage  
- `/analyze` → Upload → Categorize → Insights → Export  
- `/settings` → LLM toggle, clear local data  

Components:
- FileDropzone  
- ParsingPreview  
- TransactionsTable  
- CategoryEditor  
- RecurringList  
- NewSpendList  
- VisualizationSelector  
- Dashboard  
- ExportModal  

---

## 6. Error Handling & Edge Cases

- Malformed PDF  
- Unknown date formats  
- Missing columns  
- LLM request timeouts  
- Large files → show progress UI  

---

## 7. Security & Privacy

- No backend  
- All parsing in browser  
- LLM requests encrypted & ephemeral  
- User rules stored locally only  
- “Clear Local Data” wipes IndexedDB  

---

## 8. Performance Considerations

- Lazy-load heavy libs  
- Memoize chart data  
- Possible Web Worker offloading for large datasets  

---

## 9. Testing Strategy

### Unit tests:
- Date parsing  
- Amount parsing  
- Rule matching  
- Recurring detection  
- New spend detection  

### Integration:
- Upload → Categorize → Export pipeline  

### Manual QA:
- Bank formats  
- Only credits/debits  
- All uncategorized flows  

---

## 10. Phase 1 Deliverables

- File Upload & Parse  
- Categorisation Engine (Rules + LLM optional)  
- Recurring & New Spend Detection  
- Visualization Engine  
- Excel + PDF Export  
- IndexedDB Persistence  
- Settings Screen  
