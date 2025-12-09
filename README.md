# Sovrn Launchpad

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

This is a **single application** combining frontend and backend:

```
Deal-Library/
├── deal-library-amplify-app/     # Full-stack Next.js application
│   ├── src/
│   │   ├── app/                  # Pages (Next.js App Router)
│   │   │   ├── api/              # API routes (backend endpoints)
│   │   │   │   ├── deals/        # Deal search APIs
│   │   │   │   ├── audience-insights/
│   │   │   │   ├── unified-search/
│   │   │   │   └── ...           # Other API endpoints
│   │   │   ├── page.tsx          # Main chat interface
│   │   │   ├── audience-insights/
│   │   │   ├── strategy-cards/
│   │   │   └── ...               # Other pages
│   │   ├── components/           # React components
│   │   ├── lib/
│   │   │   ├── services/         # Backend services
│   │   │   ├── controllers/      # API controllers
│   │   │   └── middleware/       # Express middleware
│   │   └── types/                # TypeScript interfaces
│   ├── public/
│   │   └── data/                 # CSV data files
│   └── package.json
├── amplify.yml                   # AWS Amplify build configuration
└── README.md
```

### **Tech Stack**
- **Framework**: Next.js 14 (React 18) with App Router
- **Styling**: Tailwind CSS with brand colors
- **Charts**: Recharts for data visualization
- **Maps**: Leaflet.js for geographic visualizations
- **PDF Export**: jsPDF + html2canvas
- **AI**: Google Gemini 2.5 Flash API

## 📊 Data Sources

1. **US Census Bureau** - Demographic data (income, education, age, household size, ethnicity, etc.)
2. **Commerce Audience Data** - 2.1M records of ZIP-level commerce activity across 199 segments
3. **Overlap Data** - Pre-calculated user-level cross-purchase patterns
4. **Google Sheets** - Deal inventory managed via Apps Script

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Google Cloud API key (Gemini API)

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Deal-Library
```

2. **Install Dependencies**
```bash
cd deal-library-amplify-app
npm install
```

3. **Configure Environment Variables**

Create `.env.local` in `deal-library-amplify-app/`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
APPS_SCRIPT_URL=your_apps_script_deployment_url
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Open the app**
```
http://localhost:3000
```

## ☁️ AWS Amplify Deployment

### Option 1: Deploy from Repository Root

Use the main `amplify.yml` file at the repository root. Amplify will automatically detect and build from `deal-library-amplify-app/`.

### Option 2: Set App Root

Configure Amplify with `appRoot: deal-library-amplify-app` and use `amplify-for-approot.yml` instead.

### Environment Variables in Amplify

Set these environment variables in the Amplify Console:
- `GEMINI_API_KEY` - Your Google Gemini API key
- `APPS_SCRIPT_URL` - Your Google Apps Script deployment URL
- `RESEND_API_KEY` - (Optional) For email functionality

## 📝 API Endpoints

All API routes are handled by Next.js API routes in `src/app/api/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/deals/search` | POST | AI-powered deal search |
| `/api/unified-search` | POST | Search across all card types |
| `/api/audience-insights/generate` | POST | Generate audience insights report |
| `/api/personas` | GET | Get all personas |
| `/api/health` | GET | Health check endpoint |

## 🛠️ Development Commands

```bash
# From repository root
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint

# Or from deal-library-amplify-app/
cd deal-library-amplify-app
npm run dev
npm run build
```

## 🎨 Brand Colors

Defined in `tailwind.config.js`:
- **Gold**: #FFD42B (Primary)
- **Orange**: #FF9A00 (Secondary)
- **Coral**: #FF7B43
- **Charcoal**: #282828
- **Purple**: #D45087
- **Navy**: #2F4A7C

## 📈 Performance Optimizations

- **Standalone Output** - Optimized for serverless deployment
- **Response Caching** - In-memory and file-based caching
- **Lazy Loading** - Dynamic imports for heavy components
- **Request Timeouts** - Configurable timeout handling

## 📄 License

Proprietary - Sovrn Holdings, Inc.

---

**Built with ❤️ by the Sovrn team**
