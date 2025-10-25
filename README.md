# Sovrn Marketing Co-Pilot

An AI-powered marketing intelligence platform that helps media professionals discover deals, analyze audiences, and generate actionable insights using real commerce data and demographic intelligence.

## 🌟 Features

### **Commerce Audience Insights**
- **199 Audience Segments** - Deep demographic and behavioral analysis for commerce audiences
- **Geographic Hotspots** - ZIP-level concentration analysis with over-indexing metrics
- **Cross-Purchase Insights** - User-level overlap data showing what else your audience buys
- **AI-Generated Personas** - Dynamic persona generation powered by Gemini 2.5 Flash
- **Strategic Recommendations** - Messaging and channel recommendations tailored to each segment

### **Deal Discovery**
- **AI-Powered Search** - Natural language search for advertising deals
- **Smart Filtering** - Filter by media type, environment, targeting, and more
- **Relevance Scoring** - Advanced algorithms match deals to your query
- **Cart & Saved Cards** - Save deals and strategy cards for later

### **Strategy Cards**
- **Audience Personas** - Curated personas with strategic insights
- **Market Sizing** - TAM/SAM analysis for key markets
- **Audience Insights** - Demographic and behavioral breakdowns
- **Geographic Insights** - Location-based targeting intelligence

## 🏗️ Architecture

### **Frontend** (`deal-library-frontend/`)
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS with Sovrn brand colors
- **Charts**: Recharts for data visualization
- **Maps**: Leaflet.js for geographic visualizations
- **PDF Export**: jsPDF + html2canvas

### **Backend** (`deal-library-backend/`)
- **Framework**: Express.js + TypeScript
- **AI**: Google Gemini 2.5 Flash API
- **Data Sources**:
  - Google Sheets (via Apps Script)
  - US Census Data (41K+ ZIP codes)
  - Commerce Audience Data (2M+ records, 199 segments)
  - User-Level Overlap Data (970 relationships)
- **Caching**: In-memory + file-based for performance

## 📊 Data Sources

1. **US Census Bureau** - Demographic data (income, education, age, household size, ethnicity, etc.)
2. **Commerce Audience Data** - 2.1M records of ZIP-level commerce activity across 199 segments
3. **Overlap Data** - Pre-calculated user-level cross-purchase patterns
4. **Google Sheets** - Deal inventory managed via Apps Script

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Google Cloud API key (Gemini API)
- Google Apps Script deployment

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Deal\ Library
```

2. **Install Frontend Dependencies**
```bash
cd deal-library-frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../deal-library-backend
npm install
```

4. **Configure Environment Variables**

Create `.env` in `deal-library-backend/`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
APPS_SCRIPT_URL=your_apps_script_deployment_url
PORT=3002
```

See `deal-library-backend/env.example` for full configuration options.

5. **Build Backend**
```bash
cd deal-library-backend
npm run build
```

6. **Start Backend**
```bash
npm start
```

7. **Start Frontend** (in a new terminal)
```bash
cd deal-library-frontend
npm run dev
```

8. **Open the app**
```
http://localhost:3000
```

## 📁 Project Structure

```
Deal Library/
├── deal-library-frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/                    # Pages (Next.js App Router)
│   │   │   ├── page.tsx            # Main chat interface
│   │   │   ├── audience-insights/  # Commerce Audience Insights tool
│   │   │   └── strategy-cards/ # Strategy Cards browser
│   │   ├── components/             # React components
│   │   ├── types/                  # TypeScript interfaces
│   │   └── lib/                    # Utilities
│   └── public/                     # Static assets
│
├── deal-library-backend/           # Express.js backend
│   ├── src/
│   │   ├── controllers/            # API controllers
│   │   ├── services/               # Business logic
│   │   │   ├── geminiService.ts    # AI integration
│   │   │   ├── audienceInsightsService.ts
│   │   │   ├── censusDataService.ts
│   │   │   ├── commerceBaselineService.ts
│   │   │   └── personaService.ts
│   │   ├── middleware/             # Express middleware
│   │   └── types/                  # TypeScript interfaces
│   └── data/                       # CSV data files
│
└── README.md                       # This file
```

## 🎨 Brand Colors

Sovrn brand colors are defined in `tailwind.config.js`:
- **Gold**: #FFD42B (Primary)
- **Orange**: #FF9A00 (Secondary)
- **Coral**: #FF7B43
- **Charcoal**: #282828
- **Purple**: #D45087
- **Navy**: #2F4A7C

## 🔧 Key Technologies

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Recharts, Leaflet
- **Backend**: Node.js, Express, TypeScript
- **AI**: Google Gemini 2.5 Flash
- **Data**: CSV parsing, vector embeddings, semantic search
- **PDF**: jsPDF, html2canvas

## 📈 Performance Optimizations

- **Commerce Baseline Caching** - 7-day cache (saves 2-3 minutes per request)
- **Audience Insights Report Caching** - 1-hour TTL
- **Gemini Response Caching** - Deduplication of repeated queries
- **Lazy Loading** - Dynamic imports for heavy components (maps, charts)
- **Request Timeouts** - 45-second frontend, 30-second backend

## 🛠️ Development

### Frontend Development
```bash
cd deal-library-frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
```

### Backend Development
```bash
cd deal-library-backend
npm run build    # Compile TypeScript
npm start        # Run compiled code
```

## 📝 API Documentation

See `deal-library-backend/README.md` for detailed API documentation.

Key endpoints:
- `POST /api/deals/search` - AI-powered deal search
- `POST /api/audience-insights/generate` - Generate audience insights report
- `POST /api/unified-search` - Search across all card types
- `GET /api/personas` - Get all personas

## 🤝 Contributing

This is a Sovrn internal project. For questions or contributions, please contact the development team.

## 📄 License

Proprietary - Sovrn Holdings, Inc.

## 🙏 Acknowledgments

- **Google Gemini API** - AI-powered insights
- **US Census Bureau** - Demographic data
- **Sovrn Data Collective** - Commerce audience data

---

**Built with ❤️ by the Sovrn team**



