'use client';

import React from 'react';
import { ShoppingCart, Users, Lightbulb, BarChart3, MapPin, Target, Building2, Newspaper, FileText, Award, CheckSquare, TrendingUp } from 'lucide-react';

export interface CardType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'plan' | 'activate';
}

export const CARD_TYPES: CardType[] = [
  // Plan Cards (help marketers strategize)
  {
    id: 'audience-insights',
    name: 'Audience Insights',
    icon: Lightbulb,
    description: 'Explore audience data and behavioral insights',
    category: 'plan'
  },
  {
    id: 'personas',
    name: 'Audience Personas',
    icon: Users,
    description: 'Explore detailed audience personas and their characteristics',
    category: 'plan'
  },
  {
    id: 'geographic',
    name: 'Geo Insights',
    icon: MapPin,
    description: 'Location-based audience and market data',
    category: 'plan'
  },
  {
    id: 'market-sizing',
    name: 'Market Intelligence',
    icon: BarChart3,
    description: 'Market sizing and industry analysis',
    category: 'plan'
  },
  {
    id: 'brand-strategy',
    name: 'Brand Strategy',
    icon: Award,
    description: 'Brand positioning and messaging frameworks',
    category: 'plan'
  },
  {
    id: 'company-profile',
    name: 'Company Profiles',
    icon: Building2,
    description: 'Public company financial analysis and business insights',
    category: 'plan'
  },
  {
    id: 'competitive-intelligence',
    name: 'Competitive Intelligence',
    icon: Target,
    description: 'Competitor analysis and positioning strategies',
    category: 'plan'
  },
  {
    id: 'content-strategy',
    name: 'Content Strategy',
    icon: FileText,
    description: 'Content planning and topic recommendations',
    category: 'plan'
  },
  {
    id: 'marketing-news',
    name: 'Marketing News',
    icon: Newspaper,
    description: 'Latest marketing and advertising industry headlines',
    category: 'plan'
  },
  {
    id: 'marketing-swot',
    name: 'Marketing SWOT',
    icon: TrendingUp,
    description: 'Marketing SWOT analysis for companies and campaigns',
    category: 'plan'
  },
  // Activate Cards (help marketers execute)
  {
    id: 'audiences',
    name: 'Audiences',
    icon: Users,
    description: 'Browse and select audience segments for targeting',
    category: 'activate'
  },
  {
    id: 'deals',
    name: 'Deal Opportunities',
    icon: ShoppingCart,
    description: 'Browse available advertising deals and partnerships',
    category: 'activate'
  }
];

interface CardTypeSelectorProps {
  selectedTypes: string[];
  onSelectionChange: (selectedTypes: string[]) => void;
  className?: string;
}

export default function CardTypeSelector({ 
  selectedTypes, 
  onSelectionChange, 
  className = '' 
}: CardTypeSelectorProps) {
  const toggleCardType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      // Remove from selection
      onSelectionChange(selectedTypes.filter(id => id !== typeId));
    } else {
      // Add to selection
      onSelectionChange([...selectedTypes, typeId]);
    }
  };

  const selectAllCards = () => {
    onSelectionChange(CARD_TYPES.map(card => card.id));
  };

  const clearAllCards = () => {
    onSelectionChange([]);
  };

  // Group cards by category
  const planCards = CARD_TYPES.filter(card => card.category === 'plan');
  const activateCards = CARD_TYPES.filter(card => card.category === 'activate');

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-neutral-700 whitespace-nowrap">
          Attach Card:
        </span>
        
        {/* Plan Cards */}
        <div className="flex flex-wrap gap-2">
          {planCards.map((cardType) => {
            const Icon = cardType.icon;
            const isSelected = selectedTypes.includes(cardType.id);
            
            return (
              <button
                key={cardType.id}
                onClick={() => toggleCardType(cardType.id)}
                className={`
                  relative group p-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95
                  ${isSelected 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
                title={cardType.description}
              >
                <Icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {cardType.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-neutral-800"></div>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Visual Separator */}
        <div className="w-px h-8 bg-neutral-300 mx-2"></div>
        
        {/* Activate Cards */}
        <div className="flex flex-wrap gap-2">
          {activateCards.map((cardType) => {
            const Icon = cardType.icon;
            const isSelected = selectedTypes.includes(cardType.id);
            
            return (
              <button
                key={cardType.id}
                onClick={() => toggleCardType(cardType.id)}
                className={`
                  relative group p-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95
                  ${isSelected 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'bg-white border border-orange-200 text-orange-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
                  }
                `}
                title={cardType.description}
              >
                <Icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {cardType.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-neutral-800"></div>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {selectedTypes.length > 0 && (
            <span className="text-xs text-neutral-500 whitespace-nowrap">
              {selectedTypes.length === 1 
                ? '1 selected' 
                : `${selectedTypes.length} selected`
              }
            </span>
          )}
          
          <div className="flex gap-1">
            <button
              onClick={selectAllCards}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              Select All
            </button>
            {selectedTypes.length > 0 && (
              <button
                onClick={clearAllCards}
                className="text-xs text-neutral-500 hover:text-neutral-700 font-medium px-2 py-1 rounded hover:bg-neutral-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
