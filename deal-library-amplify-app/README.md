# Sovrn Launchpad - Frontend

A modern, responsive web application for AI-enhanced marketing deal discovery and strategy, built with Next.js, React, and TypeScript.

## 🚀 Features

- **Deal Discovery**: Search and filter deals by multiple criteria
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Search**: Instant search with debounced input
- **Advanced Filtering**: Filter by category, status, priority, and date range
- **Interactive UI**: Modern card-based layout with hover effects
- **Mock Data**: Realistic sample data for development and testing

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup Instructions

1. **Install Node.js** (if not already installed):
   ```bash
   # Using Homebrew (macOS)
   brew install node
   
   # Or download from https://nodejs.org/
   ```

2. **Install Dependencies**:
   ```bash
   cd deal-library-frontend
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable UI components
│   ├── DealCard.tsx      # Individual deal card
│   ├── DealGrid.tsx      # Grid layout for deals
│   ├── FilterPanel.tsx   # Advanced filtering panel
│   └── SearchBar.tsx     # Search input component
├── data/                 # Mock data and constants
│   └── mockDeals.ts      # Sample deal data
├── lib/                  # Utility functions
│   └── utils.ts          # Helper functions
└── types/                # TypeScript type definitions
    └── deal.ts           # Deal-related types
```

## 🎨 Components

### DealCard
- Displays individual deal information
- Shows status, priority, value, and partner
- Responsive design with hover effects

### SearchBar
- Real-time search functionality
- Filter toggle button
- Accessible form handling

### FilterPanel
- Advanced filtering options
- Category, status, priority filters
- Date range selection
- Clear all filters functionality

### DealGrid
- Responsive grid layout
- Loading states with skeleton cards
- Empty state handling
- Click handlers for deal interaction

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Features Implemented

1. **Search Functionality**
   - Search across title, description, partner, and tags
   - Debounced input for performance
   - Real-time results

2. **Filtering System**
   - Multiple filter criteria
   - Persistent filter state
   - Clear all filters option

3. **Responsive Design**
   - Mobile-first approach
   - Grid layout adapts to screen size
   - Touch-friendly interactions

4. **Performance Optimizations**
   - Component memoization
   - Efficient re-renders
   - Loading states

## 🚀 Next Steps

### Phase 1 Completion Checklist
- [x] Project setup with Next.js and TypeScript
- [x] Component library with reusable UI components
- [x] Mock data integration
- [x] Search and filtering functionality
- [x] Responsive design implementation
- [x] Loading and empty states

### Phase 2 Preparation
- [ ] Google Sheets API integration
- [ ] Backend API development
- [ ] Database schema design
- [ ] Authentication system
- [ ] Real-time data synchronization

## 🎯 Usage

1. **Search Deals**: Use the search bar to find deals by keywords
2. **Filter Results**: Click "Filters" to access advanced filtering options
3. **View Details**: Click on any deal card to view more information
4. **Sort Results**: Use the dropdown to sort by different criteria

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1024px (two columns)
- **Desktop**: > 1024px (three columns)

## 🔍 Search Capabilities

The search functionality looks for matches in:
- Deal title
- Deal description
- Partner name
- Tags

## 🎨 Design System

- **Colors**: Primary blue, secondary gray, status colors
- **Typography**: System font stack with proper hierarchy
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable with consistent styling

## 📈 Performance

- **Bundle Size**: Optimized with Next.js automatic code splitting
- **Loading**: Skeleton states for better perceived performance
- **Images**: Optimized with Next.js Image component (when added)
- **Caching**: Efficient state management with React hooks

## 🧪 Testing

Currently using mock data for development. The application is ready for:
- Unit testing with Jest
- Integration testing with React Testing Library
- E2E testing with Playwright or Cypress

## 📝 Notes

This is the MVP version focusing on frontend functionality. The next phase will include:
- Backend API integration
- Real data from Google Sheets
- User authentication
- Advanced AI features
- Real-time updates
