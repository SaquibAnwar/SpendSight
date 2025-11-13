# 📄 PRD V1 — “SpendSight”
### Privacy-First Personal Spend Analyzer  
**Version:** 1.0  
**Author:** Saquib  
**Type:** PRD (Phase 1 MVP)

---

# 1. Product Summary

SpendSight is a **zero-login**, **zero-storage**, **privacy-first** web application that allows users to upload their **bank statements** and **credit card statements** at the end of each billing cycle and receive:

- Categorised transactions  
- Recurring expense detection  
- New expense discovery  
- Spend breakdown across categories  
- Visualization options (multiple graphs)  
- Exportable **Excel/PDF consolidated reports**

All processing is done **on-device** using browser APIs.  
Optional LLM-based categorisation is available through encrypted, ephemeral requests with **no data retention**.

---

# 2. Goals & Non-Goals (Phase 1)

## 2.1 Goals
- Allow users to upload financial statements in PDF/CSV/XLS formats  
- Parse statements **100% client-side**  
- Categorize expenses using:
  - Rule-based classification  
  - Optional LLM classification  
- Detect recurring expenses  
- Identify new merchants/spends  
- Support custom categories defined by the user  
- Provide various graphs and insights  
- Support downloadable Excel and PDF reports  
- Store category rules **locally** using IndexedDB

## 2.2 Non-Goals (Phase 1)
- No login/accounts  
- No cloud sync  
- No multi-month insights/trends  
- No budgeting  
- No automatic bank linking  
- No reward optimization logic  
- No backend database of any kind  

---

# 3. Target Users

- Individuals 25–40 managing monthly finances  
- Credit card power users  
- Privacy-conscious users  
- People who dislike apps that read SMS  
- Freelancers/business owners needing monthly clarity  

---

# 4. User Journey (Phase 1)

## 4.1 Landing Page
- Simple privacy statement  
- CTA: **Upload Statement**  
- Explanation: “Everything processed locally. No login. No storage.”

## 4.2 Upload Flow
Users upload:
- Bank statement(s)
- Credit card statement(s)

Supported formats:
- PDF  
- CSV  
- XLS / XLSX  

App validates file type and displays a parsing preview.

## 4.3 Parsing & Normalisation
The system extracts:
- Date  
- Description / Merchant  
- Amount  
- Transaction type (credit/debit)  

Outputs a **unified transaction structure**.

## 4.4 Auto Categorisation

### A) Rule-Based Categorization (Local)
- Keyword matching  
- Regex rules  
- Known merchant mappings (Uber, Zomato, Swiggy, Amazon, Fuel, etc.)

### B) Optional LLM Categorization
Encrypted payload with output in the format:
```
{ category, subcategory, confidence }
```

## 4.5 Manual Category Assignment
- Unidentified items appear in a “Review” section  
- User can pick or create categories  
- Saved as local rules in IndexedDB  

## 4.6 Recurring Expense Detection
Detects:
- Monthly subscriptions  
- Fuel patterns  
- EMI patterns  
- Daily/weekly patterns  

## 4.7 New Expense Detection
Identifies:
- New merchants not previously seen in batch  
- Not matching existing rules  
- Not part of recurring list  

## 4.8 Visualization Selector
User can choose:
- Category pie chart  
- Daily spend line chart  
- Recurring vs non-recurring bar chart  
- Top merchants  
- Category trend  

## 4.9 Report Export
Supports:
- Excel (multi-sheet)
- PDF with embedded charts

Excel contains:
1. Raw Transactions  
2. Categorised Transactions  
3. Recurring Expenses  
4. New Expenses  
5. Summary Tables  
6. Category Rules  
7. Graph Sheets  

---

# 5. Functional Requirements

## 5.1 Statement Upload
- Accept PDF, CSV, Excel  
- On-device parsing  
- Drag & drop  
- File validation  

## 5.2 Parsing Engine
- pdf.js  
- Papaparse  
- SheetJS  

## 5.3 Categorisation Engine
- Rule-based  
- Regex  
- Optional LLM  
- Confidence scoring  
- Local rule storage  

## 5.4 Recurring Detection
- Frequency analysis  
- Date tolerance ±3 days  
- Amount tolerance ±10%  

## 5.5 New Merchant Detection
- Merchant not found in rule DB  
- Not recurring  
- Not previously tagged in batch  

## 5.6 Visualization  
- Recharts / Chart.js  
- Multi-graph selection  
- Export graphs as PNG  

## 5.7 PDF & Excel Export
- jsPDF/pdf-lib  
- SheetJS  
- Graph embedding  

## 5.8 Data Privacy
- No server storage  
- Optional encrypted LLM requests  
- Local rule persistence via IndexedDB  

---

# 6. Non-Functional Requirements

### Performance
- Parsing <5s for 500 rows  
- PDF export <5s  
- Charts render <300ms  

### Security
- No server logging/storage  
- Encrypted LLM payloads  
- Local data only  

### Reliability
- Works offline after load  
- Graceful PDF parsing failure handling  

### Cross-platform
- Logic layer designed for React Native reuse  

---

# 7. Tech Stack (Phase 1)

- Next.js 15  
- React 19  
- TypeScript  
- TailwindCSS + ShadCN  
- IndexedDB (Dexie)  
- pdf.js / Papaparse / SheetJS  
- Recharts / Chart.js  
- jsPDF / pdf-lib  

Future:
- Local WebGPU LLM  
- Encrypted LLM APIs  
- Turborepo with shared core package  

---

# 8. Data Models

## Transaction
```
{
  "id": "uuid",
  "date": "string",
  "description": "string",
  "amount": 0,
  "type": "debit | credit",
  "accountType": "bank | credit-card",
  "category": "string | null",
  "subcategory": "string | null",
  "isRecurring": false,
  "isNewSpend": false
}
```

## CategoryRule
```
{
  "id": "uuid",
  "keyword": "string",
  "category": "string",
  "subcategory": "string | null",
  "createdAt": 0
}
```

## RecurringExpense
```
{
  "merchant": "string",
  "frequency": "monthly | weekly",
  "amountPattern": [],
  "averageAmount": 0
}
```

---

# 9. Core Screens (Phase 1)

1. Landing  
2. Upload  
3. Parsing Preview  
4. Categorisation Review  
5. Recurring Insights  
6. Visualization Selector  
7. Dashboard  
8. Export Modal  
9. Settings  

---

# 10. Future Roadmap

- User login  
- Multi-month trends  
- Sync across devices  
- Subscription reminders  
- Budgeting tools  
- Rewards optimization  
- Tax categorisation  

---

# 11. Phase 1 Completion Criteria

- Statement upload works  
- Parsing engine functional  
- Categorisation engine (rules + LLM)  
- Recurring + new spend detection  
- Manual categories work  
- Graph visualisation  
- Excel + PDF export  
- IndexedDB rules persist  
- No backend usage  
