# 🔍 SpendSight

**Privacy-first personal spend analyzer** — Upload your bank and credit card statements, categorize transactions with AI, detect recurring expenses, and visualize spending patterns. All processing happens locally in your browser.

[![CI](https://github.com/SaquibAnwar/SpendSight/actions/workflows/ci.yml/badge.svg)](https://github.com/SaquibAnwar/SpendSight/actions/workflows/ci.yml)

---

## ✨ Features

### 📊 Core Functionality
- **Multi-format parsing**: Upload PDF, CSV, or Excel statements
- **Smart categorization**: Rule-based + optional LLM-assisted classification
- **Privacy-first**: All data processing happens client-side in your browser
- **Recurring detection**: Automatically identify subscriptions and recurring expenses
- **New spend insights**: Spot first-time merchants and one-off purchases
- **Interactive visualizations**: Category breakdowns, daily trends, and spending patterns

### 🎨 User Experience
- **Dark/Light mode**: Toggle between themes with persistent preference
- **Session persistence**: Parsed data survives page navigation
- **Resizable columns**: Customize transaction review table layout
- **Export functionality**: Download reports as Excel or PDF
- **Responsive design**: Works seamlessly across desktop and mobile devices

### 🤖 AI Integration (Optional)
- OpenAI integration for intelligent transaction categorization
- Privacy-focused: Configurable API key, server-side proxy
- Falls back to rule-based categorization if not configured

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (with npm)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SaquibAnwar/SpendSight.git
   cd SpendSight
   ```

2. **Install dependencies**
   ```bash
   cd web
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🔧 Configuration

### LLM Setup (Optional)

To enable AI-powered categorization:

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com/)
2. Create a `.env.local` file in the `web` directory:
   ```bash
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-4o-mini  # optional, defaults to gpt-4o-mini
   ```
3. Restart the development server
4. Visit Settings in the app to enable LLM assistance

The app will work perfectly fine without LLM—it includes smart default categorization rules.

---

## 📁 Project Structure

```
SpendSight/
├── docs/                           # Product & technical documentation
│   ├── SpendSight_PRD_v1.md       # Product requirements
│   ├── SpendSight_TechSpec_FULL_v1.md  # Technical specification
│   └── QA_CHECKLIST.md            # Quality assurance checklist
├── web/                           # Next.js application
│   ├── src/
│   │   ├── app/                   # Next.js app router pages
│   │   ├── components/            # React components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Core business logic
│   │   └── types/                 # TypeScript type definitions
│   ├── public/                    # Static assets
│   └── package.json               # Dependencies
└── README.md                      # This file
```

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with React 19 (App Router)
- **TypeScript** for type safety
- **TailwindCSS** + **shadcn/ui** for styling
- **Recharts** for data visualization

### Data Processing
- **pdf.js** for PDF parsing
- **SheetJS** for Excel parsing
- **Papaparse** for CSV parsing
- **Dexie** (IndexedDB) for local storage

### Testing & Quality
- **Vitest** for unit testing
- **ESLint** for code quality
- **GitHub Actions** for CI/CD

---

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm test         # Run unit tests
```

### Running Tests

```bash
cd web
npm test
```

### Code Quality

```bash
npm run lint
```

---

## 📖 Documentation

- **[Product Requirements (PRD)](./docs/SpendSight_PRD_v1.md)** — Feature specifications, user stories, and requirements
- **[Technical Specification](./docs/SpendSight_TechSpec_FULL_v1.md)** — Architecture, data models, and implementation details
- **[QA Checklist](./docs/QA_CHECKLIST.md)** — Testing and quality assurance guidelines

---

## 🔒 Privacy & Security

- **No server uploads**: All file parsing happens in your browser
- **No data storage**: Transaction data never leaves your device
- **Optional AI**: LLM categorization is completely optional
- **Local persistence**: Data stored locally using IndexedDB and sessionStorage
- **Open source**: Review the code yourself

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Multi-format statement parsing
- ✅ Smart categorization
- ✅ Recurring detection
- ✅ Visualizations
- ✅ Export functionality

### Phase 2 (Planned)
- [ ] Mobile app (React Native)
- [ ] Budget tracking and alerts
- [ ] Multi-currency support
- [ ] Bank account sync (via Plaid/similar)
- [ ] Advanced analytics and forecasting

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Saquib Anwar** — [GitHub](https://github.com/SaquibAnwar) · [Twitter](https://twitter.com/_saquibAnwar_)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Recharts](https://recharts.org/) for visualization library
- [pdf.js](https://mozilla.github.io/pdf.js/) for PDF parsing

---

**Built with ❤️ for privacy-conscious individuals who want to understand their spending without compromising their data.**

