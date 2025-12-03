# Deal Library Architecture

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AWS AMPLIFY HOSTING                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                        NEXT.JS APPLICATION                                  │ │
│  │                      (deal-library-frontend/)                               │ │
│  │                                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                         FRONTEND PAGES                               │   │ │
│  │  │                        (src/app/**/page.tsx)                         │   │ │
│  │  │                                                                      │   │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │ │
│  │  │  │     Home     │  │    Deals     │  │   Campaign Planner       │  │   │ │
│  │  │  │   (page.tsx) │  │ (/deals)     │  │   (/campaign-planner)    │  │   │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │ │
│  │  │                                                                      │   │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │ │
│  │  │  │  Audiences   │  │   Research   │  │   Audience Insights      │  │   │ │
│  │  │  │ (/audiences) │  │ (/research)  │  │  (/audience-insights)    │  │   │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │ │
│  │  │                                                                      │   │ │
│  │  │  ┌──────────────┐  ┌──────────────┐                                 │   │ │
│  │  │  │Market Insights│ │Strategy Cards│                                 │   │ │
│  │  │  │(/market-insights)│(/strategy-cards)│                             │   │ │
│  │  │  └──────────────┘  └──────────────┘                                 │   │ │
│  │  └─────────────────────────────────────────────────────────────────────┘   │ │
│  │                                    │                                        │ │
│  │                                    ▼                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                       REACT COMPONENTS                               │   │ │
│  │  │                     (src/components/*.tsx)                           │   │ │
│  │  │                                                                      │   │ │
│  │  │  AppLayout │ ChatInterface │ DealCard │ AudienceCard │ Sidebar     │   │ │
│  │  │  SavedCards │ PersonaDetailModal │ MarketInsightsMap │ etc.        │   │ │
│  │  └─────────────────────────────────────────────────────────────────────┘   │ │
│  │                                    │                                        │ │
│  │                                    ▼                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                      NEXT.JS API ROUTES                              │   │ │
│  │  │                      (src/app/api/**/route.ts)                       │   │ │
│  │  │                                                                      │   │ │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │   │ │
│  │  │  │ /api/deals  │  │/api/personas│  │ /api/audience-insights     │  │   │ │
│  │  │  │   GET/POST  │  │    GET      │  │        POST                │  │   │ │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │   │ │
│  │  │                                                                      │   │ │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │   │ │
│  │  │  │/api/unified-│  │/api/market- │  │ /api/campaign-planner/     │  │   │ │
│  │  │  │   search    │  │   sizing    │  │      parse-brief           │  │   │ │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │   │ │
│  │  │                                                                      │   │ │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │   │ │
│  │  │  │/api/research│  │ /api/health │  │ /api/agent-mode/           │  │   │ │
│  │  │  │   CRUD      │  │    GET      │  │   generate-recommendation  │  │   │ │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │   │ │
│  │  └─────────────────────────────────────────────────────────────────────┘   │ │
│  │                                    │                                        │ │
│  │                                    ▼                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                      BACKEND SERVICES                                │   │ │
│  │  │                    (src/lib/services/*.ts)                           │   │ │
│  │  │                                                                      │   │ │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │   │ │
│  │  │  │  GeminiService  │  │ PersonaService  │  │ AudienceInsights   │  │   │ │
│  │  │  │   (AI/LLM)      │  │                 │  │    Service         │  │   │ │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │   │ │
│  │  │                                                                      │   │ │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │   │ │
│  │  │  │ MarketInsights  │  │  CacheService   │  │   RAG Service      │  │   │ │
│  │  │  │    Service      │  │                 │  │   (Embeddings)     │  │   │ │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │   │ │
│  │  │                                                                      │   │ │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │   │ │
│  │  │  │CensusDataService│  │CommerceAudience │  │  SupabaseService   │  │   │ │
│  │  │  │                 │  │    Service      │  │                    │  │   │ │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │   │ │
│  │  └─────────────────────────────────────────────────────────────────────┘   │ │
│  │                                    │                                        │ │
│  └────────────────────────────────────┼────────────────────────────────────┘   │
│                                       │                                         │
└───────────────────────────────────────┼─────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │   Google AI     │  │    Supabase     │  │     Google Sheets               │  │
│  │    (Gemini)     │  │   (Database)    │  │    (Apps Script)                │  │
│  │                 │  │                 │  │                                 │  │
│  │  - AI Chat      │  │  - Census Data  │  │  - Deal Data                    │  │
│  │  - Insights     │  │  - Personas     │  │  - Custom Deal Requests         │  │
│  │  - Search       │  │  - Research     │  │                                 │  │
│  │  - Strategy     │  │  - Cache        │  │                                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────▶│   Browser    │────▶│  Next.js     │────▶│   API        │
│  (Browser)   │     │   (React)    │     │   Server     │     │   Routes     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
                     ┌────────────────────────────────────────────────────────┐
                     │                    Services Layer                       │
                     │                                                         │
                     │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
                     │  │ Gemini   │  │ Supabase │  │  Cache   │  │ Google │ │
                     │  │ Service  │  │ Service  │  │ Service  │  │ Sheets │ │
                     │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
                     └────────────────────────────────────────────────────────┘
                                          │
                                          ▼
                     ┌────────────────────────────────────────────────────────┐
                     │                External APIs                            │
                     │  Google AI │ Supabase Database │ Google Apps Script    │
                     └────────────────────────────────────────────────────────┘
```

## Directory Structure

```
Deal-Library/
├── package.json                    # Root package.json (delegates to frontend)
├── amplify.yml                     # AWS Amplify build configuration
│
├── deal-library-frontend/          # ★ MAIN APPLICATION ★
│   ├── package.json                # All dependencies
│   ├── next.config.js              # Next.js configuration
│   ├── tsconfig.json               # TypeScript configuration
│   │
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── page.tsx            # Home page
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── deals/              # Deals page
│   │   │   ├── audiences/          # Audiences page
│   │   │   ├── research/           # Research Library page
│   │   │   ├── campaign-planner/   # Campaign Planner page
│   │   │   ├── market-insights/    # Market Insights page
│   │   │   ├── audience-insights/  # Audience Insights page
│   │   │   ├── strategy-cards/     # Strategy Cards page
│   │   │   │
│   │   │   └── api/                # API Routes (Server-side)
│   │   │       ├── health/         # Health check endpoint
│   │   │       ├── deals/          # Deals CRUD
│   │   │       ├── personas/       # Personas endpoint
│   │   │       ├── unified-search/ # Unified search
│   │   │       ├── audience-insights/
│   │   │       ├── market-sizing/
│   │   │       ├── research/
│   │   │       └── ...
│   │   │
│   │   ├── components/             # React Components
│   │   │   ├── AppLayout.tsx       # Main layout with sidebar
│   │   │   ├── ChatInterface.tsx   # AI chat interface
│   │   │   ├── DealCard.tsx        # Deal display card
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   └── ...
│   │   │
│   │   ├── lib/                    # Server-side code
│   │   │   ├── services/           # Business logic services
│   │   │   │   ├── geminiService.ts
│   │   │   │   ├── supabaseService.ts
│   │   │   │   ├── personaService.ts
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── controllers/        # Request handlers
│   │   │       ├── dealsController.ts
│   │   │       └── ...
│   │   │
│   │   └── types/                  # TypeScript type definitions
│   │       ├── deal.ts
│   │       ├── audience.ts
│   │       └── ...
│   │
│   └── public/
│       └── data/                   # Static data files (CSV, JSON)
│
└── deal-library-backend/           # ⚠️ LEGACY - NOT USED BY MAIN APP
    └── (Original Express server - can be removed)
```

## Key Features

| Feature | Description | Services Used |
|---------|-------------|---------------|
| **Deal Search** | AI-powered deal discovery | Gemini, Google Sheets |
| **Audience Insights** | Demographic analysis | Gemini, Census Data |
| **Market Sizing** | TAM/SAM/SOM analysis | Gemini |
| **Campaign Planner** | Campaign brief parsing | Gemini |
| **Research Library** | Document management | Supabase |
| **Geographic Analysis** | Location-based insights | Census Data, Supabase |
| **Personas** | Audience persona generation | Gemini |

## Environment Variables

```env
# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
USE_SUPABASE=true

# Google Integration
GOOGLE_APPS_SCRIPT_URL=your_apps_script_url

# Application
NEXT_PUBLIC_API_URL=https://your-app-url.amplifyapp.com
```

