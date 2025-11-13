## SpendSight — Privacy-first Spend Analyzer

SpendSight is a zero-login, zero-storage web application for analysing monthly bank
and credit card statements entirely on-device. Upload statements, review recurring
patterns, discover new merchants, and export Excel/PDF reports without sending data
to a server.

### Features

- Drag-and-drop upload for PDF, CSV, and Excel statements.
- Unified transaction normalisation with rule-based categorisation.
- Optional LLM assistance (disabled by default) for uncategorised items.
- Recurring expense & new merchant detection dashboards.
- Interactive visualisations powered by Recharts.
- One-click Excel and PDF report exports.
- Settings page to manage privacy controls and clear local storage.

## Getting Started

```bash
npm install      # install dependencies
npm run dev      # start the development server on http://localhost:3000
```

Project scripts:

| Command          | Description                               |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Start Next.js in development mode         |
| `npm run lint`   | Run ESLint over the project               |
| `npm test`       | Run unit tests with Vitest + RTL          |
| `npm run build`  | Production build (used by CI)             |
| `npm run start`  | Serve the production build                |

### Optional LLM configuration

LLM categorisation is opt-in. Provide the following environment variables to enable
the "Classify with LLM" button (the endpoint must accept the payload described in
`src/lib/categorization/llm-classifier.ts`):

```bash
NEXT_PUBLIC_LLM_ENDPOINT=https://your-llm-endpoint.example.com/categorise
NEXT_PUBLIC_LLM_API_KEY=optional-key
```

Users can toggle LLM usage on the `/settings` page. The preference is stored in
`localStorage` on the client.

## Exports

- **Excel (.xlsx)**: includes raw transactions, categorised view, recurring findings,
  new merchants, summaries, and saved rules.
- **PDF (.pdf)**: textual summary of totals with optional chart snapshot.

Exports run fully in the browser. The generated files never leave the device.

## Privacy & offline behaviour

- No backend storage or analytics.
- All data processing lives inside the browser tab.
- Saved rules and preferences live in IndexedDB/localStorage and can be wiped from
  the `/settings` page.
- The app continues to function offline after the initial load.

## Testing & QA

Automated coverage uses `eslint` + `vitest`. Manual smoke checks are captured in
`docs/QA_CHECKLIST.md`. CI (GitHub Actions) runs lint → test → build to gate changes.

## License

This project is distributed for internal micro-SaaS development. Update the licence
section to match your deployment needs.
